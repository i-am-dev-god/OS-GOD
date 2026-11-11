# Stillspace

A text-first desktop workspace with movable, resizable windows, a taskbar, a launcher, desktop shortcuts, and a customizable liquid-glass appearance. Create, edit, search, favorite, organize, export, and restore notes. Notes save locally as you type; sign in to sync across devices. Guest mode requires no account. On small screens windows expand to fit the display.

## Desktop interactions

Open notes in separate windows; drag their title bars, resize from the lower-right corner, minimize, maximize and restore with the taskbar. Open the launcher with Start, use Ctrl/Cmd+N for a new note or Ctrl/Cmd+K to search. Settings offers preset or uploaded wallpaper (PNG/JPEG/WebP under 700 KB), accent color, glass blur, editor text size, layout density, taskbar alignment, desktop shortcuts, and a motion toggle. These settings are local to the browser; the OS reduced-motion preference is also respected. Windows can be snapped left or right, and focus mode hides other windows without closing them. Ctrl/Cmd+Shift+P opens the command palette. Import a .txt file, duplicate individual notes, or export all active notes as JSON (exports are unencrypted and do not include deleted notes).

## Local development

Node 22: `npm ci`, `npm test`, `npm run dev`, `npm run build`. The development server is exposed on `0.0.0.0` for preview. The production build uses relative paths for GitHub Pages. Offline app-shell caching is enabled only in the production build; open the deployed site online first. Browser caches can be evicted, so keep backups.

## Cloud sync

The app is configured for the connected `os-god` Supabase project with its **publishable** key. The migration in `supabase/migrations/` creates a separate `memo_os_notes` table with row-level policies restricting notes to the signed-in user. It was applied to the connected project, and email sign-in was enabled on that project. Email signup requires confirmation. The configured confirmation URL is the GitHub Pages site; test sign-up after deployment. Supabase email delivery/rate limits can require further provider configuration.

Local guest notes stay local after login; open Account → Import local notes to copy them into the account. Sign-out switches to the guest workspace but **does not erase cached account notes from this browser**. Avoid shared devices or clear site data after exporting anything you need.

The client fetches notes on login, focus, reconnect, and periodically. Changes are merged by note ID and client timestamp; concurrent changes to the same note use **last timestamp wins**, and conflicting edits may be lost. No version history is implemented. Deletion uses retained tombstones to prevent old devices resurrecting notes. Local browser storage and cloud plans have limits; neither compression nor this app makes storage unlimited.

The app uses lossless gzip only when the base64-encoded result is smaller than the original JSON; otherwise it stores plain JSON. The storage indicator estimates serialized note payload only and excludes database overhead, metadata, tombstones, and backups. Notes are protected by Supabase row-level security and transport encryption, but are **not end-to-end encrypted**. Do not use the app for secrets requiring zero-knowledge storage.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time to target a different project. Never put a service-role/secret key in frontend code. GitHub Pages deployment uses the included workflow after changes reach `main`.

### Desktop personalization
Settings stores your wallpaper (including an optional local image), accent, glass and motion preferences, dock size and alignment, shortcut visibility, editor typeface and size, clock format, default notes view, and note sorting in this browser. The dock opens and switches windows; the menu bar opens settings, search, and the clock. Use the toolbar navigation button to hide or show the notes sidebar. These preferences do not sync with your account.

### Appearance and navigation
Choose Light, Dark, or System appearance in Settings. The desktop includes Notes, Reminders, Browser and Settings shortcuts; note collections are inside Notes. Search the whole workspace for apps, actions, collections and note content with Ctrl/Cmd+K (or Ctrl/Cmd+Shift+P); use arrow keys and Enter to navigate results. The Notes toolbar provides a separate note-only search; Ctrl/Cmd+N creates a note, Ctrl/Cmd+Shift+J cycles open or minimized windows, and Ctrl/Cmd+Shift+M minimizes the active window. Motion can be disabled in Settings and respects the system reduced-motion setting.

