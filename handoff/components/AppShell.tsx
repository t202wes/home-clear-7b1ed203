import type { ReactNode } from "react";

type Props = {
  sidebar: ReactNode;
  detail?: ReactNode;
  children: ReactNode;
};

/**
 * Three-pane shell:
 *   [ sidebar ] [ main content (scrolls) ] [ detail pane (desktop only) ]
 *
 * Sidebar collapses below md (768px). Detail pane only shows at lg+ (1024px).
 */
export function AppShell({ sidebar, detail, children }: Props) {
  return (
    <div className="app-shell">
      {sidebar}
      <div className="app-shell__body">
        <main className="app-shell__main">
          <div className="app-shell__content">{children}</div>
          {detail}
        </main>
      </div>
    </div>
  );
}
