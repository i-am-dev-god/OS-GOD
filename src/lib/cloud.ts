import type { SupabaseClient } from '@supabase/supabase-js';
import type { OSObject, ObjectVersion, SavedQuery, Settings } from './types';
import { objectInputSchema, queryDefinitionSchema, settingsSchema } from './validation';

const OBJECT_COLUMNS = 'id,owner_id,kind,title,body,status,tags,due_date,version,created_at,updated_at,deleted_at';

function rowToObject(row: Record<string, unknown>): OSObject {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    kind: row.kind as OSObject['kind'],
    title: String(row.title),
    body: String(row.body ?? ''),
    status: row.status as OSObject['status'],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    due_date: row.due_date ? String(row.due_date) : null,
    version: Number(row.version ?? 1),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    sync: 'synced',
    baseVersion: Number(row.version ?? 1),
  };
}

export function objectPayload(object: OSObject) {
  return objectInputSchema.parse({
    kind: object.kind,
    title: object.title,
    body: object.body,
    status: object.status,
    tags: object.tags,
    due_date: object.due_date,
    deleted_at: object.deleted_at,
  });
}

export async function cloudFetchObjects(supabase: SupabaseClient, ownerId: string): Promise<OSObject[]> {
  const objects: OSObject[] = [];
  const pageSize = 1000;
  for (let page = 0; page < 6; page += 1) {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from('objects')
      .select(OBJECT_COLUMNS)
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as Record<string, unknown>[];
    objects.push(...rows.map(rowToObject));
    if (rows.length < pageSize) break;
  }
  return objects;
}

export async function cloudFetchObject(supabase: SupabaseClient, ownerId: string, id: string): Promise<OSObject | null> {
  const { data, error } = await supabase.from('objects').select(OBJECT_COLUMNS).eq('owner_id', ownerId).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToObject(data as Record<string, unknown>) : null;
}

export async function cloudInsertObject(supabase: SupabaseClient, ownerId: string, object: OSObject): Promise<OSObject> {
  const payload = objectPayload(object);
  const { data, error } = await supabase
    .from('objects')
    .insert({ id: object.id, owner_id: ownerId, ...payload })
    .select(OBJECT_COLUMNS)
    .single();
  if (error) throw error;
  return rowToObject(data as Record<string, unknown>);
}

export async function cloudUpdateObject(
  supabase: SupabaseClient,
  ownerId: string,
  object: OSObject,
  baseVersion: number,
): Promise<OSObject | null> {
  const payload = objectPayload(object);
  const { data, error } = await supabase
    .from('objects')
    .update(payload)
    .eq('owner_id', ownerId)
    .eq('id', idOf(object))
    .eq('version', baseVersion)
    .select(OBJECT_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToObject(data as Record<string, unknown>) : null;
}

function idOf(object: OSObject) {
  return object.id;
}

export async function cloudDeleteObject(supabase: SupabaseClient, ownerId: string, id: string): Promise<void> {
  const { error } = await supabase.from('objects').delete().eq('owner_id', ownerId).eq('id', id);
  if (error) throw error;
}

export async function cloudFetchVersions(supabase: SupabaseClient, ownerId: string, objectId: string): Promise<ObjectVersion[]> {
  const { data, error } = await supabase
    .from('object_versions')
    .select('id,object_id,owner_id,version,kind,title,body,status,tags,due_date,deleted_at,created_at')
    .eq('owner_id', ownerId)
    .eq('object_id', objectId)
    .order('version', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ObjectVersion[];
}

export async function cloudSyncLinks(supabase: SupabaseClient, ownerId: string, sourceId: string, targetIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from('links').delete().eq('owner_id', ownerId).eq('source_id', sourceId);
  if (deleteError) throw deleteError;
  const unique = Array.from(new Set(targetIds)).filter((id) => id !== sourceId).slice(0, 100);
  if (!unique.length) return;
  const { error } = await supabase.from('links').insert(unique.map((targetId) => ({ owner_id: ownerId, source_id: sourceId, target_id: targetId })));
  if (error) throw error;
}

export async function cloudFetchQueries(supabase: SupabaseClient, ownerId: string): Promise<SavedQuery[]> {
  const { data, error } = await supabase.from('saved_queries').select('*').eq('owner_id', ownerId).order('updated_at', { ascending: false }).limit(100);
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    owner_id: String(row.owner_id),
    name: String(row.name),
    definition: queryDefinitionSchema.parse(row.definition),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }));
}

export async function cloudPutQuery(supabase: SupabaseClient, ownerId: string, query: SavedQuery): Promise<SavedQuery> {
  const payload = { id: query.id, owner_id: ownerId, name: query.name, definition: queryDefinitionSchema.parse(query.definition) };
  const { data, error } = await supabase.from('saved_queries').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  const row = data as Record<string, unknown>;
  return { id: String(row.id), owner_id: String(row.owner_id), name: String(row.name), definition: queryDefinitionSchema.parse(row.definition), created_at: String(row.created_at), updated_at: String(row.updated_at) };
}

export async function cloudDeleteQuery(supabase: SupabaseClient, ownerId: string, id: string): Promise<void> {
  const { error } = await supabase.from('saved_queries').delete().eq('owner_id', ownerId).eq('id', id);
  if (error) throw error;
}

export async function cloudFetchSettings(supabase: SupabaseClient, ownerId: string): Promise<Settings | null> {
  const { data, error } = await supabase.from('user_settings').select('state,theme,quality').eq('owner_id', ownerId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const state = typeof row.state === 'object' && row.state ? row.state : {};
  return settingsSchema.parse({ ...state, theme: row.theme, quality: row.quality });
}

export async function cloudPutSettings(supabase: SupabaseClient, ownerId: string, settings: Settings): Promise<void> {
  const parsed = settingsSchema.parse(settings);
  const { theme, quality, ...state } = parsed;
  const { error } = await supabase.from('user_settings').upsert({ owner_id: ownerId, state, theme, quality }, { onConflict: 'owner_id' });
  if (error) throw error;
}
