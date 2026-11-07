import { describe, expect, it } from 'vitest';
import type { OSObject } from '@/lib/types';
import { backlinks, emptyQuery, exportPayload, filterObjects, objectToMarkdown, parseWikiLinks, resolveLinks, searchScore, todayISO, uuid } from '@/lib/utils';

function object(partial: Partial<OSObject>): OSObject {
  return {
    id: uuid(), owner_id: 'local', kind: 'note', title: 'Untitled', body: '', status: 'inbox', tags: [], due_date: null,
    version: 1, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', deleted_at: null,
    sync: 'local', baseVersion: 1, ...partial,
  };
}

describe('search and links', () => {
  it('ranks title matches above body matches', () => {
    const title = object({ title: 'Roadmap' });
    const body = object({ title: 'Notes', body: 'roadmap details' });
    expect(searchScore(title, 'roadmap')).toBeGreaterThan(searchScore(body, 'roadmap'));
    expect(searchScore(title, '')).toBe(1);
  });

  it('parses wikilinks with aliases and ignores duplicates', () => {
    expect(parseWikiLinks('See [[Project X|alias]] and [[project x]] plus [[ ]].')).toEqual(['Project X', 'project x']);
  });

  it('resolves links and backlinks while ignoring deleted/self references', () => {
    const target = object({ title: 'Project X' });
    const source = object({ title: 'Note', body: `Link [[${target.title}]] and [[Note]]` });
    const deleted = object({ title: 'Gone', deleted_at: '2026-01-02T00:00:00.000Z', body: `[[${target.title}]]` });
    expect(resolveLinks(source, [target, source, deleted]).map((o) => o.id)).toEqual([target.id]);
    expect(backlinks(target, [source, deleted, target]).map((o) => o.id)).toEqual([source.id]);
  });
});

describe('live queries', () => {
  it('filters by kind/status/tags and excludes deleted objects by default', () => {
    const task = object({ kind: 'task', status: 'active', tags: ['work'], title: 'Ship' });
    const note = object({ kind: 'note', title: 'Ship notes' });
    const deleted = object({ kind: 'task', status: 'active', deleted_at: '2026-01-02T00:00:00.000Z' });
    const result = filterObjects([task, note, deleted], { ...emptyQuery, kinds: ['task'], statuses: ['active'], tags: ['work'] });
    expect(result.map((o) => o.id)).toEqual([task.id]);
    expect(filterObjects([deleted], { ...emptyQuery, includeDeleted: true })).toHaveLength(1);
  });

  it('supports today and overdue due filters', () => {
    const today = object({ due_date: todayISO(), status: 'active' });
    const overdue = object({ due_date: '2000-01-01', status: 'active' });
    const done = object({ due_date: '2000-01-01', status: 'done' });
    expect(filterObjects([today, overdue], { ...emptyQuery, due: 'today' }).map((o) => o.id)).toEqual([today.id]);
    expect(filterObjects([today, overdue, done], { ...emptyQuery, due: 'overdue' }).map((o) => o.id)).toEqual([overdue.id]);
  });
});

describe('portable export', () => {
  it('exports only text fields and valid frontmatter', () => {
    const item = object({ title: 'Export me', body: 'Body', tags: ['a'], owner_id: 'secret-owner', sync: 'pending' });
    const payload = exportPayload([item], []);
    expect(payload.format).toBe('os-god');
    expect(payload.objects[0]).not.toHaveProperty('owner_id');
    expect(payload.objects[0]).not.toHaveProperty('sync');
    const markdown = objectToMarkdown(item);
    expect(markdown).toContain('title: "Export me"');
    expect(markdown).toContain('tags: ["a"]');
    expect(markdown.endsWith('Body\n')).toBe(true);
  });

  it('generates RFC-compatible UUIDs', () => {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
