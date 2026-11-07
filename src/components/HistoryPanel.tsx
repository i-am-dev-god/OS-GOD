'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { ObjectVersion } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  objectId: string;
  loadVersions: (id: string) => Promise<ObjectVersion[]>;
  onRestore: (objectId: string, version: ObjectVersion) => void;
}

export default function HistoryPanel({ objectId, loadVersions, onRestore }: Props) {
  const [versions, setVersions] = useState<ObjectVersion[]>([]);
  const [selected, setSelected] = useState<ObjectVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadVersions(objectId)
      .then((rows) => { if (!mounted) return; setVersions(rows); setSelected(rows[0] ?? null); setLoading(false); })
      .catch((err) => { if (!mounted) return; setError(err instanceof Error ? err.message : 'Failed to load history'); setLoading(false); });
    return () => { mounted = false; };
  }, [objectId, loadVersions]);

  if (loading) return <div className="empty-state">Loading time machine…</div>;
  if (error) return <div className="inline-error" role="alert">{error}</div>;
  if (!versions.length) return <div className="empty-state">No versions yet. Edit the object to create history.</div>;

  return (
    <div className="history-panel">
      <div className="history-list">
        {versions.map((version) => (
          <button key={version.id} className={cn('version-item', selected?.id === version.id && 'selected')} onClick={() => setSelected(version)}>
            <strong>v{version.version}</strong>
            <span>{version.title}</span>
            <small>{formatDate(version.created_at)}</small>
          </button>
        ))}
      </div>
      {selected && (
        <div className="version-preview">
          <div className="version-header">
            <div><strong>{selected.title}</strong><small>Version {selected.version} · {formatDate(selected.created_at)}</small></div>
            <button className="btn small" onClick={() => { if (confirm(`Restore version ${selected.version}? Current content remains in history.`)) onRestore(objectId, selected); }}><RotateCcw size={15} /> Restore</button>
          </div>
          <pre className="version-body">{selected.body || '(empty)'}</pre>
        </div>
      )}
    </div>
  );
}
