import { useState } from "react";
import { useStore, eventsForTask, lastCompleted, taskStatus } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { relativeDue, formatDate, formatDateLong } from "@/lib/format";
import { Check, X, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskDetailContent({
  taskId,
  onClose,
  className,
}: {
  taskId: string | null;
  onClose: () => void;
  className?: string;
}) {
  const openCompleteFor = useUIStore((s) => s.openCompleteFor);
  const openEditEvent = useUIStore((s) => s.openEditEvent);
  const updateTask = useStore((s) => s.updateTask);
  const tasks = useStore((s) => s.tasks);
  const properties = useStore((s) => s.properties);
  const allEvents = useStore((s) => s.events);

  const task = taskId ? tasks.find((t) => t.id === taskId) : undefined;
  const property = task ? properties.find((p) => p.id === task.propertyId) : undefined;
  const events = task ? eventsForTask(allEvents, task.id) : [];
  const last = task ? lastCompleted(allEvents, task.id) : undefined;

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(task?.notes ?? "");

  if (!task) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center px-8 text-center text-bark/40", className)}>
        <ListChecks className="size-8 mb-3 opacity-20" />
        <p className="text-sm font-medium">Select a task to view details</p>
      </div>
    );
  }

  const status = taskStatus(task);
  const due = relativeDue(task.nextDueAt);

  const startEditingNotes = () => {
    setDraftNotes(task.notes ?? "");
    setIsEditingNotes(true);
  };

  const saveNotes = () => {
    const trimmed = draftNotes.trim();
    updateTask(task.id, { notes: trimmed || undefined });
    setIsEditingNotes(false);
  };

  const cancelEditingNotes = () => {
    setDraftNotes(task.notes ?? "");
    setIsEditingNotes(false);
  };

  return (
    <div className={cn("relative p-8 h-full", className)}>
      <button
        onClick={onClose}
        className="absolute right-5 top-5 size-8 grid place-items-center rounded-md text-bark/40 hover:text-bark hover:bg-bark/5"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>

      <div className="mb-7">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
          <span
            className={cn(
              "size-2 rounded-full",
              status === "overdue" ? "bg-rust" : status === "due-soon" ? "bg-fern" : "bg-moss",
            )}
          />
          <span className={status === "overdue" ? "text-rust" : "text-fern"}>
            {status === "overdue" ? "Overdue" : status === "due-soon" ? "Due soon" : "Active task"}
          </span>
        </div>
        <div
          onClick={startEditingNotes}
          className="cursor-text group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startEditingNotes();
            }
          }}
        >
          <h2 className="font-display font-semibold text-2xl leading-tight text-balance group-hover:text-bark/80 transition-colors">
            {task.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {property?.name}
            {property?.detail ? ` · ${property.detail}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7 pb-6 border-b border-bark/5">
        <Meta
          label="Schedule"
          value={task.recurrence.kind === "recurring" ? task.recurrence.label : "One-off"}
          onClick={startEditingNotes}
        />
        <Meta
          label="Next due"
          value={due.text}
          tone={due.tone === "overdue" ? "danger" : undefined}
          onClick={startEditingNotes}
        />
        <Meta label="Last done" value={last ? formatDate(last.completedAt) : "—"} />
      </div>

      {isEditingNotes ? (
        <textarea
          autoFocus
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          onBlur={saveNotes}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              cancelEditingNotes();
            } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              saveNotes();
            }
          }}
          placeholder="Add a description for this task..."
          rows={4}
          className="w-full bg-card rounded-md px-3 py-2 text-sm text-bark/70 leading-relaxed italic ring-1 ring-black/5 focus:outline-none focus:ring-fern resize-none mb-7"
        />
      ) : (
        <div
          onClick={startEditingNotes}
          className={cn(
            "text-sm text-bark/70 leading-relaxed mb-7 cursor-text hover:bg-bark/5 -mx-2 px-2 py-1 rounded-md transition-colors",
            task.notes ? "italic" : "text-bark/40 italic"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startEditingNotes();
            }
          }}
        >
          {task.notes ? `"${task.notes}"` : "Add a description..."}
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => openCompleteFor(task.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90"
        >
          <Check className="size-4" />
          Mark complete
        </button>
      </div>

      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bark/40 mb-5">
          Event history
        </h3>
        {events.length === 0 ? (
          <p className="text-sm text-bark/50 italic">No completions logged yet.</p>
        ) : (
          <div className="relative space-y-8 pl-8">
            <div className="absolute left-4 top-1.5 bottom-1.5 w-px bg-moss/30" />
            {events.map((ev, i) => (
              <div key={ev.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-[22px] top-1.5 size-3 rounded-full bg-paper-dark ring-2",
                    i === 0 ? "ring-fern" : "ring-moss/40",
                  )}
                />
                <button
                  type="button"
                  onClick={() => openEditEvent(ev.id)}
                  className="block w-full text-left py-1 rounded-md hover:bg-bark/5 transition-colors"
                >
                  <span className="block text-xs font-semibold text-bark">
                    Completed{ev.by ? ` by ${ev.by}` : ""}
                  </span>
                  <span className="block text-[11px] text-bark/50 mt-0.5">
                    {formatDateLong(ev.completedAt)}
                  </span>
                  {ev.note && (
                    <p className="text-xs text-bark/60 mt-1.5 italic leading-relaxed">
                      "{ev.note}"
                    </p>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({
  label,
  value,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  tone?: "danger";
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "select-none",
        onClick && "cursor-text hover:bg-bark/5 -mx-2 px-2 py-1 rounded-md transition-colors"
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="block text-[10px] font-medium uppercase tracking-wider text-bark/40 mb-1">
        {label}
      </span>
      <span className={cn("text-sm font-medium", tone === "danger" ? "text-rust" : "text-bark")}>
        {value}
      </span>
    </div>
  );
}
