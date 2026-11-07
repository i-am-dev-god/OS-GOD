'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, ShieldCheck, X } from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import type { AuthState } from '@/lib/types';
import { supabaseCallbackUrl } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils';

interface Props { open: boolean; auth: AuthState; onClose: () => void; onSignIn: () => Promise<void> }

export default function AuthModal({ open, auth, onClose, onSignIn }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const callback = supabaseCallbackUrl();
  const needsSetup = auth.cloudConfigured && auth.githubEnabled === false;

  async function signIn() {
    setBusy(true); setError(null);
    try { await onSignIn(); } catch (err) { setError(errorMessage(err, 'GitHub sign-in failed')); setBusy(false); }
  }

  async function copyCallback() {
    if (!callback) return;
    await navigator.clipboard.writeText(callback);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal glass-deep auth-modal" role="dialog" aria-modal="true" aria-label="GitHub authentication">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="auth-hero"><GitHubIcon size={28} /><h2>Sign in with GitHub</h2><p>Least-privilege identity only. No repository, organization, or write access is requested.</p></div>
        {auth.status === 'authenticated' ? (
          <div className="notice success"><ShieldCheck size={18} /><div><strong>Signed in{auth.user?.login ? ` as @${auth.user.login}` : ''}</strong><p>Your cloud workspace is protected by Postgres row-level security.</p></div></div>
        ) : !auth.cloudConfigured ? (
          <div className="notice"><div><strong>Cloud not configured</strong><p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>. The local workspace still works.</p></div></div>
        ) : needsSetup ? (
          <div className="setup-steps">
            <div className="notice"><div><strong>GitHub provider needs activation</strong><p>The OAuth flow is implemented, but the GitHub provider is disabled until its OAuth app credentials are added in Supabase.</p></div></div>
            <ol>
              <li>Create a GitHub OAuth App. Homepage: this site. Authorization callback: the Supabase callback below.</li>
              <li>In Supabase → Authentication → Providers → GitHub, enable GitHub and enter the Client ID and Client Secret.</li>
              <li>Keep the Client Secret in Supabase only. Never commit it or expose it through GitHub Pages.</li>
            </ol>
            {callback && <div className="callback-row"><code>{callback}</code><button className="icon-button" onClick={copyCallback} aria-label="Copy callback URL">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>}
            <div className="auth-links">
              <a className="btn small" href="https://github.com/settings/applications/new" target="_blank" rel="noopener noreferrer">GitHub OAuth apps <ExternalLink size={14} /></a>
              <a className="btn small" href="https://supabase.com/dashboard/project/_/auth/providers" target="_blank" rel="noopener noreferrer">Supabase providers <ExternalLink size={14} /></a>
            </div>
          </div>
        ) : (
          <button className="btn primary large github-button" onClick={signIn} disabled={busy}><GitHubIcon size={18} /> {busy ? 'Redirecting to GitHub…' : 'Continue with GitHub'}</button>
        )}
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="security-notes">
          <strong><ShieldCheck size={15} /> Security boundary</strong>
          <ul>
            <li>PKCE authorization-code flow; no implicit token grant.</li>
            <li>OAuth client secret stays server-side in Supabase.</li>
            <li>Every cloud table enforces owner-only row-level security.</li>
            <li>Markdown is rendered without raw HTML; imports are validated and size-limited.</li>
            <li>GitHub Pages is static: no server secrets, no service-role key, no arbitrary SQL console.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
