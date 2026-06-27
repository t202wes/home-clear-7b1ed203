# Copilot Money–inspired Fernwood (Mobile-first)

Goal: give Fernwood the snappy, native-feel interaction model of Copilot Money — gesture-driven rows, rich filter pills, and a smart bottom-sheet detail/edit experience — starting on mobile, then porting the same patterns up to desktop.

## What "Copilot-like" means here

- Every screen feels like one continuous, physical surface — no full-page reloads, everything resolves in sheets, drawers, and inline edits.
- Rows respond to touch: swipe to complete/snooze/delete, long-press for quick actions, tap to open a detail sheet that slides up from the bottom.
- Filters live as a horizontally-scrollable rail of pills (property, status, assignee, due) that you tap to toggle; the list re-sorts with a smooth transition.
- Editing happens *in place* — tapping a field in the detail sheet flips it into an editor without leaving the sheet.
- Subtle motion everywhere: spring transitions, soft haptic-style scale on tap, list reorder animations, sheet snap points.

## Phase 1 — Mobile interaction model

**1. Bottom-sheet task detail**
- Replace the current full-screen detail pane on mobile with a bottom sheet using `vaul` (Drawer) with two snap points: ~55% (peek) and ~92% (full).
- Sheet contents: title (inline-editable), status chip, property, assignee, due date, description, attachments, activity. Tap any field → it expands inline into the appropriate control (text input, date picker, segmented control, select).
- Drag handle at top, swipe-down to dismiss, backdrop fades.

**2. Swipeable task rows**
- Left swipe → reveal Complete (green) + Snooze (amber) actions.
- Right swipe → reveal Delete (red) with confirm-on-release threshold.
- Long-press → contextual menu (Assign, Move, Duplicate, Share).
- Implement with `framer-motion` drag + `useAnimation`, or `react-swipeable-list`.

**3. Filter / property pills rail**
- Horizontal scrollable row above the task list: `All • To do • In progress • Done` + property chips + assignee avatars.
- Active pill = filled with primary token; inactive = outlined. Tap toggles; list animates reorder via `framer-motion` `<AnimatePresence>` + `layout`.
- Sticky under the header on scroll.

**4. Inline quick-add**
- Persistent "+ Add task" input pinned above the keyboard at the bottom of the list (Copilot's "add transaction" pattern). Type, hit return, row springs into the list at the top with a subtle highlight.

**5. Pull-to-refresh + skeleton states**
- Native-feel pull gesture at top of list re-fetches.
- Use shimmer rows during load (already have AI shimmer pattern available).

**6. Micro-motion polish**
- Tap scale: rows compress to 0.98 on press.
- Status changes animate the row's left accent bar color.
- Summary tiles count up with a spring when their value changes.

## Phase 2 — Desktop port

- Keep three-pane layout but adopt the same primitives: pill rail replaces dropdown filters, detail pane gains the same inline-edit fields, row hover reveals the same quick actions that mobile shows on swipe.
- Add a global ⌘K command palette for the keyboard equivalent of mobile gestures.

## Technical notes

- Libraries to add: `vaul` (bottom sheet), `framer-motion` (already friendly with the stack) for drag/spring/layout animations. No new state library needed — extend the existing zustand store.
- New components:
  - `TaskSheet.tsx` — bottom-sheet detail/editor
  - `SwipeableTaskRow.tsx` — wraps `TaskRow` with gesture layer
  - `FilterPillRail.tsx` — scrollable pill row
  - `QuickAddBar.tsx` — pinned composer
- Tokens: add `--accent-success`, `--accent-warning`, `--accent-danger` and motion tokens (`--ease-spring`, `--dur-fast`, `--dur-base`) to `src/styles.css`; reuse across web + handoff bundle.
- Keep the handoff/ bundle in sync — mirror new components and update `DESIGN_SPEC.md` interaction section.

## Suggested build order

1. Tokens + motion primitives.
2. `FilterPillRail` + reorder animations on the list.
3. `SwipeableTaskRow` with complete / snooze / delete.
4. `TaskSheet` (bottom sheet) with inline-edit fields, replacing mobile detail pane.
5. `QuickAddBar` + pull-to-refresh.
6. Polish pass: tap scale, summary tile count-ups, status accent transitions.
7. Desktop port + ⌘K.

Want me to start at step 1 and work down, or jump straight to the bottom-sheet detail (highest visual impact)?
