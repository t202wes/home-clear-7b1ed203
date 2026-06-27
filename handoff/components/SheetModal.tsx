import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Right-aligned slide-over sheet. Background paper-dark, hairline left border.
 * Use for all editing surfaces (Add task, Edit task, Edit event, Complete task).
 */
export function SheetModal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className="sheet">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)" }}>
          {title && (
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
              {title}
            </h2>
          )}
          <button type="button" onClick={onClose} className="btn--close" aria-label="Close" style={{ marginLeft: "auto" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "0 var(--space-6) var(--space-6)" }}>
          {children}
        </div>
      </div>
    </>
  );
}
