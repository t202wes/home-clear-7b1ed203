# Fernwood — Design Spec

A handoff document describing the design aesthetic, layout patterns, and component behavior of the Fernwood maintenance app. Intent: another agent (e.g. Codex) can recreate the same look-and-feel in a different codebase.

---

## 1. Product Concept

Fernwood is a maintenance-tracking app for property owners. The aesthetic is **"Northwest forest"** — warm cream paper, fern green, mossy mid-tones, deep bark for text, rust for danger. Editorial, calm, slightly tactile. Not a generic SaaS dashboard, not a flashy gradient app.

Think: a moleskine notebook a caretaker keeps in the cabin.

---

## 2. Visual Language

### 2.1 Color tokens (semantic, all in CSS variables)

```
--forest:     #162c21   /* deep sidebar bg */
--fern:       #4a7c59   /* primary CTA, accent */
--moss:       #8ba888   /* secondary green, dot accents */
--bark:       #2d241e   /* primary text */
--paper:      #fdfcf8   /* page background */
--paper-dark: #f5f2e9   /* subtle surface, hover, selected */
--rust:       #8a3324   /* destructive / overdue */
--card:       #ffffff   /* card surfaces */
```

**Rules:**
- Never hardcode hex or `text-white`/`bg-black` in components. Always reference tokens.
- Text opacity uses `text-bark/40`, `text-bark/55`, `text-bark/70` style alpha — not gray scales.
- Borders are bark at 5–10% alpha (`ring-1 ring-black/5` is the common idiom).
- Status colors: overdue = rust, due-soon = fern, later = bark/moss.

### 2.2 Typography

- **Display / headings:** Urbanist (600–700), tracking `-0.01em`.
- **Body:** Epilogue (300–600).
- **Section labels:** 10px, uppercase, `tracking-[0.2em]`, weight 600, color `bark/40`. Used everywhere as the "eyebrow" above headers and groups.

Type scale in practice:
- Page title: `text-2xl md:text-3xl` semibold display
- Detail pane title: `text-2xl` semibold display, balanced
- Section label: 10px uppercase wide-tracked
- Body: 14px (`text-sm`)
- Meta / chips: 10–11px

### 2.3 Shape, depth, motion

- Radius: 6–8px (`rounded-md`). Never pill-rounded except for tiny dot indicators.
- Depth: hairline rings (`ring-1 ring-black/5`) and an occasional `shadow-sm` on selected/hover. No heavy drop shadows, no glassmorphism, no gradients.
- Selected state: swap background to `paper-dark` and ring to `ring-bark/25`.
- Status accents on rows: a **4px left border** in the status color (`border-l-4 border-rust/60`).
- Animation: gentle. Sheet slides from right, fade transitions on hover. No spring bounce, no parallax.

---

## 3. Layout

### 3.1 Three-pane desktop shell

```
┌──────────────┬─────────────────────────┬────────────────────────┐
│  Sidebar     │  List pane              │  Detail pane           │
│  (forest)    │  (paper)                │  (card / paper-dark)   │
│              │                         │                        │
│  Properties  │  Header + summary tiles │  Selected task         │
│  nav         │  Grouped task rows      │  Meta grid + history   │
│              │                         │                        │
└──────────────┴─────────────────────────┴────────────────────────┘
```

- **Sidebar:** dark forest background, paper-colored text. Lists properties as nav, "All properties" first. Active item = white-at-6% overlay.
- **List pane:** max-width ~`max-w-4xl`, generous padding (`px-5 md:px-8 py-8`). Page title, optional Add button top-right, 4-up summary tiles, then three sections: Overdue / Due soon / Later.
- **Detail pane:** auto-opens with the most-urgent task on desktop. On mobile collapses into a bottom sheet.

### 3.2 Slide-over sheets (right edge)

All editing happens in right-side sheets that hover over the detail pane:
- **Add Task**, **Edit Task**, **Edit Event**, **Complete Task** dialog.
- Width ~`max-w-md`, paper background, hairline left border, single column form.
- Triggered by buttons in detail pane / list header. Close on X, backdrop click, or Esc.

### 3.3 Mobile

- Sidebar becomes a drawer.
- List pane is full width.
- Tapping a task opens the detail content in a full-height sheet from the bottom (same content component, different shell).

---

## 4. Core Components

### 4.1 TaskRow

A clickable card row.

- Layout: `flex items-center gap-3`, `pl-4 pr-3 py-3`, white card, `rounded-md`, hairline ring, **left border 4px in status color**.
- Selected: `ring-bark/25 shadow-sm bg-paper-dark`.
- Content: title (`text-sm font-medium`), meta line below in `text-xs text-muted-foreground` with dot separators (`size-1 rounded-full bg-bark/15`):
  - property name (hidden when filtered)
  - due chip
  - recurrence label (hidden on small screens)
  - "Last: <date>" (hidden on small screens)
- Due chip: rounded `text-[10px]` ring chip; rust tint for overdue, neutral for soon/later.

