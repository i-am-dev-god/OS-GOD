# Security model

OS-GOD is a static GitHub Pages client plus Supabase Postgres/Auth. The browser is untrusted; authorization is enforced in the database, not by hiding UI.

## Trust boundaries

1. **GitHub Pages / browser** — public static assets only. Anything shipped here is readable by users.
2. **Supabase Auth** — GitHub OAuth authorization-code flow with PKCE. The OAuth client secret lives only in Supabase.
3. **Supabase Postgres** — row-level security is the real access-control boundary.

## Controls implemented

### Authentication

- GitHub sign-in through Supabase `signInWithOAuth({ provider: 'github' })`.
- PKCE (`flowType: 'pkce'`); no implicit token grant.
- Requested GitHub scope: `read:user` only. No repo, org, or write scopes.
- Session user is verified with `auth.getUser()` before switching cloud namespaces.
- Auth callback query parameters (`code`, `error`, …) are stripped from the URL after handling.
- Redirect target is built from the current origin + configured base path and must match the Supabase allow-list.
- Sign-out uses local scope and destroys the signed-in user's IndexedDB cache on that browser.

### Public key guard

`src/lib/supabase.ts` refuses to create a client unless:

- URL is HTTPS (or localhost HTTP for development), with no embedded credentials.
- Key is `sb_publishable_…`, or a legacy JWT whose decoded role is exactly `anon`.
- `sb_secret_…`, service-role JWTs, and malformed keys are rejected even if accidentally placed in `NEXT_PUBLIC_*`.

The publishable key is safe to expose **only because RLS is enabled and forced**.

### Database authorization

Migration: `supabase/migrations/0001_core.sql` (applied as `core_schema_v2`).

- RLS enabled **and forced** on `profiles`, `objects`, `object_versions`, `links`, `saved_queries`, `user_settings`.
- Owner policies use `(select auth.uid())`.
- `anon` table privileges revoked.
- `object_versions` is select-only for owners; versions are written by trigger.
- Composite foreign keys keep links inside the same owner and prevent self-links.
- Triggers enforce immutable `id`/`owner_id`, increment `version` on content change, record up to 50 versions, and cap quotas (5,000 objects / 100 saved queries per owner).
- Generated `search_vector` uses title + body only (`'simple'::regconfig`); tags are indexed separately and searched client-side.

### Sync integrity

- Local-first IndexedDB cache namespaced by verified user id (`local` when signed out).
- Outbox flush uses optimistic concurrency: `UPDATE … WHERE version = baseVersion`.
- On mismatch, the local edit is preserved as a separate `Conflict — …` copy instead of silently overwriting remote data.
- Cloud queries are owner-scoped and exclude `search_vector`.

### Input and rendering

- Zod strict schemas validate objects, queries, settings, and imports.
- Limits: title ≤ 200 chars, body ≤ 256 KiB bytes, tags ≤ 12, import ≤ 100 objects / 2 MB, settings ≤ 64 KiB, windows ≤ 12.
- Markdown preview uses `react-markdown` + `remark-gfm` with `skipHtml`; raw HTML is not rendered.
- Links are restricted to `http(s)`, `mailto:`, `#`, and `/` schemes; external links use `rel="noopener noreferrer"`.
- Images are blocked in preview to preserve the text-only storage rule and avoid remote tracking pixels.
- Export filenames are sanitized; exports contain text fields only (no owner ids or sync internals).

## Operational checklist

- [ ] GitHub OAuth app created; callback is the Supabase callback, not the Pages URL.
- [ ] Supabase GitHub provider enabled with Client ID/Secret stored in Supabase only.
- [ ] Supabase Auth URL allow-list contains only intended origins (Pages, localhost, preview).
- [ ] No `service_role`, secret key, OAuth client secret, or database password in repo, Pages, logs, or chat.
- [ ] GitHub Pages source set to **GitHub Actions**.
- [ ] `npm audit` clean before release.

## Known limitations

- Static hosting cannot protect secrets; do not add server-only features to the client bundle.
- IndexedDB is not encrypted at rest. Anyone with browser/profile access can read cached text.
- GitHub OAuth proves identity, not repository permissions; this app does not request repo access.
- Conflict resolution is copy-preserving, not automatic merge.
- E2E tests require Playwright browsers; unit tests and static build run without them.
