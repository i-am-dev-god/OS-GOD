'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, BookOpen, Check, CheckSquare, ChevronDown, CloudOff, FileText, FolderKanban,
  Inbox, Layers, PanelLeft, PanelRight, Plus, RefreshCw, Scale, Search, Settings, Trash2, X,
} from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { ObjectKind, QueryDefinition, WindowRect, WindowState } from '@/lib/types';
import { cn, emptyQuery, errorMessage, uuid } from '@/lib/utils';
import CommandPalette from './CommandPalette';
import Editor from './Editor';
import QueryView from './QueryView';
import HistoryPanel from './HistoryPanel';
import SettingsPanel from './SettingsPanel';
import TrashView from './TrashView';
import Inspector from './Inspector';
import AuthModal from './AuthModal';
import CaptureModal from './CaptureModal';
import WindowFrame, { type SnapZone } from './Window';

const railQueries: { id: string; label: string; icon: React.ReactNode; definition: QueryDefinition }[] = [
  { id: 'today', label: 'Today', icon: <Layers size={17} />, definition: { ...emptyQuery, due: 'today', statuses: ['inbox', 'active', 'waiting'], sort: 'due' } },
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={17} />, definition: { ...emptyQuery, statuses: ['inbox'] } },
  { id: 'notes', label: 'Notes', icon: <FileText size={17} />, definition: { ...emptyQuery, kinds: ['note'] } },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={17} />, definition: { ...emptyQuery, kinds: ['task'], statuses: ['inbox', 'active', 'waiting'], sort: 'due' } },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={17} />, definition: { ...emptyQuery, kinds: ['project'] } },
  { id: 'sources', label: 'Sources', icon: <BookOpen size={17} />, definition: { ...emptyQuery, kinds: ['source'] } },
  { id: 'decisions', label: 'Decisions', icon: <Scale size={17} />, definition: { ...emptyQuery, kinds: ['decision'] } },
];

