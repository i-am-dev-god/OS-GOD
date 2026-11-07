# OS-GOD — Product Discovery & Feature Selection

**Status:** Brainstorm / pre-implementation. No website or application code has been built yet.  
**Date:** 2026-11-07  
**Working product name:** OS-GOD  
**Recommended category:** Text-first personal knowledge-and-work operating system

---

## 1. Executive decision

Build **a browser-based, database-native operating system for everyday knowledge work**: capture text, organize it lightly, find it instantly, connect it to projects, turn it into tasks/documents, and resume work exactly where you left off.

The product should not be a fake desktop with random widgets. The “OS” feeling should come from real operating-system-like qualities:

- persistent processes/workspaces;
- windows, tabs, split views, and fast switching;
- one shared database underneath every app/view;
- universal search and commands;
- permissions, history, recovery, and portability;
- composable tools that operate on the same objects.

**Core promise:**

> One place for everything you know and everything you are working on — text-only, database-powered, fast, reversible, and portable.

**Primary audience for version 1:** individual knowledge workers: students, researchers, writers, developers, freelancers, founders, and operators.  
**Later audience:** small teams, after the personal system is trustworthy.

**Core loop:**

```text
Capture → Structure → Retrieve → Connect → Create → Act → Resume
```

---

## 2. Constraints and assumptions

### Hard constraint from the request

The system stores **text-related content only**.

Recommended interpretation:

| Allowed | Not allowed |
|---|---|
| Plain text, Markdown, notes, documents | Uploaded images |
| Lists, tables, checklists, code snippets | Audio files |
| URLs and source references as text | Video files |
| Tags, properties, dates, IDs, relations | PDFs/binary attachments as stored objects |
| Search indexes derived from text | Binary media library |
| Window layout and UI state metadata | Screen recordings |

Clarification: a database still needs non-content metadata such as IDs, timestamps, permissions, and indexes. The constraint should mean **no binary media content**, not “no metadata.”

External links are allowed. The system may link to an image, video, or PDF elsewhere, but should not import and store the binary file.

### Product assumptions to confirm

1. “Operating system” means a **web-based workspace/desktop environment**, not a replacement kernel for Windows/macOS/Linux.
2. The first release is optimized for **desktop browsers**, with mobile focused on capture, reading, and search.
3. The system should be useful **without AI**. AI is an accelerator, not a dependency.
4. The first release is **personal-first**. Real-time team collaboration comes later.
5. The user should be able to export their data in readable formats.

---

## 3. What should make this feel like an OS?

A notes app stores notes. A database app stores rows. An OS-like workspace should provide a **continuous computing environment**.

| OS-like quality | Product meaning |
|---|---|
| Processes | Project workspaces that preserve open windows, filters, drafts, and context |
| File system | Database-backed object explorer with collections, links, and smart views |
| Window manager | Tabs, split panes, tiling, focus mode, fast switching |
| Shell | Universal command palette and safe query console |
| Shared memory | One object can appear in a note, task list, table, and query without duplication |
| Permissions | Private by default, explicit sharing, scoped automations |
| Time machine | Version history, restore, trash, recovery |
| Package manager | Later: templates, mini-apps, and permissioned extensions |
| Device continuity | Offline-friendly local state and sync across devices |

The goal is not to copy every desktop OS feature. The goal is to make knowledge work feel **continuous, composable, and recoverable**.

---

## 4. Evidence and competitive reality

This is a crowded category, so basic notes, links, databases, and AI summaries are not enough by themselves.

### Demand signals

