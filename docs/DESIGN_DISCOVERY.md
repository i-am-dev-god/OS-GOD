# OS-GOD — Design Discovery
## Liquid Glass, extreme smoothness, responsive shell, motion, and core algorithms

**Status:** Design brainstorm / specification only. No website, app shell, or production implementation has been built.  
**Date:** 2026-11-07  
**Depends on:** [Product Discovery & Feature Selection](./PRODUCT_DISCOVERY.md)  
**Design codename:** Adaptive Liquid Shell

---

## 1. Executive design decision

Design OS-GOD as an **Adaptive Liquid Shell**:

> A calm, text-first knowledge OS whose chrome floats like liquid glass above readable content, whose windows and cards morph continuously between desktop and mobile, and whose motion is interruptible, compositor-first, and automatically degraded when the device cannot afford it.

The design should feel:

- **Liquid:** surfaces appear suspended, softly refractive, and responsive to motion.
- **Smooth:** input is acknowledged immediately; animations never block interaction.
- **OS-like:** windows, workspaces, docks, command surfaces, and persistent context behave like a continuous environment.
- **Readable:** glass is used for controls and navigation, not for long-form content.
- **Adaptive:** desktop becomes a windowed workspace; mobile becomes a thumb-friendly card stack; both preserve the same object identity and visual language.
- **Innovative but disciplined:** unusual arrangements are allowed only when they improve speed, context, or delight.

### Design pillars

| Pillar | Meaning | Non-negotiable rule |
|---|---|---|
| Content first | Text remains the hero | No glass behind body text by default |
| Functional glass | Glass marks controls/navigation | Glass lives above content, not inside paragraphs |
| Interruptible motion | Users can change direction mid-animation | No blocking animation gates |
| Compositor-first | Motion uses transform/opacity where possible | Avoid animating layout/paint-heavy properties |
| Adaptive quality | Effects scale to device capability | Smoothness beats visual richness |
| One object, many forms | Note/task/query can appear as window, card, row, chip | Identity survives layout changes |
| Thumb-first mobile | Core actions reachable one-handed | Capture/search/navigation in lower thumb zone |
| Accessibility | Reduced motion/transparency and keyboard support | Glass and motion never remove access |

---

## 2. Product constraints carried into design

From product discovery:

- Text-only content: no binary media library.
- Database-native objects: notes, tasks, projects, sources, decisions, queries, views.
- Personal-first v1.
- Useful without AI.
- Portable/exportable.
- Offline-friendly and reversible.
- Desktop-first power, mobile-first capture/read/search.

Design implications:

1. Backgrounds should be **procedural CSS gradients, shapes, and light fields**, not stored binary wallpapers.
2. Icons should be inline SVG or font glyphs, not raster assets.
3. The “richness” comes from material, motion, typography, and layout—not images.
4. Every visual state must map to a database object or UI state: object, window, workspace, query, sync state, version, permission.
5. Mobile cannot be a shrunken desktop. It needs a different interaction model with shared identity.

---

## 3. What “Liquid Glass” means for a browser product

Apple describes Liquid Glass as a translucent material that reflects/refracts surroundings, adapts to light/dark contexts, and uses motion-reactive specular highlights. [1](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)

