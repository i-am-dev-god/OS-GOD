import { describe, expect, it } from 'vitest';
import { localDB } from '@/lib/local-db';
import { defaultSettings } from '@/lib/seed';
import type { ObjectVersion, OSObject, OutboxEntry } from '@/lib/types';
import { uuid } from '@/lib/utils';

function object(id = uuid()): OSObject {
  return { id, owner_id: 'local', kind: 'note', title: 'Local', body: 'text', status: 'inbox', tags: [], due_date: null, version: 1, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', deleted_at: null, sync: 'local', baseVersion: 1 };
}

describe('IndexedDB local-first store', () => {
  it('persists objects, settings, queries, and outbox entries', async () => {
    const ns = `test-${uuid()}`;
    const item = object();
    await localDB.putObject(ns, item);
    await localDB.putObjects(ns, [object(), object()]);
    expect(await localDB.objects(ns)).toHaveLength(3);
    const settings = defaultSettings();
    await localDB.putSettings(ns, settings);
    expect(await localDB.settings(ns)).toEqual(settings);
    const entry: OutboxEntry = { id: uuid(), objectId: item.id, op: 'upsert', payload: item, baseVersion: 1, createdAt: '2026-01-01T00:00:00.000Z' };
    await localDB.putOutbox(ns, entry);
    expect(await localDB.outbox(ns)).toEqual([entry]);
    await localDB.deleteOutbox(ns, entry.id);
    expect(await localDB.outbox(ns)).toHaveLength(0);
  });

  it('returns versions sorted newest first for one object only', async () => {
    const ns = `test-${uuid()}`;
    const id = uuid();
    const base = { id: uuid(), object_id: id, owner_id: ns, kind: 'note' as const, title: 'v', body: '', status: 'inbox' as const, tags: [], due_date: null, deleted_at: null, created_at: '2026-01-01T00:00:00.000Z' };
    const versions: ObjectVersion[] = [{ ...base, id: uuid(), version: 1 }, { ...base, id: uuid(), version: 3 }, { ...base, id: uuid(), object_id: uuid(), version: 9 }];
    for (const version of versions) await localDB.putVersion(ns, version);
    const result = await localDB.versions(ns, id);
    expect(result.map((v) => v.version)).toEqual([3, 1]);
  });

  it('isolates namespaces and clears all stores', async () => {
    const a = `test-${uuid()}`;
    const b = `test-${uuid()}`;
    await localDB.putObject(a, object());
    expect(await localDB.objects(b)).toHaveLength(0);
    await localDB.clear(a);
    expect(await localDB.objects(a)).toHaveLength(0);
    expect(await localDB.settings(a)).toBeNull();
  });
});
