import { clsx, type ClassValue } from 'clsx';
import type { OSObject, ObjectKind, QueryDefinition, SavedQuery } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uuid(): string {
  const webCrypto = globalThis.crypto as Crypto | undefined;
  if (webCrypto?.randomUUID) return webCrypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (!webCrypto) throw new Error('Secure random generator unavailable');
  webCrypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function nowISO() {
  return new Date().toISOString();
}

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  debounced.flush = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = null;
    fn(...args);
  };
  return debounced;
}

export function normalize(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

export function searchScore(object: OSObject, query: string): number {
  const q = normalize(query.trim());
  if (!q) return 1;
  const title = normalize(object.title);
  const body = normalize(object.body);
  const tags = normalize(object.tags.join(' '));
  let score = 0;
  if (title === q) score += 120;
  if (title.startsWith(q)) score += 70;
  if (title.includes(q)) score += 45;
  if (tags.includes(q)) score += 30;
  if (body.includes(q)) score += 18;
  const tokens = q.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (title.includes(token)) score += 12;
    if (tags.includes(token)) score += 8;
    if (body.includes(token)) score += 4;
  }
  if (object.status === 'done') score -= 4;
  return score;
}

export function parseWikiLinks(body: string): string[] {
  const links = new Set<string>();
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body))) {
    const title = match[1].trim();
    if (title) links.add(title);
  }
  return Array.from(links);
}

export function resolveLinks(source: OSObject, objects: OSObject[]): OSObject[] {
  const titles = new Set(parseWikiLinks(source.body).map(normalize));
  return objects.filter((object) => object.id !== source.id && !object.deleted_at && titles.has(normalize(object.title)));
}

export function backlinks(target: OSObject, objects: OSObject[]): OSObject[] {
  const title = normalize(target.title);
  return objects.filter((object) => object.id !== target.id && !object.deleted_at && parseWikiLinks(object.body).some((link) => normalize(link) === title));
}

export function filterObjects(objects: OSObject[], definition: QueryDefinition): OSObject[] {
  const today = todayISO();
  const week = addDaysISO(7);
  const result = objects.filter((object) => {
    if (!definition.includeDeleted && object.deleted_at) return false;
    if (definition.includeDeleted && !object.deleted_at) return false;
    if (definition.kinds.length && !definition.kinds.includes(object.kind)) return false;
    if (definition.statuses.length && !definition.statuses.includes(object.status)) return false;
    if (definition.tags.length && !definition.tags.every((tag) => object.tags.includes(tag))) return false;
    if (definition.search && searchScore(object, definition.search) <= 0) return false;
    if (definition.due === 'none' && object.due_date) return false;
    if (definition.due === 'overdue' && (!object.due_date || object.due_date >= today || object.status === 'done')) return false;
    if (definition.due === 'today' && object.due_date !== today) return false;
    if (definition.due === 'week' && (!object.due_date || object.due_date < today || object.due_date > week)) return false;
    return true;
  });

  return result.sort((a, b) => {
    if (definition.search) {
      const diff = searchScore(b, definition.search) - searchScore(a, definition.search);
      if (diff !== 0) return diff;
    }
    switch (definition.sort) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return b.created_at.localeCompare(a.created_at);
      case 'due':
        return (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999');
      default:
        return b.updated_at.localeCompare(a.updated_at);
    }
  });
}

export const emptyQuery: QueryDefinition = {
  search: '',
  kinds: [],
  statuses: [],
  tags: [],
  due: 'any',
  sort: 'updated',
  includeDeleted: false,
};

export function objectToMarkdown(object: OSObject): string {
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(object.title)}`,
    `kind: ${object.kind}`,
    `status: ${object.status}`,
    `tags: [${object.tags.map((tag) => JSON.stringify(tag)).join(', ')}]`,
    object.due_date ? `due: ${object.due_date}` : null,
    `version: ${object.version}`,
    '---',
    '',
  ].filter(Boolean);
  return `${frontmatter.join('\n')}\n${object.body}\n`;
}

export function exportPayload(objects: OSObject[], queries: SavedQuery[]) {
  return {
    format: 'os-god' as const,
    version: 1 as const,
    exported_at: nowISO(),
    objects: objects.map(({ kind, title, body, status, tags, due_date }) => ({ kind, title, body, status, tags, due_date })),
    queries: queries.map(({ name, definition }) => ({ name, definition })),
  };
}

export function downloadText(filename: string, text: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function kindLabel(kind: ObjectKind) {
  return { note: 'Note', task: 'Task', project: 'Project', source: 'Source', decision: 'Decision' }[kind];
}

export function basePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

export function appUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return normalized;
  return `${window.location.origin}${basePath()}${normalized}`;
}

export function errorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof Error && error.message) return error.message.slice(0, 240);
  if (typeof error === 'string') return error.slice(0, 240);
  return fallback;
}
