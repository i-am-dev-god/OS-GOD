import { z } from 'zod';
import { OBJECT_KINDS, OBJECT_STATUSES } from './types';

const encoder = new TextEncoder();
const byteLength = (value: string) => encoder.encode(value).length;

export const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/, 'Tags may contain letters, numbers, _ . / -')
  .transform((value) => value.toLowerCase());

export const objectInputSchema = z
  .object({
    kind: z.enum(OBJECT_KINDS),
    title: z.string().trim().min(1, 'Title is required').max(200),
    body: z.string().max(300_000).refine((value) => byteLength(value) <= 262_144, 'Body exceeds the 256 KiB text limit'),
    status: z.enum(OBJECT_STATUSES),
    tags: z.array(tagSchema).max(12).transform((tags) => Array.from(new Set(tags))),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').nullable(),
    deleted_at: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .strict();

export type ObjectInput = z.infer<typeof objectInputSchema>;

export const queryDefinitionSchema = z
  .object({
    search: z.string().max(200).default(''),
    kinds: z.array(z.enum(OBJECT_KINDS)).max(5).default([]),
    statuses: z.array(z.enum(OBJECT_STATUSES)).max(5).default([]),
    tags: z.array(tagSchema).max(12).default([]),
    due: z.enum(['any', 'overdue', 'today', 'week', 'none']).default('any'),
    sort: z.enum(['updated', 'created', 'title', 'due']).default('updated'),
    includeDeleted: z.boolean().default(false),
  })
  .strict();

export const savedQueryInputSchema = z
  .object({ name: z.string().trim().min(1).max(80), definition: queryDefinitionSchema })
  .strict();

const windowRectSchema = z.object({
  x: z.number().finite().min(-2000).max(20000),
  y: z.number().finite().min(-2000).max(20000),
  w: z.number().finite().min(240).max(20000),
  h: z.number().finite().min(180).max(20000),
});

export const windowStateSchema = z.object({
  id: z.string().uuid(),
  view: z.enum(['object', 'query', 'history', 'settings', 'trash']),
  objectId: z.string().uuid().optional(),
  queryId: z.string().uuid().optional(),
  definition: queryDefinitionSchema.optional(),
  title: z.string().max(200),
  rect: windowRectSchema,
  z: z.number().int().min(0).max(100000),
  minimized: z.boolean(),
  maximized: z.boolean(),
});

export const settingsSchema = z
  .object({
    theme: z.enum(['system', 'light', 'dark']).default('system'),
    quality: z.enum(['auto', 'lite', 'standard', 'rich']).default('auto'),
    windows: z.array(windowStateSchema).max(12).default([]),
    layouts: z.record(z.string().min(1).max(64), z.array(windowStateSchema).max(12)).default({}),
    workspaces: z
      .array(z.object({ id: z.string().min(1).max(64), name: z.string().min(1).max(40), accent: z.string().max(24) }))
      .max(8)
      .default([{ id: 'personal', name: 'Personal', accent: 'blue' }]),
    activeWorkspace: z.string().min(1).max(64).default('personal'),
    sidebarCollapsed: z.boolean().default(false),
    inspectorOpen: z.boolean().default(false),
    focusMode: z.boolean().default(false),
  })
  .strict()
  .refine((value) => byteLength(JSON.stringify(value)) <= 65_536, 'Workspace state is too large');

export const importObjectSchema = z
  .object({
    id: z.string().uuid().optional(),
    kind: z.enum(OBJECT_KINDS).default('note'),
    title: z.string().trim().min(1).max(200),
    body: z.string().max(300_000).default(''),
    status: z.enum(OBJECT_STATUSES).default('active'),
    tags: z.array(tagSchema).max(12).default([]),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  })
  .strict()
  .refine((value) => byteLength(value.body) <= 262_144, 'Body exceeds the 256 KiB text limit');

export const importPayloadSchema = z
  .object({
    format: z.literal('os-god'),
    version: z.literal(1),
    exported_at: z.string().datetime({ offset: true }).optional(),
    objects: z.array(importObjectSchema).min(1).max(100),
    queries: z.array(savedQueryInputSchema).max(50).optional(),
  })
  .strict()
  .refine((value) => byteLength(JSON.stringify(value)) <= 2_000_000, 'Import exceeds the 2 MB limit');

export function parseObjectInput(value: unknown) {
  return objectInputSchema.parse(value);
}

export function parseImportPayload(value: unknown) {
  return importPayloadSchema.parse(value);
}
