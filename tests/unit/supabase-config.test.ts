import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicSupabaseConfig, supabaseCallbackUrl } from '@/lib/supabase';

function jwt(role: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role })}.signature`;
}

afterEach(() => vi.unstubAllEnvs());

describe('public Supabase configuration guard', () => {
  it('accepts HTTPS publishable keys', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    expect(publicSupabaseConfig()).toEqual({ url: 'https://example.supabase.co', key: 'sb_publishable_test' });
    expect(supabaseCallbackUrl()).toBe('https://example.supabase.co/auth/v1/callback');
  });

  it('rejects secret/service-role keys even if supplied as public env', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_secret_test');
    expect(publicSupabaseConfig()).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', jwt('service_role'));
    expect(publicSupabaseConfig()).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', jwt('anon'));
    expect(publicSupabaseConfig()?.key).toBe(jwt('anon'));
  });

  it('rejects insecure remote URLs and embedded credentials', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://example.supabase.co');
    expect(publicSupabaseConfig()).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://user:pass@example.supabase.co');
    expect(publicSupabaseConfig()).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    expect(publicSupabaseConfig()?.url).toBe('http://localhost:54321');
  });
});
