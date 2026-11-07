'use client';

import { useRef, useState } from 'react';
import { CloudUpload, FileJson, FileText, LogOut, Monitor, Moon, ShieldCheck, Sun, Trash2, Upload } from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import type { WorkspaceAPI } from '@/hooks/useWorkspace';
import { basePath, errorMessage } from '@/lib/utils';

interface Props { api: WorkspaceAPI; onOpenAuth: () => void }

export default function SettingsPanel({ api, onOpenAuth }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const isCloud = api.auth.status === 'authenticated';

  async function importFile(file: File) {
    if (file.size > 2_000_000) { api.notify('Import too large', 'Maximum import size is 2 MB.', 'error'); return; }
    setBusy('import');
    try {
      const text = await file.text();
      if (/\.(md|markdown|txt)$/i.test(file.name)) {
        await api.createObject({ kind: 'note', title: file.name.replace(/\.[^.]+$/, '').slice(0, 200) || 'Imported note', body: text, status: 'inbox', tags: ['imported'], due_date: null });
        api.notify('Markdown imported', file.name, 'success');
      } else {
        await api.importPayload(JSON.parse(text));
      }
    } catch (error) { api.notify('Import failed', errorMessage(error), 'error'); }
    finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function run(key: string, fn: () => Promise<void> | void) {
    setBusy(key);
    try { await fn(); } catch (error) { api.notify('Action failed', errorMessage(error), 'error'); }
    finally { setBusy(null); }
  }

  return (
    <div className="settings-panel">
      <section className="settings-section">
        <h3>Appearance & smoothness</h3>
        <div className="settings-grid">
          <label className="field"><span>Theme</span>
            <select className="select" value={api.settings.theme} onChange={(event) => api.updateSettings({ theme: event.target.value as 'system' | 'light' | 'dark' })}>
              <option value="system">Follow system</option><option value="light">Aurora light</option><option value="dark">Obsidian dark</option>
            </select>
          </label>
          <label className="field"><span>Visual quality</span>
            <select className="select" value={api.settings.quality} onChange={(event) => api.updateSettings({ quality: event.target.value as 'auto' | 'lite' | 'standard' | 'rich' })}>
              <option value="auto">Auto adaptive</option><option value="lite">Lite / solid</option><option value="standard">Standard glass</option><option value="rich">Rich glass</option>
            </select>
          </label>
        </div>
        <div className="theme-icons"><Sun size={16} /><Moon size={16} /><Monitor size={16} /><span>Glass is budgeted; reduced motion and transparency are respected.</span></div>
      </section>

      <section className="settings-section">
        <h3>Account & sync</h3>
        {isCloud ? (
          <div className="account-row">
            <div className="avatar">{(api.auth.user?.login ?? api.auth.user?.name ?? 'G').slice(0, 1).toUpperCase()}</div>
            <div><strong>{api.auth.user?.name ?? api.auth.user?.login ?? 'GitHub user'}</strong><small>{api.auth.user?.login ? `@${api.auth.user.login}` : 'GitHub identity'} · cloud workspace</small></div>
            <button className="btn small" onClick={() => run('sync', api.syncNow)} disabled={busy === 'sync'}>Sync now</button>
            <button className="btn small" onClick={() => run('signout', api.signOut)} disabled={busy === 'signout'}><LogOut size={14} /> Sign out</button>
          </div>
        ) : (
          <div className="account-row">
            <div className="avatar local">L</div>
            <div><strong>Local workspace</strong><small>Stored in this browser. GitHub sign-in enables owner-only cloud sync.</small></div>
            <button className="btn primary small" onClick={onOpenAuth}><GitHubIcon size={15} /> Sign in</button>
          </div>
        )}
        {isCloud && <button className="btn" onClick={() => run('copy', api.copyLocalToCloud)} disabled={busy === 'copy'}><CloudUpload size={15} /> {busy === 'copy' ? 'Copying local objects…' : 'Copy local workspace into cloud'}</button>}
        {api.syncError && <div className="inline-error" role="alert">{api.syncError}</div>}
      </section>

      <section className="settings-section">
        <h3>Portable by design</h3>
        <div className="button-row">
          <button className="btn" onClick={api.exportJSON}><FileJson size={15} /> Export JSON</button>
          <button className="btn" onClick={api.exportMarkdown}><FileText size={15} /> Export Markdown</button>
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy === 'import'}><Upload size={15} /> {busy === 'import' ? 'Importing…' : 'Import JSON / Markdown'}</button>
          <input ref={fileRef} type="file" accept=".json,.md,.markdown,.txt,application/json,text/markdown,text/plain" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
        </div>
        <p className="muted small-text">Exports are readable text. Imports are schema-validated, size-limited, and never execute HTML or scripts.</p>
      </section>

      <section className="settings-section">
        <h3>GitHub Pages</h3>
        <p className="muted small-text">This build is a static export. Base path: <code>{basePath() || '/'}</code>. Publish the <code>out/</code> directory with the included GitHub Actions workflow. Keep Supabase secrets out of the repo; only the publishable key is public, protected by RLS.</p>
        <div className="security-notes compact">
          <strong><ShieldCheck size={15} /> Security posture</strong>
          <ul>
            <li>GitHub OAuth via Supabase PKCE; least-privilege <code>read:user</code>.</li>
            <li>Owner-only RLS on objects, versions, links, queries, and settings.</li>
            <li>No service-role key, no arbitrary SQL, no raw HTML rendering.</li>
            <li>Optimistic concurrency with conflict copies instead of silent overwrite.</li>
          </ul>
        </div>
      </section>

      <section className="settings-section danger-zone">
        <h3>Danger zone</h3>
        <button className="btn danger" onClick={() => { if (confirm('Clear this workspace cache on this browser? Cloud data is not deleted.')) void run('clear', api.clearLocalData); }} disabled={busy === 'clear'}><Trash2 size={15} /> Clear local {isCloud ? 'cloud cache' : 'workspace'}</button>
        <p className="muted small-text">For cloud data, delete objects in Trash. Account deletion is handled by the auth provider/database owner.</p>
      </section>
    </div>
  );
}
