export const OBJECT_KINDS = ['note', 'task', 'project', 'source', 'decision'] as const;
export type ObjectKind = (typeof OBJECT_KINDS)[number];

export const OBJECT_STATUSES = ['inbox', 'active', 'waiting', 'done', 'archived'] as const;
export type ObjectStatus = (typeof OBJECT_STATUSES)[number];

export type SyncState = 'local' | 'pending' | 'synced' | 'conflict' | 'error';

export interface OSObject {
  id: string;
  owner_id: string;
  kind: ObjectKind;
  title: string;
  body: string;
  status: ObjectStatus;
  tags: string[];
  due_date: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync: SyncState;
  baseVersion: number;
}

export interface ObjectVersion {
  id: string;
  object_id: string;
  owner_id: string;
  version: number;
  kind: ObjectKind;
  title: string;
  body: string;
  status: ObjectStatus;
  tags: string[];
  due_date: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface QueryDefinition {
  search: string;
  kinds: ObjectKind[];
  statuses: ObjectStatus[];
  tags: string[];
  due: 'any' | 'overdue' | 'today' | 'week' | 'none';
  sort: 'updated' | 'created' | 'title' | 'due';
  includeDeleted: boolean;
}

export interface SavedQuery {
  id: string;
  owner_id: string;
  name: string;
  definition: QueryDefinition;
  created_at: string;
  updated_at: string;
}

export interface WindowRect { x: number; y: number; w: number; h: number }

export type WindowView = 'object' | 'query' | 'history' | 'settings' | 'trash';

export interface WindowState {
  id: string;
  view: WindowView;
  objectId?: string;
  queryId?: string;
  definition?: QueryDefinition;
  title: string;
  rect: WindowRect;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface WorkspaceContext { id: string; name: string; accent: string }

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  quality: 'auto' | 'lite' | 'standard' | 'rich';
  windows: WindowState[];
  layouts: Record<string, WindowState[]>;
  workspaces: WorkspaceContext[];
  activeWorkspace: string;
  sidebarCollapsed: boolean;
  inspectorOpen: boolean;
  focusMode: boolean;
}

export interface OutboxEntry {
  id: string;
  objectId: string;
  op: 'upsert' | 'delete';
  payload: Partial<OSObject>;
  baseVersion: number;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  login: string | null;
  name: string | null;
}

export interface AuthState {
  status: 'loading' | 'local' | 'authenticated' | 'error';
  user: AuthUser | null;
  cloudConfigured: boolean;
  githubEnabled: boolean | null;
  error: string | null;
}

export interface Toast { id: string; title: string; description?: string; tone: 'info' | 'success' | 'error' }
