# Publishing to GitHub Pages

OS-GOD is a Next.js static export (`output: 'export'`). It deploys to GitHub Pages with GitHub Actions; no Node server is required at runtime.

- Repository: `i-am-dev-god/OS-GOD`
- Project Pages URL: `https://i-am-dev-god.github.io/OS-GOD/`
- Workflow: `.github/workflows/pages.yml`
- Artifact directory: `out/` (includes `.nojekyll`)

## 1. Enable Pages (one-time, manual)

The sandbox GitHub integration received `403 Resource not accessible by integration` when trying to enable Pages and create Actions variables, so do this in the GitHub UI:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Optionally set the repository homepage to `https://i-am-dev-god.github.io/OS-GOD/`.

## 2. Configure public build variables (recommended)

In **Settings → Secrets and variables → Actions → Variables**, add:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | `/OS-GOD` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rydahqolemnvoedkufpm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_EfDC1O0rVV0U9kQ3S2YqXQ_O49_dtK9` |

The workflow currently falls back to those public values so the first deploy works even before variables exist. The publishable key is public by design; RLS is the security boundary. **Never** add a service-role/secret key or OAuth client secret as a Pages variable.

For a user/org root site (`<owner>.github.io`), set `NEXT_PUBLIC_BASE_PATH` to an empty string.

## 3. Deploy

- Push to `main`, or run **Actions → Deploy GitHub Pages → Run workflow**.
- The workflow runs lint, typecheck, unit tests, builds `out/`, uploads the Pages artifact, and deploys.

## 4. Auth redirects

Supabase Auth is already configured with:

- Site URL: `https://i-am-dev-god.github.io/OS-GOD/`
- Redirect allow-list: Pages URL, `http://localhost:3000`, the Arena preview origin, and `https://os-god.vercel.app` (each with `/` and `/**`).

GitHub OAuth itself still needs an OAuth app and provider activation; see `docs/AUTH_SETUP.md`.

## Local verification

```bash
npm ci
NEXT_PUBLIC_BASE_PATH=/OS-GOD npm run build
npx serve out
```

Then open `http://localhost:3000/OS-GOD/` (or whatever port `serve` reports) and confirm assets load under the base path.

## Custom domain

If you add a custom domain, update:

1. `NEXT_PUBLIC_BASE_PATH` (usually empty for a domain root).
2. Supabase Auth Site URL and redirect allow-list.
3. GitHub OAuth app homepage/callback if the Supabase project URL changes (the OAuth callback normally stays the Supabase callback).