Apple’s Human Interface Guidelines give the most important product rule: Liquid Glass should form a **functional layer for controls and navigation**, floating above content. It should generally not be used in the content layer, and it should be used sparingly to preserve hierarchy and legibility. [2](https://developer.apple.com/design/human-interface-guidelines/materials)

For OS-GOD, this becomes:

```text
L0 — Ambient background layer
     Procedural gradients, soft light fields, subtle depth.

L1 — Content layer
     Readable text surfaces: editors, tables, query results, documents.
     Mostly solid or near-solid. Standard materials only.

L2 — Functional glass layer
     Command capsule, dock, window chrome, rail, inspector, tabs, splitters.
     Regular glass. Legibility protected.

L3 — Transient glass layer
     Command palette, context menus, sheets, toasts, drag ghosts, snap previews.
     Stronger separation, dimming/scrim when needed.

L4 — Focus/accessibility layer
     Focus rings, high-contrast overrides, reduced-transparency fallbacks.
```

### Web material strategy

The browser does not provide Apple’s native Liquid Glass material. OS-GOD should approximate the feeling with:

- static `backdrop-filter` blur;
- translucent surface fills;
- saturation/luminance adjustment;
- edge highlights and inner shadows;
- specular-like gradient overlays;
- transform/opacity motion;
- shared-element morphs;
- adaptive dimming/scims.

`backdrop-filter` applies effects to pixels painted behind an element and can be affected by “backdrop roots,” such as ancestors with opacity, filters, masks, or certain `will-change` values. Glass surfaces must therefore be layered carefully; animating an ancestor’s opacity can accidentally change what the glass samples. [3](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)

High-performance web animation should favor compositor-friendly properties such as `transform` and `opacity`, and avoid properties that trigger layout or paint during continuous motion. [4](https://web.dev/articles/animations-guide)

The View Transition API can help animate between DOM states and preserve context through shared-element transitions, but it should be treated as progressive enhancement with a fallback. [5](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)

### Glass rules

1. **Never put long-form body text on clear glass.**
2. **Never animate blur radius.** Fade glass opacity or transform the surface instead.
3. **Limit simultaneous blurred area.** Glass is a budgeted resource.
4. **Prefer regular glass for text-heavy controls.** Clear glass is only for small controls over ambient backgrounds.
5. **Use scims/dimming when contrast is at risk.**
6. **Provide solid fallbacks.** Reduced transparency, high contrast, low-power mode, or unsupported browsers.
7. **Do not stack many glass layers.** Glass over content is good; glass over glass over glass is usually confusing and expensive.

---

## 4. Design concept tournament

Eight shell directions were compared.

Criteria weights:

- **S — Smoothness feasibility:** 25%
- **G — Liquid Glass fit:** 20%
- **M — Mobile adaptability:** 20%
- **O — OS identity:** 15%
- **I — Innovativeness:** 10%
- **C — Clarity/accessibility:** 10%

Scores are 1–5. Weighted total is out of 100.

| Concept | S | G | M | O | I | C | Total | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Adaptive Liquid Shell | 5 | 5 | 5 | 5 | 4 | 5 | **98** | **Selected** |
| Command-centric hub | 5 | 5 | 4 | 3 | 4 | 4 | 86 | Borrow command capsule |
| Card stream | 5 | 3 | 5 | 2 | 2 | 4 | 75 | Borrow mobile card model |
| Tiling liquid workspace | 4 | 4 | 3 | 4 | 3 | 4 | 74 | Borrow snap/tiling mode |
| Classic desktop clone | 4 | 4 | 2 | 5 | 2 | 4 | 71 | Too generic/mobile-weak |
| Spatial infinite canvas | 3 | 4 | 2 | 4 | 5 | 3 | 67 | Later overview mode only |
| Orbital/radial desktop | 3 | 4 | 3 | 3 | 5 | 2 | 66 | Reject as primary shell |
| Terminal-first glass | 5 | 2 | 3 | 3 | 3 | 3 | 66 | Power mode only |

### Selected concept: Adaptive Liquid Shell

Desktop:

```text
┌────────────────────────────────────────────────────────────────────┐
│                  Floating Liquid Command Capsule                   │
│                                                                    │
│  ┌────────────┐   ┌──────────────────────────────┐   ┌──────────┐  │
│  │ Object     │   │ Window canvas                │   │ Context  │  │
│  │ rail       │   │                              │   │ inspector│  │
│  │            │   │  ┌────────────┐ ┌─────────┐  │   │          │  │
│  │ Collections│   │  │ Note       │ │ Query   │  │   │ Backlinks│  │
│  │ Smart views│   │  │ window     │ │ window  │  │   │ Props    │  │
│  │ Projects   │   │  └──────────── └─────────  │   │ History  │  │
│  └────────────┘   └──────────────────────────────┘   └──────────┘  │
│                                                                    │
│        Orbit Dock: apps · workspaces · recent objects · sync        │
└────────────────────────────────────────────────────────────────────┘
```

Mobile:

```text
┌──────────────────────────────┐
│ Compact context bar          │
│ Project / object / sync      │
│                              │
│ ┌──────────────────────────┐ │
│ │ Active object card       │ │
│ │                          │ │
│ │ Readable content layer   │ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│  Home   Search   Capture     │
│        Spaces   Inbox        │
│ Liquid bottom tab capsule    │
└──────────────────────────────┘
```

The same object can be:

```text
desktop window → split pane → mobile card → bottom sheet → dock chip → query row
```

The design system must preserve object identity across those forms.

---

## 5. Visual language

### 5.1 Material tiers

| Tier | Name | Use | Blur | Surface opacity | Motion | Notes |
|---|---|---|---:|---:|---|---|
| M0 | Solid | Reduced transparency, high contrast, low power, fallback | 0 | 100% | Fade only | No backdrop-filter |
| M1 | Thin Glass | Small controls, chips, tooltips | 8px | 45–60% | Transform/opacity | Limited area |
| M2 | Regular Glass | Command capsule, dock, window chrome, rail, inspector | 14px | 55–72% | Transform/opacity | Default functional glass |
| M3 | Deep Glass | Command palette, sheets, context menus, transient overlays | 18–20px | 68–82% | Transform/opacity + scrim | Short-lived, budgeted |
| MC | Clear Glass | Small controls over ambient background only | 6–10px | 25–40% | Transform/opacity | Not for text-heavy surfaces |

Design budget:

- Maximum blur radius: **20px**.
- Maximum large glass surfaces: **5 desktop**, **3 mobile**.
- Maximum blurred viewport area: **35% desktop**, **25% mobile**.
- If budget exceeded: demote lowest-priority glass to M0/M1.

### 5.2 Glass anatomy

Each glass surface is composed of:

```text
┌──────────────────────────────────────────────┐
│ Specular edge highlight                      │
│  ┌────────────────────────────────────────┐  │
│  │ Translucent fill + static backdrop blur│  │
│  │                                        │  │
│  │ Content/controls                       │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│ Inner shadow / depth cue                     │
└──────────────────────────────────────────────┘
```

Allowed effects:

- static blur;
- translucent fill;
- subtle saturation boost;
- 1px luminous border;
- top-edge specular gradient;
- static inner shadow;
- static outer shadow baked into pseudo-element;
- opacity/transform animation.

Avoid:

- animated blur;
- animated box-shadow;
- animated width/height/top/left for continuous motion;
- heavy SVG displacement/refraction filters;
- glass inside glass inside glass;
- glass behind paragraphs.

### 5.3 Color themes

#### Aurora Light

| Token | Value | Use |
|---|---|---|
| `bg.ambient` | `#F6F7FB` | Base background |
| `bg.ambient.gradient` | radial blue/violet/teal light fields | Procedural depth |
| `surface.content` | `#FFFFFF` | Editors/tables |
| `surface.content.alt` | `#F1F4FA` | Panels |
| `text.primary` | `#0B1220` | Body text |
| `text.secondary` | `#4B5565` | Metadata |
| `accent.primary` | `#6EA8FF` | Primary actions |
| `accent.secondary` | `#7C5CFF` | AI/advanced accents |
| `glass.border.light` | `rgba(255,255,255,0.55)` | Edge highlight |
| `glass.border.dark` | `rgba(11,18,32,0.08)` | Outline |
| `scrim.light` | `rgba(246,247,251,0.45)` | Overlay dimming |

#### Obsidian Dark

| Token | Value | Use |
|---|---|---|
| `bg.ambient` | `#0A0C12` | Base background |
| `bg.ambient.gradient` | radial deep blue/graphite/teal light fields | Procedural depth |
| `surface.content` | `#11141C` | Editors/tables |
| `surface.content.alt` | `#171B26` | Panels |
| `text.primary` | `#F5F7FF` | Body text |
| `text.secondary` | `#A7B0C2` | Metadata |
| `accent.primary` | `#8AB4FF` | Primary actions |
| `accent.secondary` | `#A78BFA` | AI/advanced accents |
| `glass.border.light` | `rgba(255,255,255,0.16)` | Edge highlight |
| `glass.border.dark` | `rgba(0,0,0,0.35)` | Outline |
| `scrim.dark` | `rgba(4,6,10,0.5)` | Overlay dimming |

#### High Contrast

- Solid surfaces only.
- Strong borders.
- No reliance on translucency for hierarchy.
- Status uses icon + text, not color alone.

#### Reduced Transparency

- All M1/M2/M3/MC become M0 or near-solid.
- Shadows reduced.
- Motion simplified.

### 5.4 Typography

| Role | Font direction | Size | Weight | Notes |
|---|---|---:|---:|---|
| UI label | System sans / Inter-like | 13–14px | 500 | Compact chrome |
| UI body | System sans / Inter-like | 14–16px | 400 | Panels, lists |
| Editor body |Readable serif or sans option | 16–18px | 400 | User choice later |
| Editor heading | Sans | 20–32px | 600 | Clear hierarchy |
| Code/query | Monospace | 13–14px | 400 | Query console, snippets |
| Metadata | Sans | 11–12px | 500 | Uppercase/tracking sparingly |

Rules:

- Body text contrast target: **4.5:1 minimum**, preferably higher.
- Large text/UI components: **3:1 minimum** where applicable.
- Avoid thin weights on glass.
- Font loading must not block first paint; use system fallbacks.

### 5.5 Shape, spacing, elevation

| Token | Value | Use |
|---|---:|---|
| `radius.capsule` | 999px | Command capsule, dock, pills |
| `radius.window` | 18px | Desktop windows |
| `radius.card` | 22px | Mobile cards |
| `radius.control` | 12px | Buttons, inputs |
| `radius.inner` | 10px | Nested content |
| `space.1` | 4px | Micro |
| `space.2` | 8px | Tight |
| `space.3` | 12px | Default gap |
| `space.4` | 16px | Panel padding |
| `space.5` | 24px | Section |
| `space.6` | 32px | Layout |
| `elevation.1` | subtle static shadow | Chips |
| `elevation.2` | medium static shadow | Windows |
| `elevation.3` | strong static shadow + scrim | Modals/sheets |

Concentric corner rule:

```text
outer radius = inner radius + padding
```

This keeps nested glass/content surfaces visually harmonious.

### 5.6 Iconography

- Inline SVG stroke icons.
- 1.5–2px stroke.
- Rounded caps/joins.
- 16px chrome icons, 20px primary actions, 24px mobile capture.
- No raster icon sheets.
- Icons must have text labels or accessible names.

---

## 6. Desktop layout specification

### 6.1 Regions

| Region | Purpose | Material | Behavior |
|---|---|---|---|
| Liquid Command Capsule | Search, capture, commands, workspace switch, sync | M2 | Floats top-center; expands into palette |
| Object Rail | Collections, smart views, projects, inbox | M2 | Collapsible left rail |
| Window Canvas | Freeform/snapped windows | Content M0/M1, chrome M2 | Drag, resize, snap, focus |
| Context Inspector | Backlinks, properties, history, related objects | M2 | Collapsible right rail |
| Orbit Dock | Apps, workspaces, recent objects, sync orb | M2 | Bottom-center; morphs minimized windows |
| Object Trail | Breadcrumb/path/context chips | M1 | Above window canvas or inside window header |
| Snap Constellation | Temporary snap/tiling previews | M3 | Appears during drag only |

### 6.2 Liquid Command Capsule

Default state:

```text
[ Workspace ▾ ] [ Search or type a command… ] [ Capture + ] [ Sync orb ] [ Profile ]
```

Expanded state:

```text
┌──────────────────────────────────────────────┐
│ Search objects, commands, queries…           │
│                                              │
│ Recent                                       │
│ > Project Atlas                              │
│ > Decision: pricing model                    │
│                                              │
│ Actions                                      │
│ + Capture note                               │
│ + Create task                                │
│ + Run saved query                            │
└──────────────────────────────────────────────┘
```

Interaction:

- Click or `Cmd/Ctrl+K` expands capsule into command palette.
- Typing immediately searches local index.
- `Cmd/Ctrl+N` focuses capture composer.
- Capsule morphs, not replaces: shared-element transition from capsule to palette.
- Sync orb is always visible but only animates when state changes.

Positives:

- one obvious entry point;
- strong OS identity;
- reduces chrome clutter;
- works as search/capture/command launcher.

Negatives:

- consumes top vertical space;
- can become hidden-only if menus disappear;
- expansion morph is complex.

Guardrails:

- keep visible rail/dock menus;
- cap capsule height;
- provide non-animated fallback.

### 6.3 Orbit Dock

Contents:

```text
[Today] [Search] [Capture] | [Workspace orbs] | [Recent objects] | [Sync orb]
```

Behavior:

- pinned apps/workspaces stay left;
- recent/minimized objects appear as chips;
- minimizing a window morphs it into a dock chip;
- hovering a chip shows object preview;
- clicking restores window with shared-element transition;
- workspace orbs switch contexts with slide/parallax transition.

Positives:

- OS-like continuity;
- fast switching;
- visual home for minimized objects.

Negatives:

- can become cluttered;
- mobile cannot use same dock literally.

Guardrails:

- max recent chips: 5;
- overflow into “More” sheet;
- mobile maps dock to bottom tab capsule + card stack.

### 6.4 Window anatomy

```text
┌──────────────────────────────────────────────┐
│ Glass chrome: title · object type · actions  │
├──────────────────────────────────────────────┤
│ Content layer: editor / table / query result │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

Window states:

| State | Visual | Motion |
|---|---|---|
| Normal | M2 chrome, solid content | Open/close scale-fade |
| Active | brighter edge, focus ring | Micro emphasis |
| Inactive | reduced chrome opacity | Fade only |
| Minimized | dock chip | Morph to dock |
| Maximized | full canvas | FLIP bounds transition |
| Snapped | half/quarter/third | Spring to snap rect |
| Focus mode | others dimmed | Focus lens fade/scale |
| Loading | skeleton content | Opacity pulse |
| Error | border pulse + message | No shake by default |

### 6.5 Pane Constellation: snapping and tiling

During drag, show temporary glass previews:

```text
┌──────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Left half    │  │ Right half           │  │
│  └──────────────┘  └──────────────────────┘  │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ Q1   │ │ Q2   │ │ Q3   │ │ Q4   │         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
└──────────────────────────────────────────────┘
```

Snap targets:

- left/right half;
- top/bottom half;
- quarters;
- thirds on wide screens;
- maximize;
- adjacent window edges;
- previous user layout.

Positives:

- efficient multitasking;
- visually impressive but functional;
- supports keyboard tiling.

Negatives:

- too many previews can overwhelm;
- solver complexity.

Guardrails:

- show only nearest 1–3 candidates;
- preview appears after drag threshold;
- keyboard shortcuts mirror drag snapping.

### 6.6 Context Inspector

Tabs:

```text
[Properties] [Backlinks] [History] [Related]
```

Behavior:

- collapsible;
- follows active window/object;
- backlinks open as hovercards or side windows;
- history includes version scrubber later;
- properties edit inline with optimistic UI.

Positives:

- makes database relationships visible;
- supports knowledge work.

Negatives:

- can crowd canvas;
- duplicate information if always open.

Guardrails:

- default collapsed on narrow desktops;
- remember per-workspace preference.

### 6.7 Focus Lens

When enabled:

- active window remains full clarity;
- other windows dim and scale to 98%;
- ambient background darkens slightly;
- dock/rail reduce opacity;
- exit restores previous state.

Motion:

- 240ms fade/scale;
- reduced motion: fade only.

Positives:

- strong focus mode;
- uses glass/depth meaningfully.

Negatives:

- can hide context;
- motion sensitivity risk.

Guardrails:

- user-triggered only;
- no automatic focus lens on every click.

---

## 7. Mobile and tablet specification

### 7.1 Breakpoints

| Breakpoint | Layout | Navigation | Windows |
|---|---|---|---|
| `<640px` | Mobile card stack | Bottom liquid tab capsule | Full-screen cards/sheets |
| `640–1023px` | Tablet hybrid | Bottom capsule or side rail | 1–2 split cards |
| `1024–1439px` | Desktop | Command capsule + dock | Freeform/snapped windows |
| `≥1440px` | Wide desktop | Expanded rail/inspector | Thirds/advanced tiling |

Also adapt to:

- `pointer: coarse`;
- hover unavailable;
- reduced motion;
- reduced transparency;
- viewport height/keyboard visibility.

### 7.2 Mobile navigation model

Bottom Liquid Tab Capsule:

```text
[ Today ] [ Search ] [ Capture ● ] [ Spaces ] [ Inbox ]
```

Capture is center and slightly elevated. It morphs into a capture sheet.

Top compact context bar:

```text
[ Back ] [ Object title / workspace ] [ Sync ] [ More ]
```

Core gestures:

| Gesture | Action | Guardrail |
|---|---|---|
| Tap | Open/select | No hover dependency |
| Swipe left/right on card header | Switch open card/workspace | Gesture arbiter prevents scroll conflict |
| Swipe down on sheet | Dismiss sheet | Only from sheet header |
| Long press object | Context menu | 450ms threshold, cancel on move |
| Pull down from top context bar | Command palette | Optional, discoverable alternative exists |
| Drag from capture FAB | Quick capture type menu | Optional power gesture |
| Pinch | Zoom text only if enabled | Do not zoom whole OS by default |

### 7.3 Mobile card stack

Objects appear as full-screen cards:

```text
┌──────────────────────────────┐
│ Context bar                  │
├──────────────────────────────┤
│ Card content                 │
│                              │
│                              │
├──────────────────────────────┤
│ Object actions / metadata    │
└──────────────────────────────┘
```

Card transitions:

- open: shared-element morph from list row/dock chip;
- close: reverse morph;
- switch: horizontal slide with spring;
- minimize: card collapses into bottom capsule/recent chip;
- sheet: bottom slide with drag-to-dismiss.

Positives:

- thumb-friendly;
- preserves object identity;
- avoids tiny windows.

Negatives:

- less “desktop OS” feeling;
- horizontal swipes can conflict with scrolling.

Guardrails:

- restrict horizontal swipe to header/card edges;
- provide visible back/switcher buttons;
- preserve vertical scrolling inside content.

### 7.4 Capture FAB morph

Default:

```text
[ + ]
```

Press:

```text
┌──────────────────────────────┐
│ Capture                      │
│ Type or paste text…          │
│                              │
│ [Note] [Task] [Source] [Ask] │
│                              │
│ [Save locally] [Save+link]   │
└──────────────────────────────┘
```

Motion:

- FAB morphs into sheet using shared-element/FLIP;
- keyboard appears without covering actions;
- save collapses sheet into toast/chip;
- sync orb updates state.

Positives:

- fastest mobile action;
- clear primary action.

Negatives:

- accidental taps;
- keyboard layout complexity.

Guardrails:

- require intentional tap, not hover;
- keep save/cancel in safe area;
- autosave draft locally.

### 7.5 Tablet hybrid

- 1–2 cards side by side;
- optional side rail becomes overlay sheet;
- dock can remain bottom capsule;
- drag between panes creates link by default;
- external keyboard enables desktop shortcuts.

---

## 8. Component inventory

| Component | Purpose | Material | Motion | Responsive behavior |
|---|---|---|---|---|
| Liquid Command Capsule | Search/capture/command | M2 | Expand/morph | Top bar on mobile |
| Command Palette | Global actions/search | M3 | Shared-element expand | Full-screen sheet |
| Orbit Dock | Apps/workspaces/recent | M2 | Stagger/chip morph | Bottom tab capsule |
| Object Rail | Navigation | M2 | Slide/collapse | Overlay sheet |
| Context Inspector | Metadata/backlinks/history | M2 | Slide/collapse | Bottom sheet/tab |
| Window | Desktop object container | M2 chrome + content | Open/close/snap/morph | Becomes card |
| Card | Mobile object container | Content + M1 header | Slide/morph | Becomes window on desktop |
| Pane | Split content | Content | Resize/FLIP | Stacked/split tablet |
| Splitter | Resize panes | M1 | Direct drag | Larger touch target |
| Query Pill | Visible filter | M1 | Add/remove FLIP | Wraps/scrolls |
| Object Chip | Linked object | M1 | Drag/ghost | Long-press menu |
| Object Trail | Breadcrumb/context | M1 | Fade/slide | Collapses to dropdown |
| Sync Orb | Local/sync/conflict state | M1 | State morph | Compact icon+label |
| Toast | Feedback | M3 | Slide/fade | Bottom above capsule |
| Sheet | Mobile transient panel | M3 | Bottom slide/drag | Desktop popover/modal |
| Context Menu | Object actions | M3 | Scale/fade | Long-press sheet |
| Tooltip | Hint | M1 | Delayed fade | Tap-hold alternative |
| Snap Preview | Drag target | M3 | Spring/fade | Hidden on mobile |
| Drag Ghost | Dragged object | M1/M0 | Direct transform | Solid-ish for perf |
| Focus Lens | Dim background | Scrim | Fade/scale | Fade only |
| Time Scrubber | Version history | M1 | Scrub/diff | Sheet on mobile |
| Version Diff | Compare versions | Content | Crossfade | Stacked on mobile |
| Skeleton | Loading | Content | Opacity pulse | Same |
| Empty State | Onboarding | Content | Fade | Same |
| Modal | Critical confirmation | M3 + scrim | Scale/fade | Sheet |
| Hovercard | Backlink/object preview | M3 | Delayed fade | Tap preview sheet |
| Workspace Orb | Context switch | M1 | Slide/parallax | Spaces tab |
| Capture Composer | Quick text entry | Content + M2 | FAB morph | Sheet |
| Status Strip | Sync/save/permission | M1 | Fade | Dock/capsule integration |
| Focus Ring | Accessibility | L4 | Instant | Always visible |

---

## 9. Motion system

### 9.1 Motion principles

1. **Immediate acknowledgment:** visual response to input within 50ms target.
2. **Interruptible:** animations can be canceled/retargeted mid-flight.
3. **Physical but restrained:** springs for spatial changes, fades for state changes.
4. **Compositor-first:** continuous motion uses transform/opacity.
5. **Shared identity:** objects morph between forms instead of disappearing/reappearing.
6. **No blocking:** users can type/click/drag during transitions.
7. **Reduced motion respected:** large spatial motion becomes fade/instant.
8. **Adaptive:** low-power devices get shorter/simpler motion and less glass.

### 9.2 Duration tokens

| Token | Value | Use |
|---|---:|---|
| `motion.instant` | 80ms | Press, focus, micro state |
| `motion.fast` | 140ms | Hover, tooltip, chip |
| `motion.base` | 220ms | Window open/close, palette |
| `motion.slow` | 320ms | Workspace switch, sheet |
| `motion.deliberate` | 420ms | Minimize morph, focus lens |
| `motion.reduced` | 100ms fade | Reduced motion fallback |

### 9.3 Easing and springs

| Token | Value | Use |
|---|---|---|
| `ease.standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | General enter/exit |
| `ease.decelerate` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Incoming elements |
| `ease.accelerate` | `cubic-bezier(0.4, 0.0, 1, 1)` | Outgoing elements |
| `spring.micro` | stiffness 420, damping 34, mass 1 | Chips, buttons |
| `spring.window` | stiffness 320, damping 30, mass 1 | Windows/cards |
| `spring.workspace` | stiffness 260, damping 28, mass 1 | Workspace/card swipes |
| `spring.gentle` | stiffness 200, damping 26, mass 1 | Sheets, focus lens |

Springs should be interruptible and preserve velocity where possible.

### 9.4 Animation catalog

| Trigger | Motion | Duration | Easing/spring | Properties | Reduced motion |
|---|---|---:|---|---|---|
| Boot/first paint | Ambient fade, capsule/dock stagger | 300ms total | ease.decelerate | opacity, translateY | Fade only |
| Window open | Scale 0.98→1, translateY 8→0, fade | 220ms | spring.window | transform, opacity | Fade |
| Window close | Reverse open | 160ms | ease.accelerate | transform, opacity | Fade |
| Minimize to dock | Shared-element morph to chip | 320ms | spring.window | transform, opacity | Fade to chip |
| Restore from dock | Chip morphs to window | 320ms | spring.window | transform, opacity | Fade |
| Maximize/restore | FLIP bounds | 240ms | spring.window | transform | Instant/fade |
| Drag window | Direct pointer follow | Real-time | none | transform | Same, no trailing |
| Snap preview | Nearest zone fades/scales in | 140ms | spring.micro | transform, opacity | Fade |
| Release to snap | Spring to target rect | 260ms | spring.window | transform | Instant |
| Resize window | Direct ghost during drag, commit on release | Real-time | none | transform | Same |
| Workspace switch | Horizontal slide + subtle parallax | 300ms | spring.workspace | transform, opacity | Fade |
| Command palette open | Capsule expands via shared element | 200ms | spring.window | transform, opacity | Fade |
| Command palette close | Reverse | 160ms | ease.accelerate | transform, opacity | Fade |
| Capture FAB press | Depress scale 0.96 | 80ms | spring.micro | transform | Same |
| Capture sheet open | FAB morphs to sheet | 240ms | spring.gentle | transform, opacity | Fade/slide minimal |
| Capture save | Sheet collapses to toast/chip | 180ms | spring.micro | transform, opacity | Fade |
| Search results | Stagger fade/translate, max 8 items | 40ms stagger | ease.decelerate | transform, opacity | Fade |
| Live query update | FLIP reorder, add/remove fade | 220ms | spring.micro | transform, opacity | Fade |
| Toast | Slide/fade from bottom/top | 180ms | spring.micro | transform, opacity | Fade |
| Sync orb pending | Soft pulse/rotation only while pending | 1.2s loop | linear | transform, opacity | Static icon |
| Sync orb success | Morph to check | 180ms | spring.micro | transform, opacity | Instant |
| Theme switch | Root crossfade | 200ms | ease.standard | opacity | Instant |
| Skeleton loading | Opacity pulse | 1.4s loop | ease-in-out | opacity | Static |
| AI streaming | Batch text append per frame | rAF | none | text content | Same |
| Error | Border/color pulse | 180ms | ease.standard | opacity/color | Color only |
| Hover lift | Scale 1.02 | 140ms | spring.micro | transform | Same |
| Press | Scale 0.97 | 80ms | spring.micro | transform | Same |
| Focus lens enter | Dim others, scale 0.98 | 240ms | spring.gentle | opacity, transform | Fade |
| Focus lens exit | Reverse | 200ms | ease.standard | opacity, transform | Fade |
| Mobile card swipe | Direct transform, release spring | Real-time | spring.workspace | transform | Same |
| Sheet dismiss | Drag down, release spring | Real-time | spring.gentle | transform | Same |
| Context menu | Scale/fade from origin | 140ms | spring.micro | transform, opacity | Fade |
| Backlink hovercard | Delayed fade/scale | 120ms after delay | ease.decelerate | transform, opacity | Fade |

### 9.5 Transition map

| From | To | Transition | Identity preserved |
|---|---|---|---|
| Dock chip | Window | Shared-element morph | Object ID |
| Window | Dock chip | Minimize morph | Object ID |
| List row | Card/window | Shared-element expand | Object ID |
| Card | Sheet | Bottom morph/slide | Object ID |
| Command capsule | Palette | Expand morph | Search state |
| Capture FAB | Composer sheet | Morph | Draft ID |
| Query row | Linked object | Expand/open side window | Object ID |
| Workspace A | Workspace B | Slide/parallax | Workspace ID |
| Normal | Focus mode | Focus lens fade/scale | Active object |
| Version A | Version B | Crossfade/diff | Object version |
| Light theme | Dark theme | Root crossfade | Theme token |
| Local save | Synced | Sync orb state morph | Save state |
| Conflict | Resolution | Sheet/modal | Conflict ID |

### 9.6 Motion implementation strategy

Preferred order:

1. CSS transitions for simple state changes.
2. Web Animations API for interruptible springs and precise control.
3. FLIP for layout changes.
4. View Transitions API for shared-element morphs where supported.
5. Manual FLIP fallback where View Transitions are unavailable.
6. Instant/fade fallback for reduced motion or low quality tier.

Rules:

- Do not animate `backdrop-filter`, `blur`, `box-shadow`, `width`, `height`, `top`, `left`, `margin`, or `padding` continuously.
- Use `transform` and `opacity` for continuous motion.
- Use temporary `will-change` only during active interaction; remove afterward.
- Measure once before FLIP; batch reads/writes.
- During drag, write transforms directly or through a single rAF loop; avoid framework re-render per pointer move.
- Cancel and retarget animations on new input instead of queuing.

---

## 10. Core algorithms

These are design-level algorithms, not implementation code. They define how the interface stays smooth, adaptive, and coherent.

### 10.1 Master algorithm: Adaptive Liquid Runtime

The runtime combines three governors:

```text
Adaptive Quality Governor
        +
Glass Budget Manager
        +
Motion Scheduler
        =
Adaptive Liquid Runtime
```

Master loop:

```text
on each frame or interaction epoch:
  1. Measure frame health, input latency, visibility, device hints.
  2. Update quality tier using hysteresis.
  3. Allocate glass budget by surface priority and visible area.
  4. Schedule motion by lane:
       - input-critical: direct manipulation
       - micro: hover/press/focus
       - structural: open/close/snap/workspace
       - ambient: sync/loading/background
  5. Prefer compositor-friendly animation paths.
  6. Apply reduced-motion/reduced-transparency overrides.
  7. Commit DOM writes in batches.
  8. Record performance telemetry locally for debugging.
```

Positives:

- one coherent smoothness system;
- prevents glass/motion from overwhelming device;
- makes “extreme smoothness” measurable.

Negatives:

- tuning complexity;
- possible visual inconsistency if tiers change too often.

Guardrails:

- hysteresis;
- user override;
- deterministic fallbacks.

---

### 10.2 Adaptive Quality Governor

Purpose:

> Automatically choose visual richness based on real frame health, not just device labels.

Inputs:

- rolling frame-time average and p95;
- long-task count;
- input-to-visual-ack latency;
- viewport size and pixel density;
- pointer type;
- `prefers-reduced-motion`;
- `prefers-reduced-transparency` or user setting;
- optional device memory/hardware concurrency hints;
- page visibility;
- battery/low-power hint if available.

Outputs:

| Tier | Name | Glass | Motion | Shadows | Virtualization |
|---|---|---|---|---|---|
| Q0 | Essential | M0 solid | Fade/instant | Minimal | Aggressive |
| Q1 | Lite | M1 small surfaces | Short transform/opacity | Static low | High |
| Q2 | Standard | M2 functional glass | Full catalog | Static medium | Normal |
| Q3 | Rich | M2/M3 budgeted | Full springs/specular | Static high | Normal |

Pseudocode:

```text
quality = initial_quality_from_hints()

every 500ms:
  health = frame_stats(window=2s)

  if reduced_motion or reduced_transparency:
    quality = Q0
    return

  if health.p95 > 24ms for 3 consecutive samples:
    quality = downgrade(quality)
    cooldown = 5s

  else if health.p95 < 14ms for 10 consecutive samples and cooldown expired:
    quality = upgrade(quality)

  apply_quality_tokens(quality)
```

Hysteresis rules:

- downgrade quickly;
- upgrade slowly;
- do not oscillate more than once per 10 seconds;
- never upgrade while dragging or typing if frame health is unstable.

Positives:

- protects low-end devices;
- keeps high-end devices rich;
- makes smoothness adaptive.

Negatives:

- users may notice quality changes;
- browser hints are imperfect.

Guardrails:

- manual “Visual quality: Auto/Lite/Standard/Rich” setting;
- change only material tokens, not layout.

---

### 10.3 Glass Budget Manager

Purpose:

> Treat blur/translucency as a limited GPU resource.

Inputs:

- visible glass surfaces;
- surface area;
- blur radius;
- priority;
- quality tier;
- viewport size;
- device class.

Priority order:

```text
1. Command palette / active modal
2. Active window chrome
3. Command capsule / dock
4. Object rail / inspector
5. Inactive window chrome
6. Toasts / hovercards / drag ghosts
```

Cost model:

```text
cost(surface) = visible_area * blur_radius_factor * tier_multiplier

budget desktop = 35% viewport area equivalent
budget mobile  = 25% viewport area equivalent
```

Pseudocode:

```text
visible = intersecting_glass_surfaces()
sort visible by priority descending

total = 0
for surface in visible:
  c = cost(surface)
  if total + c <= budget and count_large < max_large:
    assign_material(surface, requested_tier)
    total += c
  else:
    assign_material(surface, M0_or_M1)

if quality <= Q1:
  demote_all_large_glass_to_M1_or_M0
```

Rules:

- disable glass for offscreen surfaces using IntersectionObserver;
- avoid nested backdrop roots;
- do not place glass inside animated opacity ancestors when possible;
- transient overlays may temporarily exceed budget by demoting background glass.

Positives:

- prevents GPU overload;
- keeps glass intentional.

Negatives:

- some surfaces become solid unexpectedly;
- priority tuning needed.

Guardrails:

- demotion is subtle, not layout shift;
- active controls always legible.

---

### 10.4 Compositor-first Motion Scheduler

Purpose:

> Keep animations smooth and interruptible without blocking input.

Animation lanes:

| Lane | Examples | Priority | Strategy |
|---|---|---:|---|
| Input-critical | Drag, resize, swipe | Highest | Direct transform, rAF, no transition |
| Micro | Hover, press, focus | High | CSS/WAAPI short transform/opacity |
| Structural | Open/close/snap/workspace | Medium | WAAPI springs, FLIP, View Transitions |
| Ambient | Sync orb, skeleton | Low | CSS opacity/transform, pause when hidden |

Pseudocode:

```text
schedule(animation):
  if reduced_motion:
    return fade_or_instant(animation)

  if animation.lane == input-critical:
    cancel_existing_target_animation(animation.target)
    bind_direct_manipulation(animation)
    return

  if animation.is_layout_change:
    use_FLIP(animation)
    return

  if animation.shared_element and supports_view_transitions:
    use_view_transition(animation)
    return

  use_WAAPI_or_CSS(animation)
```

FLIP procedure:

```text
1. Read current bounds of affected elements.
2. Apply final DOM/layout state.
3. Read final bounds.
4. Apply inverse transform.
5. Animate transform to identity.
6. Clean up will-change and temporary styles.
```

Interruptibility:

```text
on new user intent targeting animating element:
  capture current computed transform/velocity
  cancel old animation
  start new animation from current state
  preserve interaction responsiveness
```

Positives:

- smooth under interruption;
- avoids layout thrash.

Negatives:

- more complex than simple CSS transitions.

Guardrails:

- single rAF ticker for JS-driven motion;
- batch DOM reads/writes;
- no per-pointer-move framework state updates.

---

### 10.5 Liquid Window Manager and Snap Solver

Purpose:

> Provide OS-like windows that are fast to drag, snap, resize, minimize, and restore.

Window state:

```text
Window {
  id
  objectId
  workspaceId
  rect { x, y, w, h }
  z
  mode: normal | maximized | minimized | snapped
  snapTarget?
  velocity?
  focusState
}
```

Drag flow:

```text
pointerdown on chrome:
  if movement < 4px: treat as click/focus
  else:
    capture pointer
    promote window to drag layer
    animate lift scale 1.01 / shadow opacity
    track pointer in rAF

pointermove:
  update transform directly
  compute snap candidates
  show nearest preview

pointerup:
  if snap candidate:
    commit rect with spring
  else:
    commit free position
  restore layer/material
```

Snap candidate scoring:

```text
candidates = screen_edges + halves + quarters + thirds + adjacent_window_edges + user_history

score(candidate) =
    w1 * distance_pointer_to_zone_center
  + w2 * edge_alignment_error
  + w3 * overlap_with_other_windows_penalty
  + w4 * user_layout_preference_bonus
  + w5 * workspace_grid_bonus

choose lowest score if within activation threshold
```

Keyboard equivalents:

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl+Alt+Left` | Snap left half |
| `Cmd/Ctrl+Alt+Right` | Snap right half |
| `Cmd/Ctrl+Alt+Up` | Maximize |
| `Cmd/Ctrl+Alt+Down` | Restore/minimize |
| `Cmd/Ctrl+Alt+1..4` | Snap quarter |
| `Cmd/Ctrl+Backtick` | Cycle windows |
| `Esc` | Close transient surface |

Mobile mapping:

- windows become cards;
- snap solver disabled;
- card stack uses gesture arbiter;
- split view on tablet uses simplified two-pane solver.

Positives:

- real OS feel;
- efficient multitasking.

Negatives:

- edge cases with many windows;
- touch conflicts.

Guardrails:

- max active windows per workspace: 8;
- overflow minimized to dock;
- pointer capture and touch-action rules.

---

### 10.6 Gesture Intent Arbiter

Purpose:

> Decide whether a touch is scroll, swipe, drag, long-press, or resize without fighting the browser.

State machine:

```text
IDLE
  → PRESS on pointerdown
  → CANDIDATE after 6px movement or 120ms hold

CANDIDATE:
  if target is resize handle → RESIZE
  if horizontal velocity > vertical velocity * 1.4 and allowed → SWIPE
  if vertical scroll container and vertical movement → NATIVE_SCROLL
  if hold > 450ms and movement < 8px → LONG_PRESS
  if draggable object and movement > 8px → DRAG
  else → TAP
```

Rules:

- use Pointer Events;
- set `touch-action` intentionally:
  - `none` on drag handles/windows chrome;
  - `pan-y` on vertical content;
  - `manipulation` on buttons;
- do not hijack browser back gestures globally;
- provide visible alternatives for every gesture;
- cancel long-press on movement;
- use velocity threshold for swipe commit: `>0.5 px/ms` or `>35% travel`.

Positives:

- mobile feels native;
- reduces accidental actions.

Negatives:

- tuning required across devices;
- complex nested scroll areas.

Guardrails:

- gesture debug overlay in dev mode;
- conservative defaults.

---

### 10.7 Shared-Element Transition Orchestrator

Purpose:

> Preserve object identity when moving between list, window, card, sheet, and dock.

Identity map:

```text
transitionName = sanitize(objectId + ":" + surfaceKind)
```

Flow:

```text
on open_object(objectId, targetSurface):
  if reduced_motion:
    update DOM and focus target
    return

  if supports_view_transitions:
    assign unique view-transition-name to source/target
    startViewTransition(updateDOM)
    on finished: restore focus/scroll, cleanup names
  else:
    FLIP(sourceBounds, targetBounds)
```

Rules:

- transition names must be unique among rendered elements;
- only one active morph per object;
- cancel previous morph if new intent arrives;
- focus moves to target after transition;
- screen reader announces object change once, not per animation frame.

Positives:

- strong continuity;
- “god-level” morphing without losing context.

Negatives:

- browser support and edge cases;
- snapshot cost for large surfaces.

Guardrails:

- fallback FLIP;
- avoid morphing huge documents; morph header/chip instead.

---

### 10.8 Incremental Live View Engine

Purpose:

> Keep saved queries and smart views updated without full re-render jank.

Model:

```text
Query {
  id
  filters
  sort
  projection
  subscribedIndexes
}

Mutation {
  objectId
  changedFields
  version
}
```

Flow:

```text
on mutation:
  mark affected queries dirty via dependency graph
  debounce 80ms
  recompute only candidate rows using indexes
  diff oldResult vs newResult
  emit patch { added, removed, moved, updated }

on patch:
  apply minimal DOM changes
  FLIP moved rows
  fade added/removed rows
  preserve scroll/focus when possible
```

Search/command ranking:

```text
score =
    fuzzy_match_score
  + title_boost
  + exact_match_boost
  + recency_boost
  + frequency_boost
  + current_workspace_boost
  + object_type_action_boost
```

Positives:

- live views feel alive but stable;
- avoids full list re-render.

Negatives:

- dependency graph complexity;
- diff/FLIP cost for large lists.

Guardrails:

- virtualize lists over 100 rows;
- cap stagger animations;
- disable FLIP for very large result sets.

---

### 10.9 Virtualized Object Renderer

Purpose:

> Render large documents/query results smoothly.

Strategy:

- virtualize query tables and long block lists;
- estimate block heights, measure after render;
- adaptive overscan based on quality tier;
- preserve scroll anchor on data changes;
- use `content-visibility`/containment where appropriate;
- avoid virtualizing the active editing cursor region in a way that breaks IME/selection.

Pseudocode:

```text
visibleRange = scrollOffset / estimatedItemHeight
renderRange = visibleRange ± overscan(quality)

on scroll:
  update range in rAF
  recycle DOM nodes
  measure newly visible items asynchronously
  correct estimates without jumping
```

Positives:

- scales to large vaults;
- reduces memory/layout cost.

Negatives:

- editor virtualization is tricky;
- scroll jumps if estimates bad.

Guardrails:

- start with tables/lists;
- editor block virtualization later;
- accessibility testing required.

---

### 10.10 Design-visible Sync State Machine

Purpose:

> Make local-first durability and sync understandable through motion and status.

States:

```text
local_ack → pending → syncing → synced
                     ↘ conflict
                     ↘ error
```

UI mapping:

| State | Orb | Label | Motion |
|---|---|---|---|
| local_ack | dot | Saved locally | Instant dot |
| pending | hollow ring | Waiting to sync | Soft pulse |
| syncing | rotating arc | Syncing | Slow transform loop |
| synced | check | Synced | Morph to check |
| conflict | split icon | Conflict | Attention pulse, no shake |
| error | warning | Sync error | Color + icon |

Algorithm:

```text
on edit:
  apply optimistic local mutation
  write durable local outbox
  show local_ack

background:
  batch outbox mutations
  send with baseVersion
  if accepted: mark synced
  if conflict: create conflict copy, show resolution sheet
  if network error: retry with backoff, keep local_ack/pending
```

Positives:

- trust through visible state;
- motion communicates meaning.

Negatives:

- constant animation can distract;
- conflict UX complex.

Guardrails:

- animate only while pending/syncing;
- respect reduced motion;
- never hide conflict state.

---

## 11. Full design idea ledger

Decision key:

- **P0:** core design system / first prototype
- **P1:** signature expansion
- **P2:** later advanced design
- **Reject:** not part of current direction

### 11.1 Visual and material ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D001 | Functional-layer Liquid Glass | Clear hierarchy, premium feel | Less “everything is glass” spectacle | P0 |
| D002 | Regular/clear glass variants | Adapts to background and legibility | More tokens/states | P0 |
| D003 | Procedural CSS ambient backgrounds | Text-only friendly, no binary assets | Less photographic richness | P0 |
| D004 | Static specular edge highlights | Depth without heavy animation | Can look flat if overused | P0 |
| D005 | Theme-derived adaptive tint | Predictable contrast | Not true pixel-level adaptation | P0 |
| D006 | Solid reduced-transparency fallback | Accessibility and performance | Less glass identity | P0 |
| D007 | High-contrast solid theme | Legibility | Aesthetic tradeoff | P0 |
| D008 | Subtle CSS noise/light texture | Adds material depth | Can add paint cost | P1 |
| D009 | Heavy glass-on-glass stacking | Apparent depth | Confusing hierarchy and GPU cost | Reject |
| D010 | Animated blur radius | “Liquid” reveal | Jank and repaint/composite cost | Reject |
| D011 | SVG displacement/refraction filters | More physical glass | Heavy GPU/browser inconsistency | P2 |
| D012 | Pointer-following dynamic shadows | Alive material | Paint/raster cost | P2 |
| D013 | Pixel color extraction from content | True adaptive tint | Privacy/perf/complexity | P2 |
| D014 | System/Inter-like typography with mono | Fast, readable | Font loading strategy needed | P0 |
| D015 | Inline SVG stroke icon system | Coherent, text-only friendly | Icon count management | P0 |

### 11.2 Desktop layout ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D016 | Floating Liquid Command Capsule | Strong entry point, OS identity | Uses vertical space | P0 |
| D017 | Collapsible Object Rail | Fast navigation | Can crowd canvas | P0 |
| D018 | Context Inspector | Makes relationships visible | Clutter if always open | P0 |
| D019 | Orbit Dock | Continuity and minimized objects | Can become noisy | P0 |
| D020 | Freeform window canvas | Real OS feel | Messy without snapping | P0 |
| D021 | Glass snap previews | Efficient tiling with feedback | Solver/preview complexity | P0 |
| D022 | Optional tiling mode | Power-user efficiency | Learning curve | P1 |
| D023 | Focus Lens | Meaningful depth/focus | Hides context | P0 |
| D024 | Object Trail breadcrumbs | Context and navigation | Space consumption | P0 |
| D025 | Workspace orbs | Fast context switching | Abstract without labels | P0 |
| D026 | macOS-style top menu bar | Familiar | Duplicates command capsule | P2 |
| D027 | Infinite spatial canvas | Innovative overview | Easy to get lost | P2 |
| D028 | Radial/orbital primary menu | Distinctive | Slower for common actions | Reject |
| D029 | Query widgets on desktop | Glanceable live data | Clutter | P1 |
| D030 | Same object in multiple windows | Consistency and comparison | Edit conflict handling | P0 |

### 11.3 Mobile and tablet ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D031 | Full-screen mobile card stack | Readable and thumb-friendly | Less desktop-like | P0 |
| D032 | Bottom Liquid Tab Capsule | One-handed navigation | Occupies bottom space | P0 |
| D033 | Center morphing Capture FAB | Fast capture | Accidental taps | P0 |
| D034 | Swipe between open cards | Quick switching | Scroll conflict | P0 |
| D035 | Global edge-swipe back | Native feel | Browser gesture conflict | P1 |
| D036 | Pull-down command palette | Gesture shortcut | Discoverability | P1 |
| D037 | Long-press context menu | Power without clutter | Hidden action | P0 |
| D038 | Bottom sheets | Thumb-friendly transient UI | Height/keyboard management | P0 |
| D039 | Haptic feedback | Tactile confirmation | Limited web support | P2 |
| D040 | Keyboard-aware composer | Mobile editing usability | Viewport complexity | P0 |
| D041 | Safe-area-aware chrome | Notch/home-bar safety | None significant | P0 |
| D042 | Tablet split cards | Hybrid productivity | Breakpoint tuning | P0 |
| D043 | Mobile query widgets | Glanceable status | Clutter | P1 |
| D044 | Shake to undo | Playful | Accidental and inaccessible | Reject |
| D045 | Floating mini-windows on phone | OS spectacle | Unusable touch targets | Reject |

### 11.4 Motion and transition ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D046 | Compositor-only transform/opacity motion | Smoothness | Limits effect choices | P0 |
| D047 | Interruptible springs | Responsive feel | Tuning complexity | P0 |
| D048 | FLIP layout transitions | Smooth structural changes | Measure cost | P0 |
| D049 | View Transitions shared elements | Native-like morphs | Support/edge cases | P0 |
| D050 | Short dock/capsule boot stagger | Delightful first paint | Can delay interaction | P0 |
| D051 | Window open scale/fade | Clear spatial entry | Generic if overused | P0 |
| D052 | Minimize morph to dock | Signature OS moment | Complex identity mapping | P0/P1 |
| D053 | Maximize FLIP | Smooth bounds change | Layout measurement | P0 |
| D054 | Direct drag ghost | Lowest latency | Manual state handling | P0 |
| D055 | Snap preview spring | Clear target feedback | Visual noise | P0 |
| D056 | Workspace slide/parallax | Context continuity | Motion sensitivity | P0 |
| D057 | Command capsule expand morph | Unified search identity | Snapshot complexity | P0 |
| D058 | Capture FAB-to-sheet morph | Fast mobile capture | Keyboard/layout edge cases | P0 |
| D059 | Capped search result stagger | Scannable results | Delay if too long | P0 |
| D060 | Live query FLIP reorder | Stable live views | Cost on large lists | P0 |
| D061 | Toast slide/fade | Non-blocking feedback | Can interrupt | P0 |
| D062 | Sync orb breathing only when pending | Meaningful status | Constant animation risk | P1 |
| D063 | Theme crossfade | Polished switching | Repaint cost | P0 |
| D064 | Skeleton opacity pulse | Calm loading | Shimmer can be paint-heavy | P0 |
| D065 | rAF-batched AI streaming | Smooth text append | Complexity | P1 |
| D066 | Error border pulse | Noticeable without shake | Color-only risk | P0 |
| D067 | Hover lift via transform only | Affordance without paint | Hover not on touch | P0 |
| D068 | Press depress scale | Tactile feedback | None significant | P0 |
| D069 | Scroll-edge fade for legibility | Helps glass chrome | Mask/perf cost | P1 |
| D070 | Ambient background parallax | Depth | Motion/perf cost | P2 |

### 11.5 Component ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D071 | Query Pills | Filters are visible/editable | Space usage | P0 |
| D072 | Draggable Object Chips | Composable linking | Drag complexity | P0 |
| D073 | Large-touch Splitters | Resizable panes | Visual thickness | P0 |
| D074 | Glass context menus | Fast actions | Contrast risk | P0 |
| D075 | Keyboard-accessible tooltips | Help without hover-only | Timing tuning | P0 |
| D076 | Version Diff pane | Trust and recovery | Width demand | P0/P1 |
| D077 | Time Scrubber | Tangible history | Complexity | P1 |
| D078 | Empty-state cards | Onboarding | Can feel marketing-like | P0 |
| D079 | Inline task checkbox morph | Delightful completion | None significant | P0 |
| D080 | Backlink hovercards | Context without navigation | Popover clutter | P0 |
| D081 | Grouped command results | Scannability | More UI states | P0 |
| D082 | Editable breadcrumb path | Power navigation | Confusion | P1 |
| D083 | Status integrated into dock/capsule | Less chrome | Hidden if collapsed | P0 |
| D084 | Modal focus trap | Accessibility | None significant | P0 |
| D085 | Lightweight drag ghost | Feedback without GPU cost | Less glassy | P0 |

### 11.6 Algorithm and performance ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D086 | Adaptive Quality Governor | Smoothness across devices | Tuning | P0 |
| D087 | Glass Budget Manager | Prevents GPU overload | Some surfaces demote | P0 |
| D088 | Motion Scheduler lanes | Predictable performance | Complexity | P0 |
| D089 | Window snap solver | Efficient multitasking | Edge cases | P0 |
| D090 | Gesture Intent Arbiter | Native mobile feel | Conflict tuning | P0 |
| D091 | Shared-Element Orchestrator | Continuity | Browser support | P0 |
| D092 | Incremental Live View Engine | Fast live queries | Dependency graph | P0 |
| D093 | Command palette ranking | Fast retrieval | Tuning | P0 |
| D094 | Virtualized block renderer | Large vault scale | Editor complexity | P0/P1 |
| D095 | Local outbox sync state | Trustworthy offline UI | Conflict UX | P0/P1 |
| D096 | Dev-only frame budget HUD | Debuggability | Not user-facing | P0 |
| D097 | Hover-intent prefetch | Faster opens | Wasted work | P1 |
| D098 | Offscreen animation pause | Battery/perf | Observer overhead | P0 |
| D099 | Worker-based search/index | Main-thread relief | Architecture complexity | P1 |
| D100 | Battery-aware quality | Mobile endurance | API availability | P1 |

### 11.7 Accessibility and inclusion ideas

| ID | Idea | Positive | Negative / risk | Decision |
|---|---|---|---|---|
| D101 | Reduced-motion fade-only mode | Motion sensitivity support | Less spatial flair | P0 |
| D102 | Reduced-transparency solid mode | Legibility and perf | Less glass identity | P0 |
| D103 | Keyboard window management | Power and accessibility | Shortcut discoverability | P0 |
| D104 | Screen-reader window announcements | Context awareness | Announcement noise | P0 |
| D105 | High-visibility focus rings on glass | Keyboard clarity | Aesthetic compromise | P0 |
| D106 | 44px minimum touch targets | Mobile usability | Lower density | P0 |
| D107 | 200% zoom reflow | Accessibility | Layout complexity | P0 |
| D108 | Color-blind-safe status icons | Redundant encoding | More icons | P0 |
| D109 | Skip-to-command/content links | Keyboard efficiency | None significant | P0 |
| D110 | Optional dyslexia-friendly font | Inclusion | Font loading | P2 |

### 11.8 Rejected spectacle ideas

| ID | Idea | Positive if any | Negative / reason to reject | Decision |
|---|---|---|---|---|
| D111 | Mandatory boot splash | Brand moment | Delays work | Reject |
| D112 | Cursor trails | Playful | Distraction and paint cost | Reject |
| D113 | Default sound effects | Feedback | Annoying/inaccessible defaults | Reject |
| D114 | 3D tilting windows | Spectacle | Nausea/perf cost | Reject |
| D115 | Autoplay ambient video | Richness | Binary/perf/text-only conflict | Reject |

---

## 12. Selected god-level design features

| # | Feature | Wow moment | Positives | Negatives / guardrails | Stage |
|---:|---|---|---|---|---|
| 1 | Adaptive Liquid Shell | Desktop windows and mobile cards feel like one OS | Coherent cross-device identity | Complex state mapping | P0 |
| 2 | Liquid Command Capsule | Search/capture/commands morph from one floating control | Fast, memorable entry point | Discoverability; keep menus | P0 |
| 3 | Orbit Dock + Workspace Orbs | Minimized windows become living dock chips | OS continuity | Clutter; cap chips | P0 |
| 4 | Pane Constellation | Dragging reveals glass snap zones | Efficient multitasking | Preview noise; show nearest only | P0 |
| 5 | Focus Lens | Active work stays clear while the world softly recedes | Meaningful depth | Hides context; user-triggered | P0 |
| 6 | Interruptible Spring Motion | Users can reverse/redirect animations mid-flight | Extreme responsiveness | Tuning complexity | P0 |
| 7 | Shared-Element Object Morphs | Row → window → card → sheet without identity loss | Context preservation | Fallbacks required | P0 |
| 8 | Adaptive Quality Governor | Rich on capable devices, smooth on weak ones | Performance equity | Visual tier changes | P0 |
| 9 | Glass Budget Manager | Glass stays premium without melting the GPU | Sustainable effects | Some surfaces become solid | P0 |
| 10 | Live Query FLIP | Smart views rearrange smoothly as data changes | Database feels alive | Large-list cost | P0 |
| 11 | Sync Orb + Time Scrubber | Save/sync/history become tangible | Trust through motion | Conflict complexity | P0/P1 |
| 12 | Thumb-first Capture FAB morph | Mobile capture feels instant and physical | Speed and delight | Keyboard/safe-area handling | P0 |

---

## 13. Extreme smoothness contract

### 13.1 Performance targets

These are design targets to validate, not guarantees.

| Metric | Target | Failure action |
|---|---:|---|
| Input visual acknowledgment | ≤50ms typical, ≤100ms max | Reduce work, optimistic UI |
| Drag/resize frame time | p95 ≤16.7ms at 60Hz | Downgrade quality |
| 120Hz-capable drag | p95 ≤8.3ms where feasible | Reduce glass/shadows |
| Command palette open | ≤150ms perceived | Preload index, simplify morph |
| Local search first result | ≤100ms typical | Worker/index optimization |
| Window open | ≤220ms perceived | Skeleton + progressive content |
| Workspace switch | ≤300ms perceived | Cache workspace state |
| Main-thread long tasks | <50ms; animation chunks <8ms | Split work, workers |
| Blurred viewport area | ≤35% desktop, ≤25% mobile | Demote glass |
| Large glass surfaces | ≤5 desktop, ≤3 mobile | Demote glass |
| List virtualization threshold | >100 rows | Virtualize |
| Offscreen animations | Paused | IntersectionObserver/visibility |

### 13.2 Smoothness do/don’t

| Do | Don’t |
|---|---|
| Animate transform/opacity | Animate width/height/top/left continuously |
| Use static blur | Animate blur radius |
| Bake shadows into pseudo-elements | Animate box-shadow |
| Use FLIP for layout changes | Relayout every frame during drag |
| Use direct manipulation for drag | Framework re-render per pointer move |
| Use temporary will-change | Leave will-change everywhere |
| Batch DOM reads/writes | Thrash layout |
| Virtualize large lists | Render 10,000 rows |
| Pause hidden/offscreen motion | Run ambient loops forever |
| Respect reduced motion | Force spatial animation |

### 13.3 Testing matrix

| Dimension | Cases |
|---|---|
| Browsers | Chrome, Edge, Safari, Firefox |
| OS | Windows, macOS, Linux, iOS, Android |
| Devices | Low-end Android, mid phone, flagship phone, laptop, 120Hz desktop |
| Input | Mouse, trackpad, touch, pen, keyboard-only |
| Accessibility | Reduced motion, reduced transparency, high contrast, screen reader, 200% zoom |
| Network | Online, offline, slow, reconnect, conflict |
| Scale | 100 objects, 10k objects, 100k objects, 8 windows, 500-row query |
| States | Empty, loading, error, conflict, sync pending, focus mode |

---

## 14. Accessibility specification

Target: WCAG 2.2 AA as a design goal.

### 14.1 Glass and contrast

- Body text must not depend on clear glass.
- Use scims/dimming behind glass controls when background contrast is uncertain.
- Regular glass for text-heavy controls.
- High-contrast theme uses solid surfaces and strong borders.
- Focus rings must remain visible over glass and ambient gradients.

### 14.2 Motion

- Respect `prefers-reduced-motion`.
- Reduced motion replaces slides/parallax/morphs with fade or instant.
- No autoplaying spatial loops except subtle status indicators, and those must be reducible.
- No shake animations for errors by default.

### 14.3 Keyboard

Core shortcuts:

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl+K` | Command palette |
| `Cmd/Ctrl+N` | Capture |
| `Cmd/Ctrl+S` | Save/acknowledge local state |
| `Cmd/Ctrl+W` | Close active window/card |
| `Cmd/Ctrl+Backtick` | Cycle windows |
| `Cmd/Ctrl+Alt+Arrow` | Snap window |
| `Esc` | Close transient surface |
| `Tab` | Move focus |
| `Enter/Space` | Activate |
| `Arrow keys` | Navigate lists/menus |

Requirements:

- visible focus order;
- focus trap in modals/sheets;
- return focus on close;
- skip links;
- keyboard equivalents for drag/snap/gestures.

### 14.4 Screen readers

- Windows/cards are labeled regions or dialogs depending on behavior.
- Announce object open/close once.
- Do not announce every animation frame.
- Live regions for sync/save/conflict status.
- Provide a linear reading mode for documents.
- Avoid making the whole app a single `role="application"` unless carefully justified.

### 14.5 Touch

- Minimum target: 44×44px.
- Bottom capsule respects safe areas.
- Gestures have visible alternatives.
- Drag handles are larger than visual handles.
- Keyboard visibility must not cover primary actions.

---

## 15. Risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Glass performance | Blur can destroy smoothness | Glass budget, static blur, quality governor |
| Motion sickness | Parallax/morphs can discomfort users | Reduced motion, short durations, user control |
| Mobile gesture conflicts | Scroll/swipe/drag can fight | Gesture arbiter, touch-action rules, visible alternatives |
| OS metaphor confusion | Users may not understand windows/workspaces | Familiar labels, onboarding, simple defaults |
| Text-only aesthetic limits | No images may feel plain | Procedural light fields, typography, material, motion |
| Browser support gaps | View Transitions/backdrop-filter vary | Feature detection, FLIP/solid fallbacks |
| Scope creep | Design can become infinite | P0/P1/P2 ledger and vertical slice |
| Accessibility debt | Glass/motion can exclude users | Contrast, keyboard, SR, reduced modes from day one |
| Over-animation | Delight becomes delay | Interruptible, capped, input-first motion |
| State complexity | Desktop/mobile mapping is hard | Canonical object/window/workspace state model |

---

## 16. Design validation plan

Before full implementation, validate with wireframes, motion prototypes, and a narrow interactive slice.

### 16.1 Prototype tasks

Recruit roughly 12 users across desktop and mobile.

Tasks:

1. Open a note from dock/list and snap it beside a query.
2. Capture text on mobile in under 10 seconds.
3. Switch workspaces and resume context.
4. Minimize and restore a window.
5. Use command palette to find an object.
6. Enable reduced motion and confirm usability.
7. Use keyboard only to open, snap, and close a window.
8. Read a long document on mobile without gesture conflicts.

### 16.2 Success signals

Directional targets:

- 80%+ complete core tasks without help.
- Users describe motion as “smooth” or “responsive,” not “busy.”
- No task blocked by animation.
- Mobile capture feels faster than opening a normal notes app.
- Glass remains legible in light/dark/high-contrast tests.
- Frame health stays within budget on mid-range devices.
- Reduced-motion mode feels complete, not broken.

### 16.3 Kill/pivot criteria

- If glass causes sustained frame drops on mid devices, default to Lite quality.
- If users miss the command capsule, add persistent visible search affordance.
- If mobile swipes conflict with scrolling, restrict swipe zones further.
- If morphs confuse object identity, simplify to fade/slide.
- If focus lens hides needed context, make it opt-in and less aggressive.

---

## 17. Open design questions

1. Default theme: Aurora Light, Obsidian Dark, or follow system? Recommendation: follow system.
2. Accent color: blue/violet “aurora” or more neutral graphite? Recommendation: blue/violet accents, restrained.
3. Density: comfortable vs compact? Recommendation: comfortable default, compact option later.
4. Sound: optional subtle UI sounds? Recommendation: off by default, P2 if ever.
5. AI visual identity: separate accent/orb or integrated into command capsule? Recommendation: integrated, no separate mascot.
6. Mobile navigation labels: Today/Search/Capture/Spaces/Inbox vs simpler Home/Search/Add/Projects/Inbox? Recommendation: Today/Search/Capture/Spaces/Inbox.
7. Glass intensity default: Standard or Lite on mobile? Recommendation: Auto with mobile bias toward Lite.

---

## 18. Recommended next design step

Do not build the full app yet.

Next design deliverables:

1. **Design tokens file**: color, material, motion, spacing, radius, typography.
2. **Wireframes**: desktop shell, mobile shell, window/card/sheet states.
3. **Motion prototypes**: command capsule morph, window minimize, capture FAB, workspace switch, live query FLIP.
4. **Algorithm spike specs**: quality governor, glass budget, gesture arbiter, snap solver.
5. **Accessibility checklist**: contrast, keyboard, screen reader, reduced motion/transparency.
6. **First vertical design slice**:

```text
Dock chip → window → snap beside query → minimize → mobile card → capture sheet
```

If that slice feels liquid, smooth, and coherent, expand the design system. If not, reduce glass/motion before adding more features.

---

## Sources

- [1](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) Apple Newsroom, “Apple introduces a delightful and elegant new software design,” June 2025.
- [2](https://developer.apple.com/design/human-interface-guidelines/materials) Apple Human Interface Guidelines, “Materials.”
- [3](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) MDN, `backdrop-filter`.
- [4](https://web.dev/articles/animations-guide) web.dev, “How to create high-performance CSS animations.”
- [5](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) MDN, “View Transition API.”
