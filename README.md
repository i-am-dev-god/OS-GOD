# OS-GOD

A text-first, database-native knowledge and work operating system for the browser. Capture notes, tasks, projects, sources, and decisions; connect them with wikilinks; query them live; arrange them in windows and workspaces; sync them to Postgres after GitHub sign-in.

**Storage rule:** text-related content only (Markdown, code, tables, URLs, metadata, relations). No binary uploads.

## What works now

- Liquid Glass desktop shell: command capsule, object rail, window canvas, inspector, orbit dock; mobile bottom navigation.
- Local-first IndexedDB workspace with seed content, offline capture/edit, trash/restore, and version history.
- Command palette (`Ctrl/Cmd K`), quick capture (`Ctrl/Cmd N`), window snap/focus, per-workspace layouts.
- Live queries (kind/status/tag/due/search), saved queries, wikilinks/backlinks.
- JSON / Markdown export and validated import.
- GitHub OAuth via Supabase PKCE, owner-only Postgres RLS, optimistic sync with conflict copies.
- Static export ready for GitHub Pages (`.github/workflows/pages.yml`, `out/`, `.nojekyll`).

## Quick start

```bash
npm ci
cp .env.example .env.local
# edit .env.local with your Supabase URL + publishable key
npm run dev
```

Open <http://localhost:3000>. The app works locally without cloud config; GitHub sign-in requires the Supabase provider setup in `docs/AUTH_SETUP.md`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next dev server on `0.0.0.0:3000` |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright desktop + mobile tests (requires browsers) |

## GitHub Pages

1. Enable **Settings → Pages → Source: GitHub Actions**.
2. Add public Actions variables (or rely on workflow fallbacks): `NEXT_PUBLIC_BASE_PATH=/OS-GOD`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Push to `main` or run the **Deploy GitHub Pages** workflow.

Target: `https://i-am-dev-god.github.io/OS-GOD/`. Details: `docs/GITHUB_PAGES.md`.

## GitHub auth

OAuth callback to register in GitHub: `https://rydahqolemnvoedkufpm.supabase.co/auth/v1/callback`. Then enable GitHub in Supabase Auth providers with the OAuth app Client ID/Secret. The client secret never belongs in this repo or GitHub Pages. Details: `docs/AUTH_SETUP.md`.

## Security

- Browser PKCE; least-privilege `read:user`; verified user before namespace switch.
- Public-key guard rejects secret/service-role keys in `NEXT_PUBLIC_*`.
- RLS enabled and forced on all six tables; anon revoked; owner-only policies; quotas and version triggers.
- Strict Zod validation and size limits; Markdown raw HTML skipped; images blocked; safe link schemes.
- Optimistic concurrency preserves conflicts as copies instead of silent overwrite.

Threat model and checklist: `docs/SECURITY.md`.

## Architecture

- `src/app` — Next.js App Router entry, static-exportable.
- `src/components` — OS shell, windows, editor, queries, palette, auth/settings/trash/inspector.
- `src/hooks/useWorkspace.ts` — local-first state machine, outbox sync, auth namespace handling.
- `src/lib` — types, validation, IndexedDB, Supabase client/auth, cloud queries, seed, utils.
- `supabase/migrations/0001_core.sql` — applied schema (`core_schema_v2`).
- `docs/PRODUCT_DISCOVERY.md`, `docs/DESIGN_DISCOVERY.md` — product and design discovery.

## Status

Built and statically exportable. GitHub OAuth provider activation and GitHub Pages enablement are manual account-level steps documented above; the sandbox integration could not create OAuth apps or enable Pages/variables (403).
