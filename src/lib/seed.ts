import type { OSObject, SavedQuery, Settings } from './types';
import { emptyQuery, nowISO, uuid } from './utils';

export function defaultSettings(): Settings {
  return {
    theme: 'system',
    quality: 'auto',
    windows: [],
    layouts: {},
    workspaces: [
      { id: 'personal', name: 'Personal', accent: 'blue' },
      { id: 'deep-work', name: 'Deep work', accent: 'violet' },
    ],
    activeWorkspace: 'personal',
    sidebarCollapsed: false,
    inspectorOpen: false,
    focusMode: false,
  };
}

export function createSeedWorkspace() {
  const now = nowISO();
  const owner = 'local';
  const project: OSObject = {
    id: uuid(), owner_id: owner, kind: 'project', title: 'Project Atlas',
    body: '# Project Atlas\n\nA focused workspace for the next launch.\n\n## Goals\n- Ship the first public release\n- Keep every decision traceable\n- Make capture faster than forgetting\n\nRelated: [[Welcome to OS-GOD]]\n',
    status: 'active', tags: ['work', 'launch'], due_date: null, version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const welcome: OSObject = {
    id: uuid(), owner_id: owner, kind: 'note', title: 'Welcome to OS-GOD',
    body: '# Your knowledge, running like an OS\n\nThis is a **text-first, database-native workspace**. Everything here is an object: notes, tasks, projects, sources, and decisions.\n\n## Try the core loop\n1. Press **Ctrl/Cmd + K** and create a task.\n2. Open [[Project Atlas]] beside this note.\n3. Save a live query for open tasks.\n4. Minimize a window into the dock, then restore it.\n5. Export your workspace from Settings.\n\n## Private by default\nYou are using a local browser database. Sign in with GitHub to sync through Postgres row-level security. No repository access is requested.\n',
    status: 'active', tags: ['welcome', 'guide'], due_date: null, version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const task: OSObject = {
    id: uuid(), owner_id: owner, kind: 'task', title: 'Send the Atlas proposal',
    body: 'Draft the proposal and link the pricing decision.\n\nProject: [[Project Atlas]]\n', status: 'active', tags: ['work', 'urgent'], due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const task2: OSObject = {
    id: uuid(), owner_id: owner, kind: 'task', title: 'Review competitor pricing',
    body: 'Collect three reference points and summarize trade-offs.\n\nSource: [[Competitive pricing notes]]\n', status: 'waiting', tags: ['work', 'research'], due_date: null, version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const source: OSObject = {
    id: uuid(), owner_id: owner, kind: 'source', title: 'Competitive pricing notes',
    body: '## Reference points\n- Text-first tools win on speed and portability.\n- Database views reduce duplicate lists.\n- Trust comes from history, export, and clear sync state.\n', status: 'active', tags: ['research'], due_date: null, version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const decision: OSObject = {
    id: uuid(), owner_id: owner, kind: 'decision', title: 'Pricing model decision',
    body: '## Decision\nStart with a generous local workspace and optional cloud sync.\n\n## Why\nKnowledge work should not be held hostage by connectivity or lock-in.\n\n## Review\nRevisit after the first 100 active users.\n', status: 'active', tags: ['work', 'decision'], due_date: null, version: 1, created_at: now, updated_at: now, deleted_at: null, sync: 'local', baseVersion: 0,
  };
  const objects = [welcome, project, task, task2, source, decision];
  const queries: SavedQuery[] = [
    { id: uuid(), owner_id: owner, name: 'Open tasks', definition: { ...emptyQuery, kinds: ['task'], statuses: ['inbox', 'active', 'waiting'], sort: 'due' }, created_at: now, updated_at: now },
    { id: uuid(), owner_id: owner, name: 'This week', definition: { ...emptyQuery, due: 'week', sort: 'due' }, created_at: now, updated_at: now },
  ];
  return { objects, queries, welcomeId: welcome.id, openTasksQueryId: queries[0].id };
}
