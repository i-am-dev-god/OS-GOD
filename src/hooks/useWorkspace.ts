'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  cloudDeleteObject,
  cloudDeleteQuery,
  cloudFetchObject,
  cloudFetchObjects,
  cloudFetchQueries,
  cloudFetchSettings,
  cloudFetchVersions,
  cloudInsertObject,
  cloudPutQuery,
  cloudPutSettings,
  cloudSyncLinks,
  cloudUpdateObject,
} from '@/lib/cloud';
import { localDB } from '@/lib/local-db';
import { createSeedWorkspace, defaultSettings } from '@/lib/seed';
import {
  authCallbackError,
  cleanAuthCallback,
  fetchGitHubEnabled,
  getSupabase,
  getVerifiedUser,
  signInWithGitHub,
  signOutGitHub,
} from '@/lib/supabase';
import type { AuthState, OSObject, ObjectVersion, OutboxEntry, QueryDefinition, SavedQuery, Settings, Toast } from '@/lib/types';
import { downloadText, emptyQuery, errorMessage, exportPayload, nowISO, objectToMarkdown, resolveLinks, uuid } from '@/lib/utils';
import { objectInputSchema, parseImportPayload, queryDefinitionSchema, settingsSchema, type ObjectInput } from '@/lib/validation';

const LOCAL_OWNER = 'local';