- Notion announced in September 2024 that it had passed **100 million total users**. This is a category-scale signal, not proof that OS-GOD will succeed, and total users should not be confused with monthly active users. [3](https://www.notion.com/blog/100-million-of-you)
- Atlassian’s 2025 survey of 12,000 knowledge workers and 200 executives reported that respondents estimated they spend about **25% of their time searching for answers**. This is vendor-sponsored, self-reported research, not a universal law, but it supports the importance of retrieval. [1](https://www.atlassian.com/blog/state-of-teams-2025)
- Microsoft’s 2025 Work Trend Index research reported that **48% of employees** said their work feels chaotic and fragmented. Its Microsoft 365 telemetry also described heavy interruption from meetings, email, and notifications. This supports the value of context preservation and focused workspaces. [2](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday)

### Existing products already cover many primitives

| Product | Relevant existing strength | Implication for OS-GOD |
|---|---|---|
| Notion | Databases, properties, relations, rollups, multiple views | Do not claim “database notes” alone is novel. [5](https://www.notion.com/help/database-properties) |
| Obsidian | Local Markdown, links, graph, plugins, sync, history, collaboration | Portability and linked thinking are already expected by power users. [4](https://obsidian.md/) |
| Tana Outliner | Supertags, typed nodes, saved views/custom feeds | Structured text and live queries are not unique by themselves. [6](https://outliner.tana.inc/) |

### Differentiation thesis

OS-GOD should differentiate through the **combination**:

1. A real OS-like workspace, not just a document list.
2. One database object model across notes, tasks, projects, queries, and views.
3. Persistent context: resume a project exactly as you left it.
4. Text-only focus: fast, searchable, portable, low-storage.
5. Reversibility: history, restore, preview, undo.
6. Evidence-first AI: citations, scoped context, no silent mutation.
7. Permission-aware extensibility: safe mini-apps and automations later.

The product should not try to win by having the longest feature list. It should win by making a few powerful primitives feel unusually coherent.

---

## 5. Concept tournament

Twelve possible “common purpose” directions were compared.

Scoring is directional product judgment, not market measurement.

Criteria weights:

- **U — Ubiquity/frequency:** 25%
- **T — Text-only fit:** 20%
- **D — Database leverage:** 20%
- **R — Differentiation headroom:** 15%
- **F — First-release feasibility:** 10%
- **H — Repeat-use potential:** 10%

Scores are 1–5. Weighted total is out of 100.

| Concept | U | T | D | R | F | H | Total | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Personal knowledge-and-work OS | 5 | 5 | 5 | 4 | 4 | 5 | **95** | **Selected** |
| Study/learning OS | 4 | 5 | 5 | 4 | 4 | 4 | 88 | Strong later template/app |
| Team projects + docs OS | 5 | 5 | 5 | 3 | 2 | 5 | 88 | Too much collaboration complexity for v1 |
| Writing/publishing OS | 4 | 5 | 4 | 4 | 4 | 4 | 84 | Strong use case inside selected product |
| Email/inbox triage OS | 5 | 5 | 4 | 3 | 2 | 5 | 84 | Integration/auth complexity |
| Research/evidence library | 3 | 5 | 5 | 4 | 4 | 3 | 81 | Excellent power-user mode |
| Life admin/journal OS | 4 | 5 | 4 | 3 | 4 | 4 | 81 | Good personal template pack |
| Meeting/minutes OS | 4 | 5 | 4 | 3 | 3 | 4 | 79 | Useful workflow, not whole OS |
| Freelancer CRM/ops OS | 3 | 5 | 5 | 3 | 3 | 4 | 78 | Good vertical template |
| Chat/community OS | 5 | 5 | 3 | 2 | 2 | 5 | 77 | Network effects and moderation burden |
| Developer code/text workspace | 3 | 5 | 4 | 3 | 3 | 4 | 74 | Useful mode, narrower audience |
| Generic browser desktop/launcher | 4 | 3 | 2 | 2 | 3 | 2 | 56 | Reject: weak database purpose |

### Why the winner wins

The personal knowledge-and-work OS is broad enough to serve a common daily need, but still focused enough to build around one loop:

```text
Capture information → connect it to work → retrieve it → produce output → resume later
```

It can absorb study, writing, research, and freelancing as **templates and modes**, without becoming a generic everything app.

---

## 6. Selected product definition

### Name

Working name: **OS-GOD**.

Possible public taglines:

- “Your knowledge, running like an operating system.”
- “One database for everything you know and everything you’re working on.”
- “A text-only operating system for focused work.”

### Primary job story

> When I capture information, ideas, and commitments, help me structure them only as much as needed, find them instantly, see them in the context of my current project, and turn them into finished work without losing control of my data.

### Initial personas

| Persona | Main need | Example workflow |
|---|---|---|
| Student | Notes, sources, assignments, revision | Capture lecture note → link course → create task → query upcoming work |
| Researcher/writer | Sources, claims, drafts, citations | Save quote → link source → build outline → assemble draft |
| Developer | Snippets, bugs, decisions, tasks | Save snippet → link issue → create task → resume project workspace |
| Freelancer/operator | Clients, meetings, decisions, deliverables | Meeting note → decision record → tasks → client cockpit |

### Product boundaries

Version 1 is:

- personal-first;
- text-only;
- database-native;
- browser-based;
- offline-friendly;
- useful without AI;
- exportable;
- keyboard-friendly;
- recoverable.

Version 1 is not:

- a literal kernel or hardware OS;
- a media storage product;
- a full Notion clone;
- a full project-management suite;
- a real-time multiplayer editor;
- an autonomous agent platform;
- a password manager;
- a social network.

---

## 7. The selected “god-level” capabilities

These are the signature capabilities worth building toward. They are not all first-release features. The “god-level” quality comes from how they compound.

| # | Capability | Wow moment | Positives | Negatives / guardrails | Release |
|---:|---|---|---|---|---|
| 1 | **Database-native desktop** | Open the same project as a note, task table, and live query side by side; edits stay consistent | Removes copy/paste silos; makes the OS metaphor functional | Window complexity; mobile needs simpler layout | P0 |
| 2 | **Context workspaces / process resume** | Return to “Thesis” and see the exact windows, filters, scroll positions, and drafts | Reduces restart cost; strong OS feeling | Stale layouts; storage growth; needs clear reset | P0 |
| 3 | **Universal capture + command bar** | One shortcut captures text, searches, creates objects, links items, or runs saved queries | Extremely fast daily entry point | Discoverability; must not become a hidden-only UI | P0 |
| 4 | **Progressive typed text objects** | Start as plain text, later mark as task, source, decision, person, or project with properties | Structure without upfront database setup | Schema creep; keep defaults simple | P0/P1 |
| 5 | **Linked knowledge with contextual backlinks** | Every note shows where it is used and what it references | Better discovery and context | Link spam; avoid giant useless graph as default | P0 |
| 6 | **Live queries and smart views** | “Open tasks for Project X due this week” updates everywhere automatically | Self-organizing workspace; powerful reuse | Query cost and opacity; show filters plainly | P0/P1 |
| 7 | **Time machine and reversible actions** | Restore a previous version, recover deleted objects, undo bulk changes | Trust and safety | Storage cost; retention policy needed | P0/P1 |
| 8 | **Offline-first durability and sync** | Keep working without network; sync later with visible conflict handling | Speed and resilience | Distributed-system complexity; do not fake sync | P0/P1 |
| 9 | **Portable text vault** | Export readable Markdown/CSV/JSON with relationships intact | Reduces lock-in; builds trust | Metadata mapping is imperfect; document limits | P0 |
| 10 | **Evidence-first AI / knowledge compiler** | Ask a question and get an answer grounded in selected notes with citations; compile notes into an outline | High leverage without blind trust | Retrieval misses, cost, privacy; must say “not found” when appropriate | P1 |
| 11 | **Reviewed text-to-action and automations** | Extract tasks or run a text recipe, but preview changes before applying | Turns knowledge into action safely | False positives, loops, destructive actions; dry-run and undo required | P1 |
| 12 | **Permission-aware extensibility** | Run safe queries or install text-defined mini-apps with scoped access | Makes it an extensible OS, not a closed app | Sandbox/security burden; delay until core is stable | P1/P2 |

### The compounding contract

The selected feature set should obey one contract:

> The same object can appear in many views, context survives interruption, actions are reversible, data remains portable, and AI/automation proposes changes under user control.

That contract is more important than any individual flashy feature.

---

## 8. Full idea ledger

Decision key:

- **P0:** core / first usable release
- **P1:** signature expansion after core is proven
- **P2:** later platform or advanced feature
- **Reject:** deliberately excluded from the current product direction

Each idea includes a positive and a negative/risk.

### A. OS shell and interaction

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| A01 | Database-backed object explorer / virtual file system | Familiar navigation without duplicate files | Folders can become rigid; use collections and links too | P0 |
| A02 | Window manager with tabs, tiling, split views | Compare notes, tasks, and queries side by side | UI complexity; mobile should use single-pane mode | P0 |
| A03 | Persistent context workspaces / process snapshots | Resume projects exactly where left off | Stale state and storage growth; allow reset | P0 |
| A04 | Universal command palette | One fast entry point for search and actions | Hidden commands hurt discoverability; keep visible menus | P0 |
| A05 | Dock/taskbar, recent items, pinned objects | Fast switching and continuity | Clutter if overdone | P0 |
| A06 | Cross-view object drag/link | Compose without copying | Accidental moves; default drag should create link, not move | P0 |
| A07 | Text-only clipboard manager | Reuse snippets and captured text | Clipboard may contain sensitive data; opt-in and local retention | P1 |
| A08 | Focus cockpit / Today view | Reduces overwhelm | Can become another manual dashboard; generate from queries | P0 |
| A09 | Notification/action queue | Surfaces due items and reviews | Spam risk; default to in-app digest | P0/P1 |
| A10 | PWA install and offline shell | Feels app-like and resilient | Browser quirks and cache invalidation | P1 |
| A11 | Themes and text/gradient wallpapers | Personalization | Low core value; avoid binary wallpaper storage | P2 |
| A12 | Boot animation, 3D desktop, fake kernel | Spectacle | Little utility; hurts performance and credibility | Reject |

### B. Data model and organization

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| B01 | Universal text object model | One identity, search, history, and permission system | Over-general schema can become vague; use typed core tables | P0 |
| B02 | Optional types/supertags with properties | Structure appears only when needed | Setup burden; provide simple defaults | P0/P1 |
| B03 | Bidirectional links and backlinks | Context and discovery | Graph spaghetti; prioritize contextual backlinks | P0 |
| B04 | Block addresses and transclusion | Reuse one source block in many places | Edit/conflict complexity | P1 |
| B05 | Live queries / smart collections | Views update automatically | Query cost and opacity; show filters | P0 |
| B06 | Multiple views of same data | List, table, board, calendar fit different tasks | Building all at once is too broad | P0/P1 |
| B07 | Relations and rollups | Project/client summaries from linked objects | Notion-like complexity; introduce gradually | P1 |
| B08 | Safe formulas | Computed properties and text transformations | Injection and performance risk; use safe expression parser | P2 |
| B09 | Templates/blueprints | Fast start for meetings, projects, study, writing | Template graveyard; ship few high-quality ones | P0 |
| B10 | Daily note and universal inbox | Low-friction capture habit | Duplicate homes for content; inbox should be triageable | P0 |
| B11 | Tags + collections + links hybrid | Flexible organization | Inconsistent taxonomy; links should be primary | P0 |
| B12 | Schema migrations/versioning | Evolve types safely | Migration complexity; needed before custom schemas scale | P1 |

### C. Capture and editing

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| C01 | Instant capture / quick add | Lowest possible friction | Browser global hotkey limits; in-app first | P0 |
| C02 | Markdown-rich editor | Portable and powerful | WYSIWYG complexity; keep source accessible | P0 |
| C03 | Slash commands and mentions | Structure at the point of thought | Menu overload | P0 |
| C04 | Paste cleanup / text normalization | Makes imported text usable | Can remove intended formatting; preview | P0 |
| C05 | Text-only web clipper | Captures research without media | Paywalls, copyright, JavaScript pages; user-consented extraction | P1 |
| C06 | Markdown/CSV/JSON import | Easy onboarding and migration | Mapping errors; start with Markdown/CSV | P0/P1 |
| C07 | Email-to-text inbox | Captures commitments from email | Auth, spam, privacy | P2 |
| C08 | Voice-to-text without storing audio | Accessibility and speed | Browser/API privacy; optional only | P2 |
| C09 | PDF/OCR text extraction only | Unlocks document text while staying text-only | Accuracy and binary processing pipeline; discard source with consent | P2 |
| C10 | Duplicate detection | Cleaner vault | False positives; exact duplicate first, semantic later | P1 |
| C11 | Inline tasks and checkboxes | Action lives where it was written | Sync semantics between note and task object | P0 |
| C12 | Code/snippet blocks | Useful for developers | Execution risk; highlight only, no runtime initially | P0 |

### D. Search and thinking

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D01 | Full-text + fuzzy search + operators | Reliable retrieval | Index tuning and language support | P0 |
| D02 | Faceted filters: type, date, tag, project | Precision | UI clutter; progressive disclosure | P0 |
| D03 | Semantic search | Finds meaning, not just keywords | Embeddings, cost, privacy; opt-in | P1 |
| D04 | Natural-language query builder | Approachable power | Ambiguity; show resulting filters before running | P1 |
| D05 | Contextual backlinks / related panel | Useful discovery without giant graph | Noise; rank by relevance and recency | P0 |
| D06 | Global graph visualization | Visually impressive | Hairball and performance issues; local neighborhood first | P2 |
| D07 | Query-any-selection | Fast exploration from selected text | Hidden scope; show what will be searched | P0 |
| D08 | Decision ledger template | Preserves rationale and alternatives | Requires user discipline; make it lightweight | P1 |
| D09 | Contradiction/stale-knowledge radar | Maintains knowledge quality | False alarms; start with user-set review dates | P2 |
| D10 | Spaced repetition / study mode | Turns notes into learning | Niche; build as app/template, not core | P1 |
| D11 | Reading/distraction-free mode | Focus and accessibility | Mode switching cost | P0 |
| D12 | Text canvas / spatial board | Brainstorming and layout | Scope creep; text cards only if added | P2 |

### E. Work execution

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| E01 | Tasks and projects as first-class objects | Connects knowledge to action | PM bloat; keep lightweight | P0 |
| E02 | Today/next-actions query | Focus without manual dashboard | Rigid methodology; make customizable | P0 |
| E03 | Kanban/calendar/timeline views | Planning flexibility | Scope; add after list/table | P1 |
| E04 | Meeting notes → action extraction | Closes the loop from discussion | Extraction errors; require review | P1 |
| E05 | Goals/OKR tracking | Alignment and reflection | Niche; template first | P2 |
| E06 | Time tracking/Pomodoro | Focus measurement | Can feel surveillance-like; optional | P2 |
| E07 | Habit tracker/streaks | Routine building | Gamification can distract from knowledge work | Reject initial |
| E08 | Review queues and expiry dates | Keeps knowledge fresh | Nagging; user-controlled review dates | P1 |
| E09 | Document assembly from notes | Turns research into output | Coherence risk; outline-first workflow | P1 |
| E10 | Publishing/read-only sharing | Makes work useful outside the vault | Permission leaks; explicit share flow | P1 |

### F. AI and automation

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| F01 | Evidence-first answers with citations | Trustworthy AI use | Retrieval misses; must admit uncertainty | P1 |
| F02 | Summarize/rewrite selected text | Immediate utility | Hallucination/style drift; diff preview | P1 |
| F03 | Auto-tag/link suggestions | Reduces organization effort | Wrong links; suggestions only | P1 |
| F04 | Text-to-action extraction | Less admin work | False tasks; preview and undo | P1 |
| F05 | Knowledge compiler: notes → outline/draft/checklist | High leverage | Generic output; require source scope and structure | P1 |
| F06 | Autonomous agents editing vault | Scales work | Trust and destruction risk; reject silent autonomy | Reject default |
| F07 | Text recipes/automations | Repeatable workflows | Loops and errors; dry-run required | P1 |
| F08 | Scheduled queries/digests | Proactive surfacing | Noise and cost; opt-in | P1 |
| F09 | Prompt/template library | Reusable AI workflows | Clutter; tie to object types | P1 |
| F10 | Local/offline model option | Privacy and offline AI | Device limits; later experiment | P2 |

### G. Trust, sync, and portability

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| G01 | Local durable cache/offline editing | Speed and resilience | Sync complexity; single-device first | P0 |
| G02 | Cloud sync, deltas, conflict UI | Cross-device continuity | Hard distributed-system problem; visible conflicts | P1 |
| G03 | Version history/time travel | Recovery and trust | Storage cost; retention policy | P0 |
| G04 | Whole-workspace snapshots/branching | Safe experiments | Merge complexity; snapshots before branching | P1/P2 |
| G05 | Trash, retention, restore | Prevents accidental loss | Storage and policy complexity | P0 |
| G06 | Readable export: Markdown/CSV/JSON | No lock-in | Metadata loss; document mapping | P0 |
| G07 | Backup/restore drill | Real recoverability | Operational discipline required | P0 |
| G08 | Auth, row-level security, tenant isolation | Prevents data leaks | Complexity; mandatory for cloud | P0 |
| G09 | Optional end-to-end encrypted vault | Strong privacy | Limits search, AI, and sync; do not promise casually | P2 |
| G10 | Audit log/activity history | Accountability | Privacy/storage tradeoff; basic first | P0/P1 |
| G11 | Passkeys/2FA/session lock | Account safety | Recovery UX; password/session first | P1 |
| G12 | Quotas, rate limits, abuse controls | Sustainable service | User friction; transparent limits | P0 |

### H. Collaboration and extensibility

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| H01 | Comments and mentions | Team feedback | Notification burden | P1 |
| H02 | Real-time co-editing/CRDT | Multiplayer work | High complexity; delay | P2 |
| H03 | Granular sharing/permissions | Safe collaboration | UX complexity | P1 |
| H04 | Public publishing | Distribution and portfolios | SEO/leak risks | P1 |
| H05 | Read-only API/query console | Power-user leverage | Security; scoped tokens only | P1 |
| H06 | Text-defined mini-apps/manifests | True OS extensibility | Sandbox and validation burden | P2 |
| H07 | Plugin sandbox/capabilities | Ecosystem potential | Review/security cost | P2 |
| H08 | Template marketplace | Network effects | Moderation and quality control | P2 |
| H09 | Webhooks/integrations | Connects existing tools | Auth and failure handling | P2 |
| H10 | Self-host/enterprise SSO | Control and compliance | Operations burden | P2 |

### I. Explicit non-goals and rejected gimmicks

| ID | Idea | Positive if any | Negative / reason to reject | Decision |
|---|---|---|---|---|
| I01 | Binary media library | Richer content | Violates text-only constraint | Reject |
| I02 | Full kernel/VM/hardware drivers | “Real OS” credibility | Wrong product scope for a browser workspace | Reject |
| I03 | Password manager/secrets vault | Sensitive text storage | Security specialization and liability | Reject |
| I04 | Blockchain/token mechanics | Novelty narrative | No clear user value for knowledge work | Reject |
| I05 | Social feed/engagement streaks | Retention metrics | Misaligned with focused work | Reject |
| I06 | Always-on recording/screen capture | Automatic context | Privacy and text-only violation | Reject |
| I07 | Unlimited free AI/storage | Attractive marketing | Unsustainable cost and abuse | Reject |
| I08 | AI training on private notes by default | Better models | Trust violation; require explicit consent if ever offered | Reject |

---

## 9. Release packaging

### P0 — First usable, trustworthy core

The first release should prove the core loop, not every idea.

Must include:

1. Workspace/object explorer.
2. Markdown-rich text editor.
3. Instant capture and inbox.
4. Tags, collections, links, backlinks.
5. Lightweight tasks and projects.
6. Full-text search and filters.
7. Saved live queries as list/table views.
8. Command palette.
9. Desktop windows/tabs/split views.
10. Persistent project workspaces.
11. Object version history and trash.
12. Readable export.
13. Local durability and basic backup/restore.
14. Private-by-default permissions.
15. Keyboard navigation and accessible focus behavior.
16. A few excellent templates: project, meeting, source, decision, daily note.

### P1 — Signature expansion

Add after the core is stable:

- semantic search and evidence-first AI;
- reviewed action extraction;
- text recipes/automations;
- block references/transclusion;
- board/calendar views;
- relations/rollups;
- multi-device sync and conflict handling;
- sharing/comments;
- web clipper;
- study/writing/research modes;
- scoped query console/API.

### P2 — Platform and advanced modes

Only after retention and trust are proven:

- mini-apps and plugin sandbox;
- real-time collaboration;
- optional E2EE vault;
- self-hosting/enterprise controls;
- advanced formulas;
- text canvas;
- local AI;
- integrations/webhooks;
- marketplace.

### First vertical slice

Before building the full P0 surface, prove this end-to-end slice:

```text
Create a note → link it to a project → create a task from it
→ save a query → open note and query side by side
→ save workspace → reload/recover → export → restore version
```

If this slice does not feel meaningfully better than a normal notes app, simplify the OS shell before adding more features.

---

## 10. Example user journeys

### Student

1. Captures a lecture note in Markdown.
2. Links it to a course object and source object.
3. Marks a checklist item as a task.
4. Saves a live query: “Open tasks for this course due this week.”
5. Opens a study workspace with note, task query, and reading pane.
6. Exports an essay outline built from linked notes.

### Researcher/writer

1. Saves a quote as a source object.
2. Links the quote to a claim and a project.
3. Uses backlinks to see every place the source is used.
4. Runs an evidence-first AI summary scoped to selected sources.
5. Compiles an outline with citations.
6. Restores an earlier draft version if a rewrite fails.

### Developer

1. Captures a code snippet and bug note.
2. Links both to a project and task.
3. Opens a split workspace: snippet, task query, decision log.
4. Saves the workspace as a resumable process.
5. Searches across all project notes with filters.
6. Exports the project as Markdown/JSON.

### Freelancer/operator

1. Creates a client object and meeting note.
2. Records a decision with rationale and review date.
3. Extracts proposed tasks and approves them.
4. Opens a client cockpit generated from live queries.
5. Shares a read-only project summary later, with explicit permissions.

---

## 11. Conceptual architecture

This is a recommended direction, not an implementation commitment.

### High-level components

```text
Browser client
  ├─ Desktop shell: windows, tabs, workspaces, command palette
  ├─ Editor: Markdown/rich text, links, tasks, properties
  ├─ Query/view engine: filters, saved queries, live views
  ├─ Local store: durable cache, outbox, offline state
  └─ Search UI: lexical first, semantic later

Server/API
  ├─ Auth and workspace permissions
  ├─ Object/version/history service
  ├─ Search index
  ├─ Sync/conflict service
  ├─ Automation runner with dry-run
  └─ AI gateway with scoped retrieval and citations

Database
  ├─ Workspaces, members, permissions
  ├─ Objects and typed properties
  ├─ Blocks/versions/links
  ├─ Collections, queries, views
  ├─ Sessions/windows/layout state
  ├─ Audit/events/jobs
  └─ External references as text URLs
```

### Candidate stack

Not locked yet:

- **Client:** TypeScript, React, a structured editor such as ProseMirror/TipTap, local IndexedDB cache.
- **Server:** Node/TypeScript API or Next.js route handlers.
- **Database:** PostgreSQL with full-text search; optional vector search later.
- **Auth/RLS:** Supabase is a plausible accelerator because it is connected, but should be evaluated rather than assumed.
- **Hosting:** Vercel is plausible for the web layer; database/sync requirements should drive the final choice.
- **AI:** optional provider abstraction; no AI dependency for core workflows.

### Conceptual data model

| Entity | Purpose |
|---|---|
| Workspace | Tenant boundary and ownership |
| Member/role | Access control |
| Object | Canonical identity for note, task, project, source, decision, query, template |
| ObjectVersion | History and restore |
| Block | Addressable text unit, optional in P0 but future-proof |
| Property | Typed metadata such as status, date, tag, relation |
| Link | Directed relationship between objects/blocks |
| Collection | Manual grouping |
| Query | Saved filter/search definition |
| View | Presentation of a query: list, table, board, calendar |
| Session/WorkspaceState | Open windows, layout, filters, scroll, active object |
| Automation | Trigger, condition, action, dry-run log |
| AuditEvent | Important mutations and access events |
| ExternalReference | URL/source metadata stored as text |

### Text-only enforcement

- Accept text-like formats only: Markdown, plain text, CSV, JSON.
- Reject binary uploads at API and UI boundaries.
- Store external media as URLs, not blobs.
- Keep derived indexes separate from user content.
- If OCR/PDF extraction is added later, process transiently and store only extracted text with explicit consent.

### Sync strategy

P0:

- durable local editing;
- server persistence;
- version IDs;
- basic backup/restore;
- no silent multi-device conflict resolution.

P1:

- local outbox;
- optimistic concurrency;
- delta sync;
- conflict copies or merge UI;
- clear sync status.

Do not claim “seamless sync” until conflicts, offline edits, and restore have been tested.

---

## 12. Trust, security, accessibility, and performance

### Trust principles

1. Private by default.
2. No silent AI mutation.
3. No hidden data loss.
4. Export should be readable without OS-GOD.
5. Dangerous actions require preview, confirmation, or undo.
6. Permissions apply to search, AI, automations, and extensions.
7. Sync status must be honest.

### Security requirements

- Row-level tenant isolation for cloud data.
- Sanitized Markdown; no arbitrary HTML/script execution.
- Content Security Policy and safe rendering.
- Rate limits and quotas.
- Audit important mutations.
- Secure session handling.
- Export/delete account data.
- Backups with restore testing.
- Encryption in transit and at rest.
- E2EE only as a later explicit mode with understood tradeoffs.

### Accessibility

Target WCAG 2.2 AA as a design goal:

- full keyboard navigation;
- visible focus states;
- screen-reader-friendly windows and dialogs;
- reduced-motion support;
- resizable text and panes;
- non-color status indicators;
- mobile capture/read/search flows.

### Performance targets to validate

These are targets, not guarantees:

| Action | Target |
|---|---|
| Local capture/save feedback | < 100 ms perceived |
| Search over 10,000 objects | < 300 ms p95 after index warmup |
| Workspace restore | < 1 s for typical layouts |
| Window drag/resize | Smooth target 60 fps where device allows |
| Offline edit durability | No acknowledged edit lost on reload |
| Export | Completes reliably for large vaults with progress/cancel |

---

## 13. Validation plan before full implementation

### Prototype tests

Use wireframes or a narrow vertical slice before building the full platform.

Recruit roughly 12 users across students, writers/researchers, developers, and freelancers/operators.

Test tasks:

1. Capture a note in under 30 seconds.
2. Link it to a project and create a task.
3. Find an older item using search/filters.
4. Save a live query.
5. Resume a workspace after reload.
6. Restore a previous version.
7. Export the vault and understand the files.

### Success signals

Directional targets:

- 80%+ complete capture/link/search tasks without help.
- Users describe the workspace resume as useful, not confusing.
- Users prefer live queries over manual duplicate lists.
- No data loss in reload/offline/restore tests.
- Users understand export and privacy boundaries.
- At least a subset returns voluntarily after several days.

### Kill/pivot criteria

- If users ignore windows/workspaces and only want notes, simplify the shell.
- If live queries confuse users, improve visual query building before adding AI.
- If AI answers are not trusted, disable or restrict to selected-text operations.
- If sync conflicts are frequent, delay multi-device sync and strengthen local durability.
- If text-only feels too limiting for the target audience, reconsider the constraint before expanding scope.

---

## 14. Major risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Scope creep | “OS” can justify infinite features | One core loop; P0/P1/P2 gates |
| Commodity features | Notes, links, databases, AI already exist | Differentiate through coherence, context, reversibility, portability |
| Sync complexity | Data loss destroys trust | Local durability first; conflict UI before seamless claims |
| AI hallucination | Bad answers damage knowledge work | Citations, scoped retrieval, uncertainty, preview |
| Browser limitations | Global hotkeys, storage, offline vary | In-app shortcuts first; PWA later; test browsers |
| Text-only perception | Some users expect attachments | Market as focused text vault; external links allowed |
| Permission leaks | Shared queries/AI can expose private data | Permission-aware retrieval and sharing tests |
| Performance | Large vaults can become slow | Indexing, pagination, virtualized lists, budgets |
| Plugin security | Extensibility can become attack surface | Sandbox, capabilities, review, delay until stable |
| Overbuilding teams too early | Collaboration multiplies complexity | Personal-first v1; team features after retention |

---

## 15. Open questions for the user

These should be confirmed before implementation, but the recommendation above is strong enough to proceed with planning.

1. **Text-only boundary:** Is the interpretation “no binary media, but metadata/indexes/external URLs are allowed” correct?
2. **Primary audience:** Should v1 focus on individual knowledge workers, with students/writers/developers/freelancers as templates?
3. **Local vs cloud:** Should the first release be local-first with optional cloud sync, or cloud-first with offline cache?
4. **AI at launch:** Should AI be absent from the first usable release and added only after the core is trusted?
5. **Visual personality:** Calm modern desktop, retro terminal, or futuristic “god mode” aesthetic? Recommendation: calm modern desktop with optional theme later.

---

## 16. Recommended next step

Do **not** build the full website yet.

Next step after approval:

1. Convert P0 into a screen map.
2. Define the canonical object/schema model.
3. Write acceptance criteria for the first vertical slice.
4. Design the desktop shell, editor, query view, and workspace resume flow.
5. Only then implement the narrow end-to-end slice.

The first implementation should prove:

```text
One object → many views → persistent context → reversible history → portable export
```

If that feels powerful, expand. If not, simplify before adding AI, plugins, or collaboration.

---

## Sources

- [1](https://www.atlassian.com/blog/state-of-teams-2025) Atlassian, “State of Teams 2025,” vendor survey summary.
- [2](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday) Microsoft WorkLab, “Breaking down the infinite workday,” 2025 special report.
- [3](https://www.notion.com/blog/100-million-of-you) Notion, “100 Million of You,” September 2024.
- [4](https://obsidian.md/) Obsidian official product page.
- [5](https://www.notion.com/help/database-properties) Notion Help, “Database properties.”
- [6](https://outliner.tana.inc/) Tana Outliner official product page.
