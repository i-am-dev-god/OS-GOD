import type { OSObject, ObjectVersion, OutboxEntry, SavedQuery, Settings } from './types';

const DB_VERSION = 1;
const stores = ['objects', 'versions', 'queries', 'settings', 'outbox'] as const;
type StoreName = (typeof stores)[number];
const connections = new Map<string, IDBDatabase>();

function assertBrowser() {
  if (typeof indexedDB === 'undefined') throw new Error('Local database is unavailable in this browser');
}

function dbName(namespace: string) {
  return `os-god-v1-${namespace.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64) || 'local'}`;
}

function openDB(namespace: string): Promise<IDBDatabase> {
  assertBrowser();
  const name = dbName(namespace);
  const existing = connections.get(name);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) {
          const objectStore = db.createObjectStore(store, { keyPath: store === 'settings' ? 'key' : 'id' });
          if (store === 'versions') objectStore.createIndex('object_id', 'object_id', { unique: false });
          if (store === 'outbox') objectStore.createIndex('objectId', 'objectId', { unique: false });
        }
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        connections.delete(name);
      };
      connections.set(name, db);
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error('Failed to open local database'));
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Local database transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('Local database transaction aborted'));
  });
}

async function getAll<T>(namespace: string, store: StoreName): Promise<T[]> {
  const db = await openDB(namespace);
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(namespace: string, store: StoreName, value: T): Promise<void> {
  const db = await openDB(namespace);
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(value);
  await done(tx);
}

async function bulkPut<T>(namespace: string, store: StoreName, values: T[]): Promise<void> {
  if (!values.length) return;
  const db = await openDB(namespace);
  const tx = db.transaction(store, 'readwrite');
  const objectStore = tx.objectStore(store);
  for (const value of values) objectStore.put(value);
  await done(tx);
}

async function remove(namespace: string, store: StoreName, key: string): Promise<void> {
  const db = await openDB(namespace);
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).delete(key);
  await done(tx);
}

export const localDB = {
  objects: (namespace: string) => getAll<OSObject>(namespace, 'objects'),
  putObject: (namespace: string, object: OSObject) => put(namespace, 'objects', object),
  putObjects: (namespace: string, objects: OSObject[]) => bulkPut(namespace, 'objects', objects),
  deleteObject: (namespace: string, id: string) => remove(namespace, 'objects', id),
  versions: async (namespace: string, objectId: string) => {
    const all = await getAll<ObjectVersion>(namespace, 'versions');
    return all.filter((version) => version.object_id === objectId).sort((a, b) => b.version - a.version);
  },
  putVersion: (namespace: string, version: ObjectVersion) => put(namespace, 'versions', version),
  queries: (namespace: string) => getAll<SavedQuery>(namespace, 'queries'),
  putQuery: (namespace: string, query: SavedQuery) => put(namespace, 'queries', query),
  deleteQuery: (namespace: string, id: string) => remove(namespace, 'queries', id),
  settings: async (namespace: string): Promise<Settings | null> => {
    const rows = await getAll<{ key: string; value: Settings }>(namespace, 'settings');
    return rows.find((row) => row.key === 'settings')?.value ?? null;
  },
  putSettings: (namespace: string, value: Settings) => put(namespace, 'settings', { key: 'settings', value }),
  outbox: (namespace: string) => getAll<OutboxEntry>(namespace, 'outbox'),
  putOutbox: (namespace: string, entry: OutboxEntry) => put(namespace, 'outbox', entry),
  deleteOutbox: (namespace: string, id: string) => remove(namespace, 'outbox', id),
  clear: async (namespace: string) => {
    const db = await openDB(namespace);
    const tx = db.transaction(stores, 'readwrite');
    for (const store of stores) tx.objectStore(store).clear();
    await done(tx);
  },
  destroy: async (namespace: string) => {
    const name = dbName(namespace);
    const existing = connections.get(name);
    if (existing) {
      existing.close();
      connections.delete(name);
    }
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  },
};
