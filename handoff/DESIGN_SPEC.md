# Fernwood — Design Spec

Calm, structured maintenance tracking for small property managers. Northwest forest palette, editorial typography, paper-and-ink restraint. No purple/indigo, no gradients, no glassmorphism, no generic SaaS look.

---

## 1. Color tokens

All colors live in `tokens.css` as CSS custom properties on `:root`. Components reference semantic tokens, never raw hex.

### Brand palette

| Token            | Value     | Used for                                       |
| ---------------- | --------- | ---------------------------------------------- |
| `--forest`       | `#162c21` | Sidebar background                             |
| `--fern`         | `#4a7c59` | Primary action, "due soon" accents, active dot |
| `--moss`         | `#8ba888` | Muted/older timeline dots, "later" muted tone  |
| `--bark`         | `#2d241e` | Foreground text                                |
| `--paper`        | `#fdfcf8` | App background                                 |
| `--paper-dark`   | `#f5f2e9` | Tiles, detail pane bg, chips, selected row     |
| `--rust`         | `#8a3324` | Overdue accent, danger text                    |

### Semantic mapping (also in `tokens.css`)

| Semantic                  | Resolves to                                       |
| ------------------------- | ------------------------------------------------- |
| `--bg`                    | `--paper`                                         |
| `--fg`                    | `--bark`                                          |
| `--surface-card`          | `#ffffff`                                         |
| `--surface-muted`         | `--paper-dark`                                    |
| `--surface-sidebar`       | `--forest`                                        |
| `--fg-on-sidebar`         | `--paper`                                         |
| `--fg-muted`              | `color-mix(in srgb, var(--bark) 55%, transparent)`|
| `--border-hairline`       | `color-mix(in srgb, var(--bark) 5%, transparent)` |
| `--ring-soft`             | `color-mix(in srgb, black 4%, transparent)`       |
| `--ring-strong`           | `color-mix(in srgb, var(--bark) 25%, transparent)`|
| `--accent-primary`        | `--fern`                                          |
| `--accent-danger`         | `--rust`                                          |

### Status colors

| Status      | Accent    | Where it appears                              |
| ----------- | --------- | --------------------------------------------- |
| `overdue`   | `--rust`  | 4px left border, dot, rust-tinted chip, text  |
| `due-soon`  | `--fern`  | 4px left border, dot, "Due soon" label        |
| `later`     | `--bark/10` | 4px left border, slight opacity drop (0.9)  |

---

## 2. Typography

Two families, loaded once at the app root.

| Role        | Family    | Weights      | Notes                                       |
| ----------- | --------- | ------------ | ------------------------------------------- |
| Display     | Urbanist  | 500–700      | All `h1`–`h6`, KPI numbers, brand wordmark  |
| Body        | Epilogue  | 300–600      | Default body, controls, secondary text      |

Tracking: display headings use `letter-spacing: -0.01em`. Body default tracking.

### Section labels (key recurring style)

10px / 600 / uppercase / `letter-spacing: 0.2em` / color `bark @ 40–45% opacity`.
Used above every grouped list, above metadata blocks ("Schedule", "Next due", "Event history"), and in the sidebar Properties header.

Class: `.section-label`.

### Type scale (typical)

| Use                                  | Size / weight / family       |
| ------------------------------------ | ---------------------------- |
| Page H2                              | 24–30px / 600 / Urbanist     |
| Detail-pane task title (H2)          | 24px / 600 / Urbanist        |
| Section subhead                      | 10px / 600 / Urbanist upcase |
| Task row title                       | 14px / 500 / Epilogue        |
| Body / meta                          | 13–14px / 400 / Epilogue     |
| Row meta (property, last-done)       | 12px / 400 / Epilogue, muted |
| Due chip / status pill               | 10px / 500 / Epilogue        |
| KPI value                            | 24px / 500 / Urbanist        |

Italic is reserved for **user-authored notes only** (`"Tenant reported drip"`). Never italicize UI labels.

---

## 3. Spacing

4px base grid. Common rhythms:

| Token              | Value | Used for                                  |
| ------------------ | ----- | ----------------------------------------- |
| `--space-1`        | 4px   | Tight inline gaps                         |
| `--space-2`        | 8px   | Row content gap, chip padding-y           |
| `--space-3`        | 12px  | Default control padding                   |
| `--space-4`        | 16px  | Card padding, tile padding                |
| `--space-5`        | 20px  | Sidebar h-padding                         |
| `--space-6`        | 24px  | Sidebar top padding                       |
| `--space-7`        | 28px  | Detail-pane vertical rhythm               |
| `--space-8`        | 32px  | Detail-pane outer padding, section gaps   |
| `--space-10`       | 40px  | Between major content sections            |

Page content uses `max-width: 56rem (896px)` with 20px → 32px horizontal padding (mobile → desktop) and ~40px vertical padding.

---

## 4. Border, radius, shadow

**Radius:**

| Token         | Value  | Used for                              |
| ------------- | ------ | ------------------------------------- |
| `--radius-sm` | 4px    | Chips, dots wrapper                   |
| `--radius-md` | 6px    | Buttons, task rows, nav items         |
| `--radius-lg` | 8px    | Summary tiles                         |
| `--radius-xl` | 12px   | (Reserved)                            |

**Borders & rings:**

