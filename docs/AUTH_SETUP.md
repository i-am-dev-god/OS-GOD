# GitHub authentication setup

The app code is ready. The Supabase GitHub provider is currently **disabled** because GitHub OAuth apps must be created by a human in GitHub settings; the sandbox token cannot register an OAuth app on your behalf.

## Identities

- Supabase project: `os-god` (`rydahqolemnvoedkufpm`, eu-west-1)
- Supabase URL: `https://rydahqolemnvoedkufpm.supabase.co`
- **GitHub OAuth authorization callback URL:** `https://rydahqolemnvoedkufpm.supabase.co/auth/v1/callback`
- App site URL: `https://i-am-dev-god.github.io/OS-GOD/`

## 1. Create the GitHub OAuth app

1. Go to <https://github.com/settings/applications/new> (or Organization settings → Developer settings → OAuth Apps).
2. Fill in:
   - **Application name:** OS-GOD
   - **Homepage URL:** `https://i-am-dev-god.github.io/OS-GOD/`
   - **Authorization callback URL:** `https://rydahqolemnvoedkufpm.supabase.co/auth/v1/callback`
3. Register the application.
4. Generate a client secret. Copy the **Client ID** and **Client Secret** directly into Supabase in the next step. Do not paste them into chat, commits, issues, or GitHub Pages variables.

## 2. Enable GitHub in Supabase

1. Open <https://supabase.com/dashboard/project/rydahqolemnvoedkufpm/auth/providers>.
2. Expand **GitHub**, toggle it on.
3. Paste the Client ID and Client Secret.
4. Save.

Supabase Auth URL configuration already includes the Pages site URL and redirect allow-list. If you add a domain, update Site URL and Redirect URLs there.

## 3. Test the flow

1. Open the deployed site (or local dev with `.env.local` populated).
2. Click the GitHub icon / **Sign in**.
3. Complete GitHub authorization. The app requests only `read:user`.
4. You should return to the app with the auth `code` removed from the URL and the sync orb showing authenticated state.
5. Create/edit an object; it should sync to Postgres under your user id.
6. Sign out; the cloud IndexedDB cache for that user is destroyed on that browser.

## Troubleshooting

- **“GitHub provider needs activation”** in the auth modal: provider is still disabled or credentials are missing in Supabase.
- **Redirect mismatch:** GitHub OAuth callback must be the Supabase callback; Supabase redirect allow-list must contain the final app URL (including `/OS-GOD/` base path).
- **401/403 from tables:** confirm migration `core_schema_v2` is applied and RLS policies exist; never “fix” this by exposing a service-role key.
- **Local mode only:** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` missing or rejected by the public-key guard.
