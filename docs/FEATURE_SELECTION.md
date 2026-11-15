# Feature selection: practical workspace improvements

The requested 9/10 threshold is a product judgment, not a measured user rating. No usage research or browser verification was performed. The choices below prioritize frequent problems, existing data, reversibility and clear room boundaries over feature count.

## Selected

- **Tasks (9+/10 for checklist users):** finding and completing scattered follow-ups is a common workflow. Uses the notes that already exist rather than a second task database. Includes search, status and room-owner filters, editing, capture, per-note bulk completion, guarded undo and links back to the note. Compare-before-write prevents a stale local view from replacing newer local text. It does not promise per-task due dates, conflict-free cross-device edits, or collaborative editing.
- **Backup & Recovery (9+/10 for data preservation):** makes independent export, copy-only import, deleted/archived notes and existing local history discoverable together. Explicitly calls out unencrypted files, excluded data and room export boundaries; it does not claim backup completeness or cloud versioning.
- **Storage warning and scope-safe import (9+/10 when needed):** makes a device write failure harder to miss and prevents a text file from being imported into a different account or room after a context switch. Browser leave warnings and storage behavior are not guaranteed in every browser.

## Deferred or discarded

- A separate planner that repeats Activity, Reminders and Tasks: additional navigation and a second source of truth without a demonstrated benefit.
- Standalone project boards with independent task copies: would require new synchronization, backup, deletion and room permissions before it can be called reliable.
- Per-task due dates parsed from arbitrary note text: ambiguous locale/time parsing and no reliable per-task identity; existing Reminders remains the explicit scheduling tool.
- Automatic cross-device conflict resolution or claims of secure private notes: not safe without a versioned conflict protocol or an encryption and migration design.
- Extra analytics, streaks or decorative dashboards: no clear evidence that they improve task completion or recovery.
