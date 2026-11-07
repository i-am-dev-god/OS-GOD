import { describe, expect, it } from 'vitest';
import { objectInputSchema, parseImportPayload, settingsSchema } from '@/lib/validation';
import { defaultSettings } from '@/lib/seed';

const valid = {
  kind: 'note',
  title: '  Hello  ',
  body: 'World',
  status: 'inbox',
  tags: ['Work', 'work', 'deep/work'],
  due_date: null,
};

describe('object validation', () => {
  it('trims titles and normalizes/deduplicates tags', () => {
    const parsed = objectInputSchema.parse(valid);
    expect(parsed.title).toBe('Hello');
    expect(parsed.tags).toEqual(['work', 'deep/work']);
  });

  it('rejects unknown fields and invalid dates', () => {
    expect(objectInputSchema.safeParse({ ...valid, owner_id: 'attacker' }).success).toBe(false);
    expect(objectInputSchema.safeParse({ ...valid, due_date: 'tomorrow' }).success).toBe(false);
  });

  it('enforces the 256 KiB byte limit, not just character count', () => {
    expect(objectInputSchema.safeParse({ ...valid, body: 'é'.repeat(131_073) }).success).toBe(false);
    expect(objectInputSchema.safeParse({ ...valid, body: 'a'.repeat(262_144) }).success).toBe(true);
  });

  it('rejects script-like tags and excessive tag counts', () => {
    expect(objectInputSchema.safeParse({ ...valid, tags: ['<script>'] }).success).toBe(false);
    expect(objectInputSchema.safeParse({ ...valid, tags: Array.from({ length: 13 }, (_, i) => `t${i}`) }).success).toBe(false);
  });
});

describe('import validation', () => {
  it('accepts a minimal portable payload', () => {
    const payload = parseImportPayload({ format: 'os-god', version: 1, objects: [{ title: 'Imported' }] });
    expect(payload.objects[0].kind).toBe('note');
    expect(payload.objects[0].body).toBe('');
  });

  it('rejects wrong format, empty imports, and oversized batches', () => {
    expect(() => parseImportPayload({ format: 'other', version: 1, objects: [{ title: 'x' }] })).toThrow();
    expect(() => parseImportPayload({ format: 'os-god', version: 1, objects: [] })).toThrow();
    expect(() => parseImportPayload({ format: 'os-god', version: 1, objects: Array.from({ length: 101 }, () => ({ title: 'x' })) })).toThrow();
  });
});

describe('settings validation', () => {
  it('accepts defaults and bounds window state', () => {
    expect(settingsSchema.safeParse(defaultSettings()).success).toBe(true);
    const settings = defaultSettings();
    settings.windows = Array.from({ length: 13 }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      view: 'settings' as const,
      title: 'Settings',
      rect: { x: 0, y: 0, w: 400, h: 300 },
      z: i,
      minimized: false,
      maximized: false,
    }));
    expect(settingsSchema.safeParse(settings).success).toBe(false);
  });
});