### 4.2 SummaryTiles

Four tiles in a 2×2 / 4-up grid. Each: tiny uppercase label on top, large value below. Tone variants (neutral / danger / primary / muted) recolor only the value. Hairline ring, paper-dark background.

### 4.3 TaskDetailContent

The right pane (and mobile sheet) body.

- Close X top-right (absolute, subtle).
- Eyebrow row: colored dot + status label ("Overdue" / "Due soon" / "Active task").
- Title: 2xl display, balanced.
- Subtitle: property name · detail.
- **Meta grid:** 3 columns — Schedule / Next due / Last done. Each is a `<Meta>` block: tiny uppercase label, value in `text-sm font-medium`. Overdue tone turns the value rust. Bordered bottom with `border-bark/5`.
- Optional italic notes quote.
- **Action row:** primary "Mark complete" (fern, fills width) + icon-only Edit button (`size-10`, card bg, hairline ring). Only one edit button — it covers both editing and rescheduling.
- **Event history:** sectioned with a vertical timeline rail on the left (`absolute left-4 w-px bg-moss/30`). Each event is a clickable button (opens Edit Event sheet) with: colored ring dot, "Completed by <name>", date, optional italic note. Most recent dot uses fern ring; older use moss/40.

### 4.4 Sheets (Add/Edit Task, Edit Event)

- Right-aligned, narrow, paper background.
- Header: section label + close X.
- Body: standard labeled fields (title, property select, recurrence, next due date, notes). Inputs are flat with hairline ring, no heavy shadows.
- Footer: primary action (fern) + ghost Cancel.
- Edit Event additionally has a destructive "Delete" link in muted rust.

### 4.5 CompleteTaskDialog

Centered modal. Date picker, optional "by" name, optional note, primary Complete button.

---

## 5. Interaction Rules

- Clicking a task row selects it and renders the detail pane (desktop) or opens the bottom sheet (mobile).
- Clicking an event in the history opens the Edit Event sheet over the detail pane.
- Editing a task opens the Edit Task sheet over the detail pane.
- Property filter (sidebar) updates the list immediately; if the current selection no longer matches, auto-select the most urgent task in the new filter.
- Completing a task: recurring → bumps `nextDueAt` by `everyDays`; one-off → stays (history grows).
- Status derivation from `nextDueAt`:
  - `diffDays < 0` → overdue
  - `diffDays <= 7` → due-soon
  - else → later

---

## 6. Data Model (reference shape)

```ts
type Property = { id; name; detail? }

type Recurrence =
  | { kind: "once" }
  | { kind: "recurring"; everyDays: number; label: string }

type Task = {
  id; title; propertyId;
  recurrence: Recurrence;
  nextDueAt: ISOString;
  createdAt: ISOString;
  notes?: string;
}

type MaintenanceEvent = {
  id; taskId;
  completedAt: ISOString;
  by?: string;
  note?: string;
}
```

Store is a single client store (zustand in the source). For a backend port, mirror the same operations: `addTask`, `updateTask`, `completeTask`, `updateEvent`, `deleteEvent`.

---

## 7. Pages

1. **/** — All tasks, grouped Overdue / Due soon / Later, with summary tiles. Auto-opens detail pane.
2. **/history** — Chronological log of completed events, grouped by month. Read-only. Row click jumps back to the task's detail pane on `/`.

---

## 8. Recreating the Aesthetic — Checklist for Codex

When implementing this in another stack:

- [ ] Define the 7 brand color tokens as CSS variables; map them into semantic tokens (background, foreground, primary, etc.).
- [ ] Load Urbanist (display) + Epilogue (body) web fonts.
- [ ] Build the "section label" utility: 10px / uppercase / 0.2em tracking / bark@40%.
- [ ] Three-pane desktop layout, two-pane tablet, single-pane mobile with bottom sheet for detail.
- [ ] Status drives color: rust = overdue, fern = soon, moss/bark = later. Apply via 4px left border on rows and dot+label in detail.
- [ ] All editing in right-side slide-over sheets, not inline and not full-page navigations.
- [ ] Hairline rings (`1px black at 5–10% alpha`) instead of borders or shadows for separation.
- [ ] Italics for user-authored notes; never for UI chrome.
- [ ] One primary action per surface (fern fill). Secondary actions are icon-only or ghost.
- [ ] Auto-select the most urgent task when the list loads or the filter changes.
- [ ] No purple/indigo, no gradients, no glassmorphism, no default Inter/Poppins, no generic SaaS look.

---

## 9. What NOT to Do

- Don't add a top horizontal nav bar — navigation lives in the left sidebar only.
- Don't use card shadows beyond `shadow-sm`.
- Don't introduce additional accent hues (no blue links, no yellow warnings). Use the 7 brand colors.
- Don't split "Edit" and "Reschedule" into separate buttons — one Edit covers both.
- Don't make the detail pane a separate route. It's a persistent pane that reflects selection state.