export default function OS() {
  const api = useWorkspace();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [capture, setCapture] = useState<{ open: boolean; kind: ObjectKind }>({ open: false, kind: 'note' });
  const [snapPreview, setSnapPreview] = useState<SnapZone>(null);
  const [mobileActiveId, setMobileActiveId] = useState<string | null>(null);
  const [systemDark, setSystemDark] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const windows = api.settings.windows;
  const topWindow = useMemo(() => [...windows].filter((win) => !win.minimized).sort((a, b) => b.z - a.z)[0] ?? null, [windows]);
  const activeWindow = windows.find((win) => win.id === mobileActiveId && !win.minimized) ?? topWindow;
  const activeObject = activeWindow?.view === 'object' ? api.objects.find((object) => object.id === activeWindow.objectId) ?? null : null;
  const allTags = useMemo(() => Array.from(new Set(api.objects.filter((object) => !object.deleted_at).flatMap((object) => object.tags))).sort().slice(0, 24), [api.objects]);
  const resolvedTheme = api.settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : api.settings.theme;

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(media.matches);
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.quality = api.settings.quality;
  }, [resolvedTheme, api.settings.quality]);

  const updateWindows = useCallback((updater: (windows: WindowState[]) => WindowState[]) => {
    api.updateSettings((previous) => ({ ...previous, windows: updater(previous.windows) }));
  }, [api]);

  const focusWindow = useCallback((id: string) => {
    setMobileActiveId(id);
    updateWindows((current) => {
      const maxZ = Math.max(0, ...current.map((win) => win.z));
      return current.map((win) => (win.id === id ? { ...win, z: maxZ + 1, minimized: false } : win));
    });
  }, [updateWindows]);

  const openWindow = useCallback((partial: Pick<WindowState, 'view' | 'title'> & Partial<WindowState>) => {
    const existing = windows.find((win) =>
      (partial.objectId && win.view === 'object' && win.objectId === partial.objectId) ||
      (partial.queryId && win.view === 'query' && win.queryId === partial.queryId) ||
      (partial.view === 'settings' && win.view === 'settings') ||
      (partial.view === 'trash' && win.view === 'trash'),
    );
    if (existing) { focusWindow(existing.id); return existing.id; }
    const id = uuid();
    const maxZ = Math.max(0, ...windows.map((win) => win.z));
    const count = windows.length;
    const canvasWidth = canvasRef.current?.clientWidth ?? Math.max(600, globalThis.innerWidth - 300);
    const canvasHeight = canvasRef.current?.clientHeight ?? Math.max(420, globalThis.innerHeight - 180);
    const width = Math.min(partial.rect?.w ?? 660, Math.max(360, canvasWidth - 40));
    const height = Math.min(partial.rect?.h ?? 520, Math.max(300, canvasHeight - 40));
    const rect: WindowRect = partial.rect ?? {
      x: Math.max(8, Math.min(240 + count * 28, canvasWidth - width - 16)),
      y: Math.max(8, Math.min(36 + count * 24, canvasHeight - height - 16)),
      w: width, h: height,
    };
    const next: WindowState = { id, view: partial.view, title: partial.title, objectId: partial.objectId, queryId: partial.queryId, definition: partial.definition, rect, z: maxZ + 1, minimized: false, maximized: false };
    updateWindows((current) => {
      const trimmed = current.length >= 8 ? [...current].sort((a, b) => a.z - b.z).slice(1) : current;
      return [...trimmed, next];
    });
    setMobileActiveId(id);
    return id;
  }, [windows, focusWindow, updateWindows]);

  const openObject = useCallback((id: string, title?: string) => {
    const object = api.objects.find((candidate) => candidate.id === id);
    openWindow({ view: 'object', objectId: id, title: title ?? object?.title ?? 'Object' });
  }, [api.objects, openWindow]);

  const openQueryDefinition = useCallback((title: string, definition: QueryDefinition) => {
    openWindow({ view: 'query', title, definition });
  }, [openWindow]);

  const openSavedQuery = useCallback((id: string) => {
    const query = api.queries.find((candidate) => candidate.id === id);
    if (query) openWindow({ view: 'query', queryId: id, title: query.name, definition: query.definition });
  }, [api.queries, openWindow]);

  const closeWindow = useCallback((id: string) => {
    updateWindows((current) => current.filter((win) => win.id !== id));
    setMobileActiveId((current) => (current === id ? null : current));
  }, [updateWindows]);

  const minimizeWindow = useCallback((id: string) => updateWindows((current) => current.map((win) => (win.id === id ? { ...win, minimized: true } : win))), [updateWindows]);
  const maximizeWindow = useCallback((id: string) => updateWindows((current) => current.map((win) => (win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win))), [updateWindows]);
  const setWindowRect = useCallback((id: string, rect: WindowRect) => updateWindows((current) => current.map((win) => (win.id === id ? { ...win, rect, maximized: false } : win))), [updateWindows]);

  const snapWindow = useCallback((id: string, zone: SnapZone) => {
    if (!zone) return;
    const box = canvasRef.current?.getBoundingClientRect();
    const width = box?.width ?? globalThis.innerWidth;
    const height = box?.height ?? globalThis.innerHeight;
    const rect: WindowRect = zone === 'max' ? { x: 0, y: 0, w: width, h: height } : zone === 'left' ? { x: 0, y: 0, w: Math.floor(width / 2) - 6, h: height } : { x: Math.floor(width / 2) + 6, y: 0, w: Math.floor(width / 2) - 6, h: height };
    updateWindows((current) => current.map((win) => (win.id === id ? { ...win, rect, maximized: zone === 'max', minimized: false } : win)));
  }, [updateWindows]);

  const switchWorkspace = useCallback((id: string) => {
    api.updateSettings((previous) => {
      if (previous.activeWorkspace === id) return previous;
      return {
        ...previous,
        layouts: { ...previous.layouts, [previous.activeWorkspace]: previous.windows },
        activeWorkspace: id,
        windows: previous.layouts[id] ?? [],
      };
    });
    setMobileActiveId(null);
  }, [api]);

  const createAndOpen = useCallback(async (kind: ObjectKind) => {
    setCapture({ open: true, kind });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen((value) => !value); return; }
      if (mod && event.key.toLowerCase() === 'n') { event.preventDefault(); setCapture({ open: true, kind: 'note' }); return; }
      if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); api.notify('Saved', 'Changes are stored locally and synced when available.', 'success'); return; }
      if (event.key === 'Escape') { setPaletteOpen(false); setAuthOpen(false); setCapture((value) => ({ ...value, open: false })); return; }
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable]')) return;
      if (mod && event.key.toLowerCase() === 'w' && activeWindow) { event.preventDefault(); closeWindow(activeWindow.id); }
      if (mod && event.key === '`' && windows.length) { event.preventDefault(); const visible = windows.filter((win) => !win.minimized); const next = visible[0] ?? windows[0]; focusWindow(next.id); }
      if (mod && event.altKey && activeWindow) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); snapWindow(activeWindow.id, 'left'); }
        if (event.key === 'ArrowRight') { event.preventDefault(); snapWindow(activeWindow.id, 'right'); }
        if (event.key === 'ArrowUp') { event.preventDefault(); snapWindow(activeWindow.id, 'max'); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeWindow, api, closeWindow, focusWindow, snapWindow, windows]);

  function renderWindowContent(win: WindowState) {
    if (win.view === 'object') {
      const object = api.objects.find((candidate) => candidate.id === win.objectId);
      if (!object) return <div className="empty-state">Object unavailable. It may have been deleted.</div>;
      return <Editor key={object.id} object={object} onUpdate={api.updateObject} onDelete={(id) => { void api.deleteObject(id); closeWindow(win.id); }} onOpenHistory={(objectId) => openWindow({ view: 'history', objectId, title: `History · ${object.title}` })} />;
    }
    if (win.view === 'query') {
      const saved = api.queries.find((query) => query.id === win.queryId);
      return <QueryView key={win.id} initial={win.definition ?? saved?.definition} objects={api.objects} onOpenObject={openObject} onSave={(name, definition) => { void api.saveQuery(name, definition).then((query) => { updateWindows((current) => current.map((candidate) => candidate.id === win.id ? { ...candidate, queryId: query.id, title: query.name, definition: undefined } : candidate)); api.notify('Query saved', query.name, 'success'); }).catch((error) => api.notify('Query save failed', errorMessage(error), 'error')); }} />;
    }
    if (win.view === 'history' && win.objectId) return <HistoryPanel objectId={win.objectId} loadVersions={api.loadVersions} onRestore={(objectId, version) => { void api.restoreVersion(objectId, version).then(() => api.notify('Version restored', `Version ${version.version} is now current.`, 'success')); }} />;
    if (win.view === 'settings') return <SettingsPanel api={api} onOpenAuth={() => setAuthOpen(true)} />;
    if (win.view === 'trash') return <TrashView objects={api.objects} onRestore={(id) => void api.restoreObject(id)} onDestroy={(id) => void api.destroyObject(id)} onEmpty={() => { for (const object of api.objects.filter((candidate) => candidate.deleted_at)) void api.destroyObject(object.id); }} />;
    return <div className="empty-state">Unknown view</div>;
  }

  const syncIcon = api.auth.status !== 'authenticated' ? <CloudOff size={16} /> : api.syncing ? <RefreshCw size={16} className="spin" /> : api.syncError ? <AlertTriangle size={16} /> : api.online ? <Check size={16} /> : <CloudOff size={16} />;
  const syncLabel = api.auth.status !== 'authenticated' ? 'Local' : api.syncing ? 'Syncing' : api.syncError ? 'Sync error' : api.online ? 'Synced' : 'Offline';

  return (
    <div className={cn('os-root', api.settings.focusMode && 'focus-mode', api.settings.sidebarCollapsed && 'rail-collapsed')} data-theme={resolvedTheme}>
      <div className="ambient" aria-hidden="true"><div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" /></div>

      <header className="command-capsule glass">
        <button className="brand" onClick={() => openQueryDefinition('Today', railQueries[0].definition)} aria-label="OS-GOD home"><span className="brand-mark">◎</span><span className="brand-name">OS-GOD</span></button>
        <div className="workspace-switch">
          <select className="select bare" value={api.settings.activeWorkspace} onChange={(event) => switchWorkspace(event.target.value)} aria-label="Workspace">
            {api.settings.workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
          </select>
          <ChevronDown size={14} />
        </div>
        <button className="command-search" onClick={() => setPaletteOpen(true)} aria-label="Open command palette"><Search size={16} /><span>Search or command…</span><kbd>⌘K</kbd></button>
        <div className="capsule-actions">
          <button className="icon-button" onClick={() => api.updateSettings((previous) => ({ ...previous, sidebarCollapsed: !previous.sidebarCollapsed }))} aria-label="Toggle object rail"><PanelLeft size={17} /></button>
          <button className="icon-button" onClick={() => api.updateSettings((previous) => ({ ...previous, inspectorOpen: !previous.inspectorOpen }))} aria-label="Toggle inspector"><PanelRight size={17} /></button>
          <button className="btn primary small capture-button" onClick={() => setCapture({ open: true, kind: 'note' })}><Plus size={16} /><span>Capture</span></button>
          <button className={cn('sync-orb', api.syncError && 'error')} onClick={() => api.auth.status === 'authenticated' ? void api.syncNow() : setAuthOpen(true)} title={syncLabel} aria-label={syncLabel}>{syncIcon}<span>{syncLabel}</span></button>
          <button className="auth-button" onClick={() => setAuthOpen(true)} aria-label="Authentication">{api.auth.status === 'authenticated' ? <span className="avatar">{(api.auth.user?.login ?? 'G').slice(0, 1).toUpperCase()}</span> : <GitHubIcon size={17} />}</button>
        </div>
      </header>

      <div className="shell">
        <nav className={cn('object-rail glass', api.settings.sidebarCollapsed && 'collapsed')} aria-label="Object rail">
          <div className="rail-section">
            {railQueries.map((item) => <button key={item.id} className="rail-item" onClick={() => openQueryDefinition(item.label, item.definition)}>{item.icon}<span>{item.label}</span></button>)}
            <button className="rail-item" onClick={() => openWindow({ view: 'trash', title: 'Trash' })}><Trash2 size={17} /><span>Trash</span></button>
          </div>
          <div className="rail-section">
            <div className="rail-heading">Saved queries</div>
            {api.queries.length === 0 && <div className="muted small-text">Save a query from any live view.</div>}
            {api.queries.map((query) => <button key={query.id} className="rail-item" onClick={() => openSavedQuery(query.id)}><Search size={16} /><span>{query.name}</span></button>)}
          </div>
          <div className="rail-section">
            <div className="rail-heading">Tags</div>
            <div className="tag-list">{allTags.map((tag) => <button key={tag} className="tag-chip" onClick={() => openQueryDefinition(`#${tag}`, { ...emptyQuery, tags: [tag] })}>#{tag}</button>)}</div>
          </div>
          <div className="rail-footer"><button className="rail-item" onClick={() => openWindow({ view: 'settings', title: 'Settings' })}><Settings size={17} /><span>Settings</span></button></div>
        </nav>

        <main className="canvas" ref={canvasRef} aria-label="Window canvas">
          {api.loading && <div className="loading-state glass"><RefreshCw size={20} className="spin" /><span>Booting workspace…</span></div>}
          {!api.loading && windows.filter((win) => !win.minimized).length === 0 && (
            <div className="empty-canvas glass">
              <span className="brand-mark large">◎</span>
              <h1>Your knowledge, running like an OS</h1>
              <p>Capture text, connect it to work, and resume exactly where you left off.</p>
              <div className="button-row center"><button className="btn primary" onClick={() => setCapture({ open: true, kind: 'note' })}><Plus size={16} /> Capture</button><button className="btn" onClick={() => setPaletteOpen(true)}><Search size={16} /> Command palette</button></div>
            </div>
          )}
          {snapPreview && <div className={cn('snap-preview', snapPreview)} aria-hidden="true" />}
          {windows.filter((win) => !win.minimized || win.id === mobileActiveId).map((win) => {
            const objectTitle = win.view === 'object' ? api.objects.find((object) => object.id === win.objectId)?.title : undefined;
            return (
              <WindowFrame key={win.id} window={{ ...win, title: objectTitle ?? win.title }} active={activeWindow?.id === win.id} mobileActive={(activeWindow?.id ?? topWindow?.id) === win.id} onFocus={() => focusWindow(win.id)} onClose={() => closeWindow(win.id)} onMinimize={() => minimizeWindow(win.id)} onMaximize={() => maximizeWindow(win.id)} onRectChange={(rect) => setWindowRect(win.id, rect)} onSnapPreview={setSnapPreview} onSnap={(zone) => snapWindow(win.id, zone)}>
                {renderWindowContent(win)}
              </WindowFrame>
            );
          })}
        </main>

        {api.settings.inspectorOpen && <Inspector object={activeObject} objects={api.objects} onOpenObject={openObject} onOpenHistory={(id) => openWindow({ view: 'history', objectId: id, title: 'Time machine' })} onUpdate={(id, patch) => void api.updateObject(id, patch)} />}
      </div>

      <footer className="dock glass" aria-label="Orbit dock">
        <button className="dock-button" onClick={() => openQueryDefinition('Today', railQueries[0].definition)} aria-label="Today"><Layers size={19} /></button>
        <button className="dock-button" onClick={() => setPaletteOpen(true)} aria-label="Search"><Search size={19} /></button>
        <button className="dock-button primary" onClick={() => setCapture({ open: true, kind: 'note' })} aria-label="Capture"><Plus size={20} /></button>
        <div className="dock-divider" />
        {api.settings.workspaces.map((workspace) => <button key={workspace.id} className={cn('workspace-orb', workspace.id === api.settings.activeWorkspace && 'active')} style={{ ['--orb-accent' as string]: workspace.accent === 'violet' ? '#A78BFA' : '#8AB4FF' }} onClick={() => switchWorkspace(workspace.id)} title={workspace.name} aria-label={`Switch to ${workspace.name}`} />)}
        <div className="dock-divider" />
        <div className="dock-chips">
          {windows.slice(0, 5).map((win) => <button key={win.id} className={cn('dock-chip', win.minimized && 'minimized', activeWindow?.id === win.id && 'active')} onClick={() => focusWindow(win.id)} title={win.title}><span>{win.title.slice(0, 1)}</span><small>{win.title}</small></button>)}
        </div>
        <div className="spacer" />
        <button className="dock-button" onClick={() => api.updateSettings((previous) => ({ ...previous, focusMode: !previous.focusMode }))} aria-label="Toggle focus lens"><Layers size={18} /></button>
        <button className="dock-button" onClick={() => openWindow({ view: 'settings', title: 'Settings' })} aria-label="Settings"><Settings size={18} /></button>
      </footer>

      <nav className="mobile-tabs glass" aria-label="Mobile navigation">
        <button onClick={() => openQueryDefinition('Today', railQueries[0].definition)}><Layers size={19} /><span>Today</span></button>
        <button onClick={() => setPaletteOpen(true)}><Search size={19} /><span>Search</span></button>
        <button className="capture-fab" onClick={() => setCapture({ open: true, kind: 'note' })} aria-label="Capture"><Plus size={22} /></button>
        <button onClick={() => { const index = api.settings.workspaces.findIndex((workspace) => workspace.id === api.settings.activeWorkspace); switchWorkspace(api.settings.workspaces[(index + 1) % api.settings.workspaces.length].id); }}><FolderKanban size={19} /><span>Spaces</span></button>
        <button onClick={() => openQueryDefinition('Inbox', railQueries[1].definition)}><Inbox size={19} /><span>Inbox</span></button>
      </nav>

      <CommandPalette open={paletteOpen} objects={api.objects} queries={api.queries} auth={api.auth} onClose={() => setPaletteOpen(false)} onOpenObject={openObject} onOpenQuery={openSavedQuery} onCreate={(kind) => void createAndOpen(kind)} onOpenSettings={() => openWindow({ view: 'settings', title: 'Settings' })} onOpenTrash={() => openWindow({ view: 'trash', title: 'Trash' })} onToggleTheme={() => api.updateSettings((previous) => ({ ...previous, theme: previous.theme === 'dark' ? 'light' : 'dark' }))} onToggleFocus={() => api.updateSettings((previous) => ({ ...previous, focusMode: !previous.focusMode }))} onSignIn={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} auth={api.auth} onClose={() => setAuthOpen(false)} onSignIn={api.signIn} />
      <CaptureModal open={capture.open} initialKind={capture.kind} onClose={() => setCapture((value) => ({ ...value, open: false }))} onCreate={async (input) => { const object = await api.createObject(input); openObject(object.id, object.title); api.notify('Captured', object.title, 'success'); }} />

      <div className="toast-stack" aria-live="polite">
        {api.toasts.map((toast) => <div key={toast.id} className={cn('toast glass-deep', toast.tone)}><div><strong>{toast.title}</strong>{toast.description && <p>{toast.description}</p>}</div><button className="icon-button" onClick={() => api.dismissToast(toast.id)} aria-label="Dismiss"><X size={15} /></button></div>)}
      </div>
    </div>
  );
}
