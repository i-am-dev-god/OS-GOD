'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ObjectKind } from '@/lib/types';
import { cn, kindLabel } from '@/lib/utils';
import type { ObjectInput } from '@/lib/validation';

interface Props { open: boolean; initialKind?: ObjectKind; onClose: () => void; onCreate: (input: ObjectInput) => Promise<void> }

export default function CaptureModal({ open, initialKind = 'note', onClose, onCreate }: Props) {
  const [kind, setKind] = useState<ObjectKind>(initialKind);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setKind(initialKind); setTitle(''); setBody(''); setError(null); setTimeout(() => titleRef.current?.focus(), 40); } }, [open, initialKind]);
  if (!open) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await onCreate({ kind, title: title.trim() || `Untitled ${kindLabel(kind).toLowerCase()}`, body, status: kind === 'task' ? 'active' : 'inbox', tags: [], due_date: null });
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Capture failed'); }
    finally { setBusy(false); }
  }

  return (
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="modal glass-deep capture-modal" role="dialog" aria-modal="true" aria-label="Quick capture" onSubmit={submit}>
        <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h2>Capture</h2>
        <div className="filter-pills">
          {(['note', 'task', 'project', 'source', 'decision'] as ObjectKind[]).map((value) => <button type="button" key={value} className={cn('filter-pill', kind === value && 'active')} onClick={() => setKind(value)}>{kindLabel(value)}</button>)}
        </div>
        <input ref={titleRef} className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" aria-label="Capture title" maxLength={200} />
        <textarea className="input capture-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Paste or type text… Markdown and [[wikilinks]] welcome." aria-label="Capture body" rows={7} />
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save locally'}</button></div>
        <p className="muted small-text">Text-only. Saved to your browser database immediately; synced after GitHub sign-in when configured.</p>
      </form>
    </div>
  );
}
