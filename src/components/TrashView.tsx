'use client';

import { RotateCcw, Trash2 } from 'lucide-react';
import type { OSObject } from '@/lib/types';
import { formatDate, kindLabel } from '@/lib/utils';

interface Props {
  objects: OSObject[];
  onRestore: (id: string) => void;
  onDestroy: (id: string) => void;
  onEmpty: () => void;
}

export default function TrashView({ objects, onRestore, onDestroy, onEmpty }: Props) {
  const deleted = objects.filter((object) => object.deleted_at);
  return (
    <div className="trash-view">
      <div className="query-summary">
        <span>{deleted.length} objects in trash</span>
        {deleted.length > 0 && <button className="btn small danger" onClick={() => { if (confirm('Permanently delete all trashed objects? This cannot be undone.')) onEmpty(); }}><Trash2 size={15} /> Empty trash</button>}
      </div>
      {deleted.length === 0 && <div className="empty-state">Trash is empty. Deleted objects are recoverable until permanently removed.</div>}
      <div className="object-table">
        {deleted.map((object) => (
          <div key={object.id} className="object-row">
            <span className="object-cell-title"><Trash2 size={15} /><span>{object.title}<small>{kindLabel(object.kind)} · deleted {formatDate(object.deleted_at)}</small></span></span>
            <span><button className="btn small" onClick={() => onRestore(object.id)}><RotateCcw size={14} /> Restore</button></span>
            <span><button className="btn small danger" onClick={() => { if (confirm(`Permanently delete “${object.title}”?`)) onDestroy(object.id); }}>Delete forever</button></span>
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}
