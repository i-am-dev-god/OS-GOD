'use client';

import { useState } from 'react';
import { ArrowUpRight, History, Link2 } from 'lucide-react';
import type { OSObject } from '@/lib/types';
import { backlinks, cn, formatDate, kindLabel, resolveLinks } from '@/lib/utils';
import type { ObjectInput } from '@/lib/validation';

interface Props {
  object: OSObject | null;
  objects: OSObject[];
  onOpenObject: (id: string) => void;
  onOpenHistory: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ObjectInput>) => void;
}

export default function Inspector({ object, objects, onOpenObject, onOpenHistory, onUpdate }: Props) {
  const [tab, setTab] = useState<'properties' | 'backlinks' | 'history'>('properties');
  if (!object) return <aside className="inspector glass"><div className="empty-state small">Select an object to inspect its properties, links, and history.</div></aside>;
  const outgoing = resolveLinks(object, objects);
  const incoming = backlinks(object, objects);

  return (
    <aside className="inspector glass" aria-label="Context inspector">
      <div className="inspector-header"><strong>{object.title}</strong><small>{kindLabel(object.kind)} · v{object.version}</small></div>
      <div className="inspector-tabs">
        {(['properties', 'backlinks', 'history'] as const).map((value) => <button key={value} className={cn('inspector-tab', tab === value && 'active')} onClick={() => setTab(value)}>{value}</button>)}
      </div>
      {tab === 'properties' && (
        <div className="inspector-body">
          <label className="field"><span>Status</span>
            <select className="select" value={object.status} onChange={(event) => onUpdate(object.id, { status: event.target.value as OSObject['status'] })}>
              {(['inbox', 'active', 'waiting', 'done', 'archived'] as const).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <div className="field"><span>Due</span><strong>{formatDate(object.due_date)}</strong></div>
          <div className="field"><span>Tags</span><div className="tag-list">{object.tags.length ? object.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>) : <small>None</small>}</div></div>
          <div className="field"><span>Created</span><strong>{formatDate(object.created_at)}</strong></div>
          <div className="field"><span>Updated</span><strong>{formatDate(object.updated_at)}</strong></div>
          <div className="field"><span>Outgoing links</span>{outgoing.length ? outgoing.map((target) => <button key={target.id} className="link-row" onClick={() => onOpenObject(target.id)}><Link2 size={14} />{target.title}<ArrowUpRight size={13} /></button>) : <small>No [[wikilinks]] yet.</small>}</div>
        </div>
      )}
      {tab === 'backlinks' && (
        <div className="inspector-body">
          {incoming.length === 0 && <div className="empty-state small">No backlinks yet. Mention [[{object.title}]] in another object.</div>}
          {incoming.map((source) => <button key={source.id} className="link-row" onClick={() => onOpenObject(source.id)}><Link2 size={14} />{source.title}<ArrowUpRight size={13} /></button>)}
        </div>
      )}
      {tab === 'history' && (
        <div className="inspector-body">
          <p className="muted">Every saved change creates a recoverable version.</p>
          <button className="btn" onClick={() => onOpenHistory(object.id)}><History size={15} /> Open time machine</button>
        </div>
      )}
    </aside>
  );
}
