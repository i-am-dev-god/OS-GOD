# Stillspace: product and engineering improvement report

## Scope and confidence

This is a focused static audit of the current application and an implementation proposal, not a claim of an hour-long study, a security audit, or field research. Findings below refer to the code and documentation; user experience, animation frame rate, network behavior, real multi-device sync and accessibility have not been independently measured in a browser. The production build was run; tests were not run at the user's request. No database migrations or account data changes were made for this work.

## What changed in this pass

1. **Recoverability:** JSON exports now retain tags, archive state and review-queue state in addition to existing note/reminder data. A matching import validates the whole file, confirms the operation, checks the workspace has not changed, creates new copies, and writes them to device storage before reporting success. It is available in Settings and search, not within rooms. Existing v1 exports are accepted, but data omitted by earlier exports cannot be recovered. The importer is limited to 10 MiB and 5,000 items; repeat imports create duplicates. Deleted items, history and preferences are not backed up. It does not promise a cloud sync or a complete disaster-recovery solution.
2. **Privacy:** Room exports now require confirmation that currently visible shared data from other people will be copied into an unencrypted file.
3. **Search reliability:** File pickers and exports invoked through search run during the user's gesture instead of waiting for the close animation; browsers may otherwise block them. Normal search actions still use the closing transition.
4. **Documentation:** Corrected the contradictory claim that note history does not exist. Detailed backup scope and limitations are in the README.

## Highest-priority findings and next steps

### P0 — Trust and recovery

- **Concurrent edits can be lost.** `src/useWorkspace.js` / `src/storage.js` use client timestamps and last-write-wins, without server-side compare-and-swap. Local checkpoints reduce some risk but cannot recover every conflict. Design a revision-based conflict flow: retain both versions, show which device changed what, and require a deliberate choice. It needs a schema and migration plan, offline handling, old-client compatibility and a safe rollout before implementation.
- **Backup is not comprehensive.** Export omits history, deleted content, settings, clipboard and groups; backups are plaintext, and re-import makes copies. Offer a clearly scoped export preview, optional history with explicit privacy warning, versioned schema and import preview with duplicate policy. Do not imply encryption or full recovery without implementing them.
- **Deletion has unavoidable boundaries.** Existing purge markers block known stale IDs, but unknown unsynced IDs and provider backups can remain. Improve the deletion screen with an explicit post-operation receipt, device-by-device checklist and uncertain-network outcome; never claim external backups or other offline devices are erased.
- **Room identities and content are not secure end-to-end.** Codes are bearer secrets and names are unverified; the backend sees room traffic. Any future sensitive-sharing or note-lock feature needs a real threat model, key lifecycle, migration and recovery design. A visual lock is not security.

### P1 — Everyday productivity

- **Action items from notes:** Turn selected text into a standalone reminder linked to its source note; support multiple actions per note. Confirm text and date, keep the original text unchanged, and show when a linked note is unavailable. Decide copy/ownership semantics before enabling it on other people's room items.
- **Review queue:** Add a one-click “done reviewing” action directly on a queue card and optional review date. Keep it intentional, exclude archived/deleted notes, and distinguish a review date from a notification reminder. Current queue is a synced note flag, not a separate task system.
- **Search:** Prioritize title matches over body matches, then recency, and explain why a result matched. Preserve category filters and the quiet empty state; benchmark large collections before indexing. Results should remain usable with touch, pointer and assistive technology.
- **Window groups:** Give each group a stable taskbar target rather than animating toward a temporary menu row. Define behavior for individual restores, changes to group membership mid-flight, closed members, narrow screens and desktop/room transitions; session-only scope is currently explicit. Avoid automatically reopening intentionally minimized windows. Don't turn this into workspace templates.
- **Note organization:** Backlinks and saved searches would make existing notes easier to rediscover, but require an unambiguous link format, rename/deletion behavior and a migration path. Avoid adding an empty feature until navigation and indexing are clear.

### P1 — Live collaboration: refined handoff

Build a handoff around an attention request, not a silent copy or forced window. Sender selects an online participant and an already shared item, optionally gives a short reason, and sees only honest states such as sent/opened/dismissed. Recipient gets a quiet inbox with Open, Later and Dismiss. Re-check visibility before opening; if the owner leaves or sharing changes, show unavailable without retaining private content. Provide rate limiting and a way to mute requests.

Current `src/useLiveWorkspace.js` uses ephemeral Realtime broadcasts with no delivery/read guarantee and unverified peer names. A first version must disclose that requests can be missed and cannot claim a reliable inbox. A durable version needs a separate design for access control, expiry, cleanup, offline behavior and data retention. A successful send is not a read receipt.

### P1 — Motion and accessibility

- Treat animation as a state machine: opening, settled, closing, reversed, interrupted by action, viewport change, unmount and preference change. Keep actions responsive, respect reduced motion and return focus appropriately. Avoid cascading stagger delays and full-screen live blur.
- Measure rather than guess: use browser performance recordings on low-powered and high-refresh devices, track long tasks and missed frames; keyframe count alone does not establish smoothness. Test rapid repeated clicks, resize during motion and background-tab recovery.
- The search and group panels have close effects, but the whole app is not yet unified. Audit focus restoration, dialog focus containment, contrast, touch targets, screen-reader announcements and mobile overflow. Preserve native selection/editing context menus.

### P2 — Performance, maintainability and operations

- **Initial bundle:** The production build warns about a JavaScript chunk over 500 kB; this pass measured approximately 665 kB uncompressed / 190 kB gzip. Profile startup and selectively lazy-load room tools and infrequently used settings without suspending the entire desktop. Preserve offline caching for dynamically loaded assets and avoid breaking already-open sessions during deployment.
- **Realtime traffic:** `src/useLiveWorkspace.js` currently broadcasts selected item snapshots every two seconds, bounded by 500 items and 180,000 JSON characters. Measure actual payload and client behavior before changing it; consider a revisioned delta protocol plus heartbeat and periodic reconciliation. It must preserve late join, sharing pause and expiry behavior, and must not silently fall behind.
- **Sync scalability:** Every sync pulls all note rows and purge markers. Consider incremental sync using a server-authoritative cursor with periodic reconciliation, pagination and deletion-marker retention rules. Don't switch to client clocks as the source of truth or compromise purge safeguards.
- **Code structure:** `src/main.jsx` and CSS contain many large compressed lines with multiple responsibilities. Extract search, desktop lifecycle, notes and contextual navigation incrementally, preserving public behavior. Consolidate overlapping styles and motion tokens only after mapping precedence, light/dark themes and reduced-motion overrides.
- **Reliability evidence:** A future verification plan should cover real devices, offline/reconnect, multiple accounts, privacy scope and interruption, plus browser performance traces. Build success alone does not prove these behaviors.

## Recommended order

1. Gather browser performance traces and verify backup/import and group workflows on desktop and mobile; address defects before adding more features.
2. Design conflict-safe sync and recovery, including migrations and old clients.
3. Ship action items and queue improvements as small end-to-end workflows.
4. Specify and prototype handoff with explicit best-effort semantics; consider persistence only with a privacy and cleanup design.
5. Optimize startup and Realtime after measurement; retain the existing privacy and sharing disclosures.