- Default separator: **1px hairline** at `color-mix(black 5–10%)`. Never solid black borders.
- Task row idle: `ring: 1px black/4%`.
- Task row hover: `ring: 1px black/10%` + tiny shadow.
- Task row selected: `ring: 1px var(--ring-strong)` + `bg: var(--paper-dark)` + tiny shadow.
- Status border: **4px solid** on the row's left edge, color = status accent.
- Detail-pane separator: 1px `bark/5%`.

**Shadow:**

Only one tier: `0 1px 2px 0 rgb(0 0 0 / 0.05)`. No layered drops, no glow, no neumorphism.

---

## 5. Responsive behavior

Three breakpoints:

| Name    | Min width | Layout                                                                 |
| ------- | --------- | ---------------------------------------------------------------------- |
| Mobile  | 0         | Single column. Sidebar collapses into top bar with property `<select>`. Detail opens as full-width slide-over sheet. |
| Tablet  | 768px     | Sidebar appears (256px). Main content fills remainder. Detail still slide-over. |
| Desktop | 1024px    | Three panes: sidebar (256px) + list (fluid, max-w 896px content) + detail pane (384px, fixed). Detail is inline, not a sheet. |

**Auto-selection rule:** on desktop, when the list loads or the property filter changes, the most urgent task (earliest `nextDueAt`) is auto-opened in the detail pane. If the user already has a task open within the filtered set, keep it.

---

## 6. Pane widths and layout ratios

Desktop layout, left → right:

```text
┌────────────┬───────────────────────────────┬──────────────┐
│  Sidebar   │   List pane                   │  Detail pane │
│   256px    │   fluid, content max 896px    │    384px     │
│  forest    │   paper                       │  paper-dark  │
└────────────┴───────────────────────────────┴──────────────┘
```

- Sidebar: `width: 16rem (256px)`, full height, `background: var(--forest)`.
- List pane: flex-1, scrolls vertically, inner content centered in `max-w 56rem`.
- Detail pane: `width: 24rem (384px)`, `background: var(--paper-dark)`, left border 1px `bark/5%`, scrolls independently. Only shown at `lg+`.

Summary tiles inside the list pane: 4-up grid at `md+`, 2-up below.

---

## 7. Interaction states

### Task row
- **Idle:** white card, hairline ring, 4px status border-left, subtle status accent.
- **Hover:** ring darkens to `black/10%`, soft shadow appears.
- **Selected (open in detail):** background switches to `paper-dark`, ring becomes `bark/25%`, soft shadow.
- **Cursor:** pointer. Whole row is the click target.

### Primary button (`Add task`, `Mark complete`)
- Fill: `var(--fern)`, text: `var(--paper)`, 1px ring `fern/80%`, radius 6px.
- Hover: `fern @ 90%`.

### Secondary button (header `Add task`, edit icon)
- Fill: `var(--surface-card)`, text: `var(--bark)`, hairline ring.
- Hover: ring darkens.

### Sidebar nav item
- Idle: `text @ 55% opacity`.
- Hover: `bg: white/5%`, text full opacity.
- Active: same as hover (subtle, no underline).

### Due chip
- Neutral & soon: `bg: paper-dark`, `text: bark @ 50–70%`, hairline ring.
- Overdue: `bg: rust @ 8%`, `text: rust`, ring `rust @ 15%`.

### Timeline (Event history)
- Vertical 1px rail in `moss/30%` along the left.
- Each event marker: 12px circle, `bg: paper-dark`, 2px ring. Newest event ring = `fern`; older = `moss/40%`.
- Each event entry is a button — hover background `bark/5%`.
- User notes render italic.

### Detail pane close button
- Top-right, 32px hit area, ghost. Icon `bark @ 40%`, hover `bark @ 100%` with `bark/5%` bg.

---

## 8. Modal / sheet pattern

All editing surfaces (Add task, Edit task, Edit event, Complete task) are **right-aligned slide-over sheets**, full-width on mobile, ~512px on `sm+`. Background `var(--paper-dark)`, hairline left border. Header includes a tight close affordance. The sheet primitive is provided in `components/SheetModal.tsx` — use it for any new editing surface.

Rules:
- One primary fern-filled action per sheet, always bottom or top-right.
- Secondary actions are ghost / icon-only.
- Do not stack modals. Close one before opening another.

---

## 9. Do / Don't checklist for Codex

- [x] Define 7 brand tokens as CSS variables on `:root`.
- [x] Map them into semantic tokens (`--bg`, `--fg`, `--surface-card`, …).
- [x] Load Urbanist + Epilogue. Never default to Inter/Poppins.
- [x] Build a `.section-label` utility for 10px uppercase tracked labels.
- [x] Three-pane desktop, two-pane tablet, single-pane mobile.
- [x] Status drives color: 4px left border on rows, dot+label in detail.
- [x] Hairline rings (1px black @ 5–10%) instead of heavy shadows.
- [x] Italics only for user notes.
- [x] One primary fern action per surface.
- [x] Auto-select most urgent task on desktop when list loads or filter changes.
- [ ] **No** purple/indigo, gradients, glassmorphism, or generic SaaS hero.
- [ ] **No** raw hex values in components — always go through tokens.
- [ ] **No** default sans-serif fallbacks visible in the rendered page.