The note search control expands in place when selected. The desktop appears at startup; open Notes from its desktop shortcut or the taskbar. Import and export remain in the command palette. Maximizing a window fills the usable desktop between the menu bar and taskbar; it does not request browser fullscreen. Dragging keeps a window within the usable area when its dimensions fit.

Account and sign-in open in a contextual panel near the control you selected; click outside, press Escape, or use its close button to dismiss it. The launcher also opens near its trigger. Actions use brief feedback animations, which can be disabled in Settings and respect the system reduced-motion preference.

Notes windows share one taskbar button: select it to switch between the library and open notes. Hover or focus a window’s maximize button to choose left, right, or centered layouts; click it to maximize or restore. Escape dismisses the layout menu. Settings opens in a feature-first Workspace view, with Appearance and Data & account in separate sections. Interface chrome is not selectable, while note content and form fields remain selectable.

The star launcher expands into Notes, Settings, and Account. Notes opened or created there remain in the launcher for editing; use the arrow in its header to extract the current app or note into a movable window. The back arrow or star returns to the previous launcher view, and the star closes it from the home view. Extracted Settings and Account windows appear in the taskbar while open. Ctrl/Cmd+K opens a non-modal floating search surface.

### Note history (device only)
The History button in a note shows earlier title and body checkpoints, with preview and confirmed restore. Checkpoints are captured before text changes, at most once every 30 seconds, and before restoring or replacing local text with a newer cloud copy. Up to 20 versions and 512 KiB of text are kept per note; oversized versions cannot be saved. Search can find these local versions. History is kept separately for each guest/account workspace in this browser, is not synced or included in exports, and can be lost if site data is cleared or evicted. Existing notes gain history only after editing. Cloud sync still uses last-timestamp-wins and this local history cannot guarantee recovery of every cross-device conflict.

### Reminders
Open a note and select the bell to set or clear a reminder. The top-bar bell lists upcoming and overdue notes; clear a reminder with its check mark. Search can also find reminders. Dates are entered in the device’s local time zone and stored as UTC instants. Reminder dates sync with signed-in notes and are included in JSON exports; guest data stays on the device.

Browser notifications are optional and require permission on each device. They can appear only while Stillspace is open; background tabs may be delayed, and missed reminders appear when the app is reopened. This is not a push service or an alarm when the browser is closed. Notification titles contain the note title. Delivery records are local to each browser, so multiple devices may each notify. Deleted notes do not notify; restoring a deleted note retains its reminder. Sync remains last-timestamp-wins.

### Reminders app
Open Reminders from the launcher or top-bar bell. Create standalone reminders, complete or reopen them, reschedule to an exact time or snooze for an hour or until 9 AM tomorrow, and open linked notes. Completed items remain in the Completed view; removing a note reminder does not delete the note. Standalone reminders are stored and synced with the workspace under the same account protections and last-timestamp-wins rules as notes. Guest import and JSON export include standalone reminders. Notification text is brief and includes the reminder title; it can be visible on the lock screen. Delivery still requires Stillspace to be open and browser permission.

### Browser
Browser searches with Bing from the launcher, desktop, taskbar, or workspace search. Queries and old Google/Wikipedia search bookmarks open as Bing searches in the app frame. HTTPS addresses open in a sandboxed frame when the destination permits it. Bing and individual sites control embedding and may refuse to load or open links externally; use **Open externally** if needed. Back/forward cover entries opened in Stillspace, not navigation inside embedded sites. Bookmarks are local to this browser. Searches contact Bing and visiting a site contacts that site; offline browsing is not supported.

### Desktop context navigation
Right-click the Stillspace interface to open app navigation, create a note, search, or show the desktop. Context Menu or Shift+F10 also opens it; use arrow keys and Escape to navigate and dismiss. Text fields and selected text retain their native menu. Embedded third-party pages manage their own right-click menus.
