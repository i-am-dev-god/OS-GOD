'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckSquare, FileText, FolderKanban, Layers, Moon, Scale, Search, Settings, Trash2 } from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import type { AuthState, ObjectKind, OSObject, SavedQuery } from '@/lib/types';
import { cn, kindLabel, relativeTime, searchScore } from '@/lib/utils';

interface Props {
  open: boolean;
  objects: OSObject[];
  queries: SavedQuery[];
  auth: AuthState;
  onClose: () => void;
  onOpenObject: (id: string) => void;
  onOpenQuery: (id: string) => void;
  onCreate: (kind: ObjectKind) => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  onToggleTheme: () => void;
  onToggleFocus: () => void;
  onSignIn: () => void;
}

interface Item { id: string; label: string; hint?: string; group: string; icon: React.ReactNode; run: () => void }

export default function CommandPalette(props: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [props.open]);

  const items = useMemo<Item[]>(() => {
    const close = props.onClose;
    const actions: Item[] = [
      { id: 'create-note', label: 'Create note', hint: 'Capture text', group: 'Actions', icon: <FileText size={16} />, run: () => { props.onCreate('note'); close(); } },
      { id: 'create-task', label: 'Create task', hint: 'Turn text into action', group: 'Actions', icon: <CheckSquare size={16} />, run: () => { props.onCreate('task'); close(); } },
      { id: 'create-project', label: 'Create project', hint: 'Organize work', group: 'Actions', icon: <FolderKanban size={16} />, run: () => { props.onCreate('project'); close(); } },
      { id: 'create-source', label: 'Create source', hint: 'Save evidence', group: 'Actions', icon: <BookOpen size={16} />, run: () => { props.onCreate('source'); close(); } },
      { id: 'create-decision', label: 'Create decision', hint: 'Record rationale', group: 'Actions', icon: <Scale size={16} />, run: () => { props.onCreate('decision'); close(); } },
      { id: 'settings', label: 'Open settings', hint: 'Export, import, theme', group: 'Actions', icon: <Settings size={16} />, run: () => { props.onOpenSettings(); close(); } },
      { id: 'trash', label: 'Open trash', hint: 'Restore deleted objects', group: 'Actions', icon: <Trash2 size={16} />, run: () => { props.onOpenTrash(); close(); } },
      { id: 'theme', label: 'Toggle theme', hint: 'Light / dark', group: 'Actions', icon: <Moon size={16} />, run: () => { props.onToggleTheme(); close(); } },
      { id: 'focus', label: 'Toggle focus lens', hint: 'Dim surrounding UI', group: 'Actions', icon: <Layers size={16} />, run: () => { props.onToggleFocus(); close(); } },
    ];
    if (props.auth.status !== 'authenticated') actions.push({ id: 'signin', label: 'Sign in with GitHub', hint: 'Secure cloud sync', group: 'Actions', icon: <GitHubIcon size={16} />, run: () => { props.onSignIn(); close(); } });
    const q = query.trim().toLowerCase();
    const filteredActions = q ? actions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(q)) : actions.slice(0, 6);
    const objectItems = props.objects
      .filter((object) => !object.deleted_at)
      .map((object) => ({ object, score: q ? searchScore(object, q) : 0 }))
      .filter((entry) => (q ? entry.score > 0 : true))
      .sort((a, b) => (q ? b.score - a.score : b.object.updated_at.localeCompare(a.object.updated_at)))
      .slice(0, q ? 8 : 6)
      .map(({ object }) => ({
        id: `object-${object.id}`,
        label: object.title,
        hint: `${kindLabel(object.kind)} · ${relativeTime(object.updated_at)}`,
        group: q ? 'Objects' : 'Recent',
        icon: <FileText size={16} />,
        run: () => { props.onOpenObject(object.id); close(); },
      }));
    const queryItems = q ? props.queries.filter((saved) => saved.name.toLowerCase().includes(q)).slice(0, 4).map((saved) => ({
      id: `query-${saved.id}`, label: saved.name, hint: 'Saved query', group: 'Queries', icon: <Search size={16} />, run: () => { props.onOpenQuery(saved.id); close(); },
    })) : [];
    return [...objectItems, ...queryItems, ...filteredActions];
  }, [props, query]);

  useEffect(() => setSelected(0), [query]);

  if (!props.open) return null;

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') props.onClose();
    if (event.key === 'ArrowDown') { event.preventDefault(); setSelected((value) => Math.min(value + 1, items.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setSelected((value) => Math.max(value - 1, 0)); }
    if (event.key === 'Enter' && items[selected]) { event.preventDefault(); items[selected].run(); }
  }

  let lastGroup = '';
  return (
    <div className="palette-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) props.onClose(); }}>
      <div className="palette glass-deep" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="palette-input-row">
          <Search size={18} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onKeyDown} placeholder="Search objects, commands, queries…" aria-label="Search commands" />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results" role="listbox" aria-label="Command results">
          {items.length === 0 && <div className="empty-state small">No matches. Try creating a note.</div>}
          {items.map((item, index) => {
            const groupHeader = item.group !== lastGroup ? <div className="palette-group" key={`group-${item.group}`}>{item.group}</div> : null;
            lastGroup = item.group;
            return (
              <div key={item.id}>
                {groupHeader}
                <button className={cn('palette-item', index === selected && 'selected')} role="option" aria-selected={index === selected} onMouseEnter={() => setSelected(index)} onClick={item.run}>
                  <span className="palette-icon">{item.icon}</span>
                  <span className="palette-label">{item.label}</span>
                  {item.hint && <span className="palette-hint">{item.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="palette-footer"><span>↑↓ navigate</span><span>↵ open</span><span>Ctrl/Cmd K</span></div>
      </div>
    </div>
  );
}