export function useWorkspace() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading', user: null, cloudConfigured: false, githubEnabled: null, error: null });
  const [objects, setObjectsState] = useState<OSObject[]>([]);
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const namespaceRef = useRef(LOCAL_OWNER);
  const objectsRef = useRef<OSObject[]>([]);
  const flushingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const applyObjects = useCallback((updater: (previous: OSObject[]) => OSObject[]) => {
    setObjectsState((previous) => {
      const next = updater(previous);
      objectsRef.current = next;
      return next;
    });
  }, []);

  const notify = useCallback((title: string, description?: string, tone: Toast['tone'] = 'info') => {
    const id = uuid();
    setToasts((previous) => [...previous.slice(-3), { id, title, description, tone }]);
    setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((previous) => previous.filter((toast) => toast.id !== id)), []);

  useEffect(() => {
    supabaseRef.current = getSupabase();
    const supabase = supabaseRef.current;
    const cloudConfigured = Boolean(supabase);
    let mounted = true;
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    const callbackError = authCallbackError();

    fetchGitHubEnabled().then((githubEnabled) => {
      if (!mounted) return;
      setAuth((previous) => ({ ...previous, cloudConfigured, githubEnabled }));
    });

    getVerifiedUser()
      .then((user) => {
        if (!mounted) return;
        setAuth((previous) => ({ status: user ? 'authenticated' : 'local', user, cloudConfigured, githubEnabled: previous.githubEnabled, error: callbackError }));
        cleanAuthCallback();
      })
      .catch((error) => {
        if (!mounted) return;
        setAuth((previous) => ({ status: 'local', user: null, cloudConfigured, githubEnabled: previous.githubEnabled, error: errorMessage(error) }));
        cleanAuthCallback();
      });

    const subscription = supabase?.auth.onAuthStateChange((event, _session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setAuth((previous) => ({ ...previous, status: 'local', user: null, error: null }));
        cleanAuthCallback();
        return;
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Never trust session.user alone; verify with the auth server before switching namespaces.
        void getVerifiedUser().then((user) => {
          if (!mounted) return;
          setAuth((previous) => ({ ...previous, status: user ? 'authenticated' : previous.status, user, error: null }));
        });
        if (event === 'SIGNED_IN') cleanAuthCallback();
      }
    });

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const flushOutbox = useCallback(async () => {
    const supabase = supabaseRef.current;
    const ownerId = namespaceRef.current;
    if (!supabase || ownerId === LOCAL_OWNER || flushingRef.current || !navigator.onLine) return;
    flushingRef.current = true;
    setSyncing(true);
    setSyncError(null);
    try {
      const entries = (await localDB.outbox(ownerId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const entry of entries) {
        if (entry.op === 'delete') {
          await cloudDeleteObject(supabase, ownerId, entry.objectId);
          await localDB.deleteOutbox(ownerId, entry.id);
          continue;
        }
        const current = objectsRef.current.find((object) => object.id === entry.objectId);
        if (!current) {
          await localDB.deleteOutbox(ownerId, entry.id);
          continue;
        }
        let saved: OSObject | null = null;
        if (entry.baseVersion <= 0) {
          try {
            saved = await cloudInsertObject(supabase, ownerId, current);
          } catch (error) {
            const existing = await cloudFetchObject(supabase, ownerId, current.id);
            if (!existing) throw error;
            saved = await cloudUpdateObject(supabase, ownerId, current, existing.version);
            if (!saved) saved = existing;
          }
        } else {
          saved = await cloudUpdateObject(supabase, ownerId, current, entry.baseVersion);
          if (!saved) {
            const remote = await cloudFetchObject(supabase, ownerId, current.id);
            if (remote) {
              const conflict: OSObject = {
                ...current,
                id: uuid(),
                title: `Conflict — ${current.title}`.slice(0, 200),
                version: 1,
                baseVersion: 0,
                sync: 'pending',
                created_at: nowISO(),
                updated_at: nowISO(),
              };
              const savedConflict = await cloudInsertObject(supabase, ownerId, conflict);
              await localDB.putObject(ownerId, savedConflict);
              applyObjects((previous) => [...previous.map((object) => (object.id === remote.id ? remote : object)), savedConflict]);
              notify('Conflict kept safely', 'A conflicting edit was saved as a separate conflict copy.', 'error');
              await localDB.deleteOutbox(ownerId, entry.id);
              continue;
            }
            saved = await cloudInsertObject(supabase, ownerId, current);
          }
        }
        if (!saved) throw new Error('Sync returned no object');
        const targets = resolveLinks(saved, objectsRef.current).map((object) => object.id);
        await cloudSyncLinks(supabase, ownerId, saved.id, targets);
        await localDB.putObject(ownerId, saved);
        await localDB.deleteOutbox(ownerId, entry.id);
        applyObjects((previous) => previous.map((object) => (object.id === saved.id ? saved : object)));
      }
    } catch (error) {
      const message = errorMessage(error, 'Sync failed');
      setSyncError(message);
      notify('Sync paused', message, 'error');
    } finally {
      flushingRef.current = false;
      setSyncing(false);
    }
  }, [applyObjects, notify]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => void flushOutbox(), 600);
  }, [flushOutbox]);

  useEffect(() => {
    if (auth.status === 'loading') return;
    let cancelled = false;
    const namespace = auth.user?.id ?? LOCAL_OWNER;
    namespaceRef.current = namespace;
    setLoading(true);

    async function load() {
      const cachedObjects = await localDB.objects(namespace);
      const cachedQueries = await localDB.queries(namespace);
      const cachedSettings = await localDB.settings(namespace);
      let nextObjects = cachedObjects;
      let nextQueries = cachedQueries;
      let nextSettings = cachedSettings ?? defaultSettings();
      const supabase = supabaseRef.current;

      if (namespace === LOCAL_OWNER && cachedObjects.length === 0 && cachedQueries.length === 0 && !cachedSettings) {
        const seed = createSeedWorkspace();
        nextObjects = seed.objects;
        nextQueries = seed.queries;
        nextSettings = {
          ...defaultSettings(),
          windows: [
            { id: uuid(), view: 'object', objectId: seed.welcomeId, title: 'Welcome to OS-GOD', rect: { x: 24, y: 24, w: 600, h: 500 }, z: 2, minimized: false, maximized: false },
            { id: uuid(), view: 'query', queryId: seed.openTasksQueryId, title: 'Open tasks', rect: { x: 300, y: 110, w: 420, h: 420 }, z: 1, minimized: false, maximized: false },
          ],
        };
        await localDB.putObjects(namespace, nextObjects);
        for (const query of nextQueries) await localDB.putQuery(namespace, query);
        await localDB.putSettings(namespace, nextSettings);
      } else if (supabase && namespace !== LOCAL_OWNER) {
        const [remoteObjects, remoteQueries, remoteSettings] = await Promise.all([
          cloudFetchObjects(supabase, namespace),
          cloudFetchQueries(supabase, namespace),
          cloudFetchSettings(supabase, namespace),
        ]);
        const pending = new Set((await localDB.outbox(namespace)).map((entry) => entry.objectId));
        const remoteById = new Map(remoteObjects.map((object) => [object.id, object]));
        const merged = remoteObjects.map((object) => {
          const local = cachedObjects.find((candidate) => candidate.id === object.id);
          return local && pending.has(object.id) ? local : object;
        });
        for (const local of cachedObjects) {
          if (pending.has(local.id) && !remoteById.has(local.id)) merged.push(local);
        }
        nextObjects = merged;
        nextQueries = remoteQueries.length || cachedQueries.length ? remoteQueries : cachedQueries;
        nextSettings = remoteSettings ?? cachedSettings ?? defaultSettings();
        await localDB.putObjects(namespace, remoteObjects);
        for (const query of remoteQueries) await localDB.putQuery(namespace, query);
        await localDB.putSettings(namespace, nextSettings);
      }

      if (cancelled) return;
      nextSettings = settingsSchema.parse(nextSettings);
      applyObjects(() => nextObjects);
      setQueries(nextQueries);
      setSettingsState(nextSettings);
      setLoading(false);
      if (namespace !== LOCAL_OWNER) void flushOutbox();
    }

    load().catch((error) => {
      if (cancelled) return;
      setLoading(false);
      setSyncError(errorMessage(error, 'Failed to load workspace'));
      notify('Workspace load failed', errorMessage(error), 'error');
    });
    return () => {
      cancelled = true;
    };
  }, [auth.status, auth.user?.id, applyObjects, flushOutbox, notify]);

  useEffect(() => {
    if (loading) return;
    const namespace = namespaceRef.current;
    if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    settingsTimerRef.current = setTimeout(() => {
      const parsed = settingsSchema.safeParse(settings);
      if (!parsed.success) return;
      void localDB.putSettings(namespace, parsed.data);
      const supabase = supabaseRef.current;
      if (supabase && namespace !== LOCAL_OWNER && navigator.onLine) {
        cloudPutSettings(supabase, namespace, parsed.data).catch((error) => setSyncError(errorMessage(error)));
      }
    }, 500);
    return () => {
      if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    };
  }, [settings, loading]);

  useEffect(() => {
    if (online && auth.status === 'authenticated') void flushOutbox();
  }, [online, auth.status, flushOutbox]);

  const updateSettings = useCallback((patch: Partial<Settings> | ((previous: Settings) => Settings)) => {
    setSettingsState((previous) => {
      const next = typeof patch === 'function' ? patch(previous) : { ...previous, ...patch };
      return settingsSchema.parse(next);
    });
  }, []);

  const queueOutbox = useCallback(async (object: OSObject, op: OutboxEntry['op']) => {
    const namespace = namespaceRef.current;
    if (namespace === LOCAL_OWNER) return;
    const existing = (await localDB.outbox(namespace)).find((entry) => entry.objectId === object.id);
    const entry: OutboxEntry = {
      id: existing?.id ?? uuid(),
      objectId: object.id,
      op,
      payload: object,
      baseVersion: existing?.baseVersion ?? object.baseVersion,
      createdAt: existing?.createdAt ?? nowISO(),
    };
    await localDB.putOutbox(namespace, entry);
    scheduleFlush();
  }, [scheduleFlush]);

  const createObject = useCallback(async (input: ObjectInput) => {
    const parsed = objectInputSchema.parse(input);
    const namespace = namespaceRef.current;
    const now = nowISO();
    const object: OSObject = {
      id: uuid(), owner_id: namespace, kind: parsed.kind, title: parsed.title, body: parsed.body, status: parsed.status,
      tags: parsed.tags, due_date: parsed.due_date, version: 1, created_at: now, updated_at: now, deleted_at: parsed.deleted_at ?? null,
      sync: namespace === LOCAL_OWNER ? 'local' : 'pending', baseVersion: 0,
    };
    applyObjects((previous) => [object, ...previous]);
    await localDB.putObject(namespace, object);
    await localDB.putVersion(namespace, { id: uuid(), object_id: object.id, owner_id: namespace, version: 1, kind: object.kind, title: object.title, body: object.body, status: object.status, tags: object.tags, due_date: object.due_date, deleted_at: object.deleted_at, created_at: now });
    await queueOutbox(object, 'upsert');
    return object;
  }, [applyObjects, queueOutbox]);

  const updateObject = useCallback(async (id: string, patch: Partial<ObjectInput>) => {
    const namespace = namespaceRef.current;
    const current = objectsRef.current.find((object) => object.id === id);
    if (!current) return null;
    const parsed = objectInputSchema.parse({
      kind: patch.kind ?? current.kind,
      title: patch.title ?? current.title,
      body: patch.body ?? current.body,
      status: patch.status ?? current.status,
      tags: patch.tags ?? current.tags,
      due_date: patch.due_date === undefined ? current.due_date : patch.due_date,
      deleted_at: patch.deleted_at === undefined ? current.deleted_at : patch.deleted_at,
    });
    const changed = parsed.title !== current.title || parsed.body !== current.body || parsed.kind !== current.kind || parsed.status !== current.status || JSON.stringify(parsed.tags) !== JSON.stringify(current.tags) || parsed.due_date !== current.due_date || (parsed.deleted_at ?? null) !== current.deleted_at;
    const next: OSObject = {
      ...current, ...parsed, deleted_at: parsed.deleted_at ?? null,
      version: changed ? current.version + 1 : current.version,
      updated_at: nowISO(),
      sync: namespace === LOCAL_OWNER ? 'local' : 'pending',
    };
    applyObjects((previous) => previous.map((object) => (object.id === id ? next : object)));
    await localDB.putObject(namespace, next);
    if (changed) {
      await localDB.putVersion(namespace, { id: uuid(), object_id: id, owner_id: namespace, version: next.version, kind: next.kind, title: next.title, body: next.body, status: next.status, tags: next.tags, due_date: next.due_date, deleted_at: next.deleted_at, created_at: next.updated_at });
    }
    await queueOutbox(next, 'upsert');
    return next;
  }, [applyObjects, queueOutbox]);

  const deleteObject = useCallback((id: string) => updateObject(id, { deleted_at: nowISO() }), [updateObject]);
  const restoreObject = useCallback((id: string) => updateObject(id, { deleted_at: null }), [updateObject]);

  const destroyObject = useCallback(async (id: string) => {
    const namespace = namespaceRef.current;
    applyObjects((previous) => previous.filter((object) => object.id !== id));
    await localDB.deleteObject(namespace, id);
    if (namespace !== LOCAL_OWNER) {
      const existing = (await localDB.outbox(namespace)).find((entry) => entry.objectId === id);
      await localDB.putOutbox(namespace, { id: existing?.id ?? uuid(), objectId: id, op: 'delete', payload: {}, baseVersion: 0, createdAt: existing?.createdAt ?? nowISO() });
      scheduleFlush();
    }
  }, [applyObjects, scheduleFlush]);

  const saveQuery = useCallback(async (name: string, definition: QueryDefinition, id?: string) => {
    const namespace = namespaceRef.current;
    const parsed = queryDefinitionSchema.parse(definition);
    const now = nowISO();
    const query: SavedQuery = { id: id ?? uuid(), owner_id: namespace, name: name.trim().slice(0, 80) || 'Saved query', definition: parsed, created_at: now, updated_at: now };
    setQueries((previous) => [query, ...previous.filter((candidate) => candidate.id !== query.id)]);
    await localDB.putQuery(namespace, query);
    const supabase = supabaseRef.current;
    if (supabase && namespace !== LOCAL_OWNER) {
      const saved = await cloudPutQuery(supabase, namespace, query);
      setQueries((previous) => previous.map((candidate) => (candidate.id === saved.id ? saved : candidate)));
      await localDB.putQuery(namespace, saved);
    }
    return query;
  }, []);

  const deleteQuery = useCallback(async (id: string) => {
    const namespace = namespaceRef.current;
    setQueries((previous) => previous.filter((query) => query.id !== id));
    await localDB.deleteQuery(namespace, id);
    const supabase = supabaseRef.current;
    if (supabase && namespace !== LOCAL_OWNER) await cloudDeleteQuery(supabase, namespace, id);
  }, []);

  const loadVersions = useCallback(async (objectId: string): Promise<ObjectVersion[]> => {
    const namespace = namespaceRef.current;
    const local = await localDB.versions(namespace, objectId);
    const supabase = supabaseRef.current;
    if (!supabase || namespace === LOCAL_OWNER) return local;
    const remote = await cloudFetchVersions(supabase, namespace, objectId);
    const byVersion = new Map<number, ObjectVersion>();
    for (const version of [...remote, ...local]) byVersion.set(version.version, version);
    return Array.from(byVersion.values()).sort((a, b) => b.version - a.version).slice(0, 50);
  }, []);

  const restoreVersion = useCallback(async (objectId: string, version: ObjectVersion) => {
    return updateObject(objectId, { kind: version.kind, title: version.title, body: version.body, status: version.status, tags: version.tags, due_date: version.due_date, deleted_at: null });
  }, [updateObject]);

  const importPayload = useCallback(async (raw: unknown) => {
    const payload = parseImportPayload(raw);
    const created: OSObject[] = [];
    for (const item of payload.objects) {
      const object = await createObject({ kind: item.kind, title: item.title, body: item.body, status: item.status, tags: item.tags, due_date: item.due_date });
      created.push(object);
    }
    for (const query of payload.queries ?? []) await saveQuery(query.name, query.definition);
    notify('Import complete', `${created.length} objects imported`, 'success');
    return created;
  }, [createObject, saveQuery, notify]);

  const copyLocalToCloud = useCallback(async () => {
    const supabase = supabaseRef.current;
    const ownerId = namespaceRef.current;
    if (!supabase || ownerId === LOCAL_OWNER) throw new Error('Sign in first');
    const localObjects = (await localDB.objects(LOCAL_OWNER)).filter((object) => !object.deleted_at).slice(0, 100);
    let count = 0;
    for (const localObject of localObjects) {
      const copy: OSObject = { ...localObject, id: uuid(), owner_id: ownerId, version: 1, baseVersion: 0, sync: 'pending', created_at: nowISO(), updated_at: nowISO() };
      const saved = await cloudInsertObject(supabase, ownerId, copy);
      await localDB.putObject(ownerId, saved);
      applyObjects((previous) => [saved, ...previous.filter((object) => object.id !== saved.id)]);
      count += 1;
    }
    const all = objectsRef.current;
    for (const object of all.filter((candidate) => candidate.owner_id === ownerId)) {
      await cloudSyncLinks(supabase, ownerId, object.id, resolveLinks(object, all).map((target) => target.id));
    }
    notify('Local workspace connected', `${count} objects copied into your cloud workspace`, 'success');
  }, [applyObjects, notify]);

  const exportJSON = useCallback(() => {
    downloadText(`os-god-export-${nowISO().slice(0, 10)}.json`, JSON.stringify(exportPayload(objectsRef.current.filter((object) => !object.deleted_at), queries), null, 2), 'application/json');
  }, [queries]);

  const exportMarkdown = useCallback(() => {
    const text = objectsRef.current.filter((object) => !object.deleted_at).map(objectToMarkdown).join('\n\n---\n\n');
    downloadText(`os-god-export-${nowISO().slice(0, 10)}.md`, text, 'text/markdown;charset=utf-8');
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGitHub();
  }, []);

  const signOut = useCallback(async () => {
    const namespace = namespaceRef.current;
    await signOutGitHub();
    if (namespace !== LOCAL_OWNER) await localDB.destroy(namespace);
    namespaceRef.current = LOCAL_OWNER;
    setAuth((previous) => ({ ...previous, status: 'local', user: null, error: null }));
    notify('Signed out', 'Cloud cache cleared from this browser. Your local workspace remains.', 'success');
  }, [notify]);

  const clearLocalData = useCallback(async () => {
    const namespace = namespaceRef.current;
    await localDB.clear(namespace);
    applyObjects(() => []);
    setQueries([]);
    setSettingsState(defaultSettings());
    notify('Workspace cleared', namespace === LOCAL_OWNER ? 'Local browser data cleared' : 'Local cloud cache cleared', 'success');
  }, [applyObjects, notify]);

  return {
    auth, objects, queries, settings, loading, syncing, syncError, online, toasts,
    namespace: auth.user?.id ?? LOCAL_OWNER,
    notify, dismissToast, updateSettings, createObject, updateObject, deleteObject, restoreObject, destroyObject,
    saveQuery, deleteQuery, loadVersions, restoreVersion, importPayload, copyLocalToCloud,
    exportJSON, exportMarkdown, signIn, signOut, clearLocalData, syncNow: flushOutbox,
    emptyQuery,
  };
}

export type WorkspaceAPI = ReturnType<typeof useWorkspace>;
