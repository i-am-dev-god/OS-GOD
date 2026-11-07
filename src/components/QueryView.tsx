'use client';

import { useMemo, useState } from 'react';
import { BookmarkPlus, CheckSquare, FileText, FolderKanban, BookOpen, Scale } from 'lucide-react';
import type { ObjectKind, ObjectStatus, OSObject, QueryDefinition } from '@/lib/types';
import { cn, emptyQuery, filterObjects, formatDate, kindLabel } from '@/lib/utils';

interface Props {
  initial?: QueryDefinition;
  objects: OSObject[];
  onOpenObject: (id: string) => void;
  onSave: (name: string, definition: QueryDefinition) => void;
}

const kindIcons: Record<ObjectKind, React.ReactNode> = {
  note: <FileText size={15} />, task: <CheckSquare size={15} />, project: <FolderKanban size={15} />, source: <BookOpen size={15} />, decision: <Scale size={15} />,
};

export default function QueryView({ initial, objects, onOpenObject, onSave }: Props) {
  const [definition, setDefinition] = useState<QueryDefinition>(initial ?? emptyQuery);
  const results = useMemo(() => filterObjects(objects, definition), [objects, definition]);

  function patch(next: Partial<QueryDefinition>) { setDefinition((previous) => ({ ...previous, ...next })); }
  function toggleKind(kind: ObjectKind) { patch({ kinds: definition.kinds.includes(kind) ? definition.kinds.filter((value) => value !== kind) : [...definition.kinds, kind] }); }
  function toggleStatus(status: ObjectStatus) { patch({ statuses: definition.statuses.includes(status) ? definition.statuses.filter((value) => value !== status) : [...definition.statuses, status] }); }

  return (
    <div className="query-view">
      <div className="query-filters">
        <input className="input" value={definition.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Filter by text…" aria-label="Query search" />
        <div className="filter-pills">
          {(['note', 'task', 'project', 'source', 'decision'] as ObjectKind[]).map((kind) => (
            <button key={kind} className={cn('filter-pill', definition.kinds.includes(kind) && 'active')} onClick={() => toggleKind(kind)}>{kindIcons[kind]} {kindLabel(kind)}</button>
          ))}
        </div>
        <div className="filter-pills">
          {(['inbox', 'active', 'waiting', 'done'] as ObjectStatus[]).map((status) => (
            <button key={status} className={cn('filter-pill', definition.statuses.includes(status) && 'active')} onClick={() => toggleStatus(status)}>{status}</button>
          ))}
        </div>
        <div className="query-controls">
          <select className="select compact" value={definition.due} onChange={(event) => patch({ due: event.target.value as QueryDefinition['due'] })} aria-label="Due filter">
            <option value="any">Any due date</option><option value="overdue">Overdue</option><option value="today">Today</option><option value="week">This week</option><option value="none">No due date</option>
          </select>
          <select className="select compact" value={definition.sort} onChange={(event) => patch({ sort: event.target.value as QueryDefinition['sort'] })} aria-label="Sort">
            <option value="updated">Recently updated</option><option value="created">Recently created</option><option value="title">Title</option><option value="due">Due date</option>
          </select>
          <button className="btn small" onClick={() => { const name = prompt('Save query as', 'Saved query'); if (name) onSave(name, definition); }}><BookmarkPlus size={15} /> Save query</button>
        </div>
      </div>
      <div className="query-summary"><span>{results.length} live results</span><span>One database · many views</span></div>
      <div className="object-table" role="table" aria-label="Query results">
        <div className="object-row header" role="row"><span>Object</span><span>Status</span><span>Due</span><span>Updated</span></div>
        {results.length === 0 && <div className="empty-state">No objects match this query. Capture something or loosen a filter.</div>}
        {results.slice(0, 200).map((object) => (
          <button key={object.id} className="object-row" role="row" onClick={() => onOpenObject(object.id)}>
            <span className="object-cell-title">{kindIcons[object.kind]} <span>{object.title}</span></span>
            <span className={cn('badge', object.status)}>{object.status}</span>
            <span>{formatDate(object.due_date)}</span>
            <span>{formatDate(object.updated_at)}</span>
          </button>
        ))}
        {results.length > 200 && <div className="empty-state small">Showing first 200 results. Narrow the query for precision.</div>}
      </div>
    </div>
  );
}
