import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthUser } from './types';
import { appUrl } from './utils';

let client: SupabaseClient | null | undefined;

function isSafePublicKey(key: string): boolean {
  if (key.startsWith('sb_publishable_')) return true;
  if (key.startsWith('sb_secret_') || key.startsWith('sb_service_')) return false;
  // Legacy JWTs are accepted only when they are explicitly the anon role.
  if (!key.startsWith('eyJ')) return false;
  try {
    const payload = key.split('.')[1];
    if (!payload) return false;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json) as { role?: unknown };
    return claims.role === 'anon';
  } catch {
    return false;
  }
}

export function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return null;
    const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) return null;
    if (!isSafePublicKey(key)) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const config = publicSupabaseConfig();
  if (!config) {
    client = null;
    return client;
  }
  client = createClient(config.url, config.key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export async function fetchGitHubEnabled(): Promise<boolean | null> {
  const config = publicSupabaseConfig();
  if (!config) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { external?: Record<string, boolean> };
    return typeof data.external?.github === 'boolean' ? data.external.github : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function authUserFrom(user: { id: string; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!user) return null;
  const login = typeof user.user_metadata?.user_name === 'string' ? user.user_metadata.user_name : null;
  const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : login;
  return { id: user.id, login, name };
}

export async function getVerifiedUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return authUserFrom(data.user);
}

export async function signInWithGitHub() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Cloud authentication is not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: appUrl('/'),
      scopes: 'read:user',
    },
  });
  if (error) throw error;
}

export async function signOutGitHub() {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export function cleanAuthCallback() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const keys = ['code', 'error', 'error_description', 'error_code'];
  let changed = false;
  for (const key of keys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (changed) window.history.replaceState({}, '', url.toString());
}

export function authCallbackError(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error_description') || params.get('error');
  return error ? error.slice(0, 240) : null;
}

export function supabaseCallbackUrl() {
  const config = publicSupabaseConfig();
  return config ? `${config.url}/auth/v1/callback` : null;
}
