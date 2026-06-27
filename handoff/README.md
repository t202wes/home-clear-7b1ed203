# Fernwood UI Handoff

Frontend-only export of the Fernwood maintenance UI. No backend, no app logic — just the visual layer with mock data so the screen renders identically in any React 18/19 project.

## Contents

```
handoff/
  README.md
  DESIGN_SPEC.md         ← full visual spec (tokens, type, spacing, behavior)
  tokens.css             ← single CSS file with ALL design tokens + base styles + component classes
  ReferencePage.tsx      ← drop-in page that renders the exact "All tasks" screen
  components/
    AppShell.tsx         ← outer layout (sidebar + main + detail pane)
    Sidebar.tsx          ← left forest-colored nav with properties + Add task
    TaskListPane.tsx     ← header, summary tiles, grouped lists (Overdue / Due soon / Later)
    TaskRow.tsx          ← single task card with left status border + due chip
    SummaryTiles.tsx     ← 4-up KPI tiles (Open / Overdue / Due / Done)
    TaskDetailPane.tsx   ← right-hand detail panel with timeline + actions
    SheetModal.tsx       ← right-aligned slide-over sheet primitive (for Add/Edit)
  lib/
    mockData.ts          ← properties, tasks, events fixtures
    format.ts            ← relativeDue / formatDate helpers
    cn.ts                ← classnames helper
```

## Install

Only three runtime deps are needed:

```bash
npm i react react-dom date-fns lucide-react clsx
```

## Use

1. Drop `handoff/` into your project (anywhere, e.g. `src/fernwood-ui/`).
2. Import the token sheet **once** at your app root:
   ```ts
   import "./fernwood-ui/tokens.css";
   ```
3. Load the two web fonts in your `<head>` (Google Fonts CDN, or @fontsource):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700&family=Epilogue:wght@300;400;500;600&display=swap" rel="stylesheet" />
   ```
4. Render the reference page to verify pixel-fidelity:
   ```tsx
   import ReferencePage from "./fernwood-ui/ReferencePage";
   export default function App() { return <ReferencePage />; }
   ```

## Design language

Read `DESIGN_SPEC.md` first. Everything else is implementation of those rules. Do not hardcode hex values, font names, or pixel sizes inside components — use the tokens and the semantic class names in `tokens.css`.
