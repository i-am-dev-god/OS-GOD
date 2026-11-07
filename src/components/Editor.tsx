'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, History, Pencil, Trash2 } from 'lucide-react';
import type { OSObject } from '@/lib/types';
import { cn, formatDate, kindLabel } from '@/lib/utils';
import { objectInputSchema, type ObjectInput } from '@/lib/validation';

interface Props {
  object: OSObject;
  onUpdate: (id: string, patch: Partial<ObjectInput>) => Promise<OSObject | null>;
  onDelete: (id: string) => void;
  onOpenHistory: (id: string) => void;
}

export default function Editor({ object, onUpdate, onDelete, onOpenHistory }: Props) {
  const [title, setTitle] = useState(object.title);
  const [body, setBody] = useState(object.body);
  const [tagsText, setTagsText] = useState(object.tags.join(', '));
  const [kind, setKind] = useState(object.kind);
  const [status, setStatus] = useState(object.status);
  const [due, setDue] = useState(object.due_date ?? '');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef({ title, body, tagsText, kind, status, due });
  draftRef.current = { title, body, tagsText, kind, status, due };

  useEffect(() => {
    if (!dirtyRef.current) {
      setTitle(object.title); setBody(object.body); setTagsText(object.tags.join(', ')); setKind(object.kind); setStatus(object.status); setDue(object.due_date ?? '');
    }
  }, [object.id, object.version, object.title, object.body, object.tags, object.kind, object.status, object.due_date]);

  function buildInput(): ObjectInput | null {
    const draft = draftRef.current;
    const parsed = objectInputSchema.safeParse({
      kind: draft.kind,
      title: draft.title.trim() || 'Untitled',
      body: draft.body,
      status: draft.status,
      tags: draft.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
      due_date: draft.due || null,
      deleted_at: object.deleted_at,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid object');
      return null;
    }
    setError(null);
    return parsed.data;
  }

  const flush = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!dirtyRef.current) return;
    const input = buildInput();
    if (!input) return;
    dirtyRef.current = false;
    void onUpdate(object.id, input);
  };

  function schedule() {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 700);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); if (dirtyRef.current) { const input = buildInput(); if (input) void onUpdate(object.id, input); } }, []);

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <select className="select compact" value={kind} onChange={(event) => { setKind(event.target.value as OSObject['kind']); schedule(); }} aria-label="Object type">
          {(['note', 'task', 'project', 'source', 'decision'] as const).map((value) => <option key={value} value={value}>{kindLabel(value)}</option>)}
        </select>
        <select className="select compact" value={status} onChange={(event) => { setStatus(event.target.value as OSObject['status']); schedule(); }} aria-label="Status">
          {(['inbox', 'active', 'waiting', 'done', 'archived'] as const).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <input className="input compact date" type="date" value={due} onChange={(event) => { setDue(event.target.value); schedule(); }} aria-label="Due date" />
        <div className="spacer" />
        <button className="icon-button" onClick={() => setPreview((value) => !value)} aria-label={preview ? 'Edit markdown' : 'Preview markdown'}>{preview ? <Pencil size={16} /> : <Eye size={16} />}</button>
        <button className="icon-button" onClick={() => onOpenHistory(object.id)} aria-label="Version history"><History size={16} /></button>
        <button className="icon-button danger" onClick={() => { if (confirm('Move this object to trash?')) onDelete(object.id); }} aria-label="Move to trash"><Trash2 size={16} /></button>
      </div>
      <input className="title-input" value={title} onChange={(event) => { setTitle(event.target.value); schedule(); }} onBlur={flush} placeholder="Untitled" aria-label="Title" maxLength={200} />
      <input className="input tags-input" value={tagsText} onChange={(event) => { setTagsText(event.target.value); schedule(); }} onBlur={flush} placeholder="Tags, comma separated" aria-label="Tags" />
      {error && <div className="inline-error" role="alert">{error}</div>}
      {preview ? (
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{
              a: ({ href, children }) => {
                const safe = href && /^(https?:|mailto:|#|\/)/i.test(href) ? href : undefined;
                return <a href={safe} target={safe?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{children}</a>;
              },
              img: ({ alt }) => <span className="muted">[image blocked: {alt || 'text-only workspace'}]</span>,
            }}
          >{body || '*Nothing to preview yet.*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea className="body-textarea" value={body} onChange={(event) => { setBody(event.target.value); schedule(); }} onBlur={flush} placeholder="Capture text… Markdown and [[wikilinks]] are supported." aria-label="Body" spellCheck />
      )}
      <div className="editor-footer">
        <span>{words} words</span>
        <span>v{object.version}</span>
        <span className={cn('sync-label', object.sync)}>{object.sync === 'synced' ? 'Synced' : object.sync === 'pending' ? 'Saving…' : object.sync === 'conflict' ? 'Conflict copy' : object.sync === 'error' ? 'Sync error' : 'Saved locally'}</span>
        <span>Updated {formatDate(object.updated_at)}</span>
      </div>
    </div>
  );
}
