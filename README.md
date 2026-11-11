# Stillspace

A text-first desktop workspace with movable, resizable windows, a taskbar, a launcher, desktop shortcuts, and a customizable liquid-glass appearance. Create, edit, search, favorite, organize, export, and restore notes. Notes save locally as you type; sign in to sync across devices. Guest mode requires no account. On small screens windows expand to fit the display.

## Desktop interactions

Open notes in separate windows; drag their title bars, resize from the lower-right corner, minimize, maximize and restore with the taskbar. Open the launcher with Start, use Ctrl/Cmd+N for a new note or Ctrl/Cmd+K to search. Settings offers wallpaper, accent, desktop shortcuts, and a glass toggle. These settings are local to the browser.

## Local development

Node 22: `npm ci`, `npm test`, `npm run dev`, `npm run build`. The development server is exposed on `0.0.0.0` for preview. The production build uses relative paths for GitHub Pages. Offline app-shell caching is enabled only in the production build; open the deployed site online first. Browser caches can be evicted, so keep backups.

## Cloud sync

The app is configured for the connected `os-god` Supabase project with its **publishable** key. The migration in `supabase/migrations/` creates a separate `memo_os_notes` table with row-level policies restricting notes to the signed-in user. It was applied to the connected project, and email sign-in was enabled on that project. Email signup requires confirmation. The configured confirmation URL is the GitHub Pages site; test sign-up after deployment. Supabase email delivery/rate limits can require further provider configuration.

Local guest notes stay local after login; open Account → Import local notes to copy them into the account. Sign-out switches to the guest workspace but **does not erase cached account notes from this browser**. Avoid shared devices or clear site data after exporting anything you need.

The client fetches notes on login, focus, reconnect, and periodically. Changes are merged by note ID and client timestamp; concurrent changes to the same note use **last timestamp wins**, and conflicting edits may be lost. No version history is implemented. Deletion uses retained tombstones to prevent old devices resurrecting notes. Local browser storage and cloud plans have limits; neither compression nor this app makes storage unlimited.

The app uses lossless gzip only when the base64-encoded result is smaller than the original JSON; otherwise it stores plain JSON. The storage indicator estimates serialized note payload only and excludes database overhead, metadata, tombstones, and backups. Notes are protected by Supabase row-level security and transport encryption, but are **not end-to-end encrypted**. Do not use the app for secrets requiring zero-knowledge storage.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time to target a different project. Never put a service-role/secret key in frontend code. GitHub Pages deployment uses the included workflow after changes reach `main`.
