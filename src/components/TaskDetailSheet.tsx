import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useStore, eventsForTask, lastCompleted, taskStatus } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { relativeDue, formatDate, formatDateLong } from "@/lib/format";
import { Check, Calendar, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskDetailSheet() {
  const openTaskId = useUIStore((s) => s.openTaskId);
  const closeTask = useUIStore((s) => s.closeTask);
  const openCompleteFor = useUIStore((s) => s.openCompleteFor);
  const updateTask = useStore((s) => s.updateTask);

  const task = useStore((s) => s.tasks.find((t) => t.id === openTaskId));
  const property = useStore((s) => (task ? s.properties.find((p) => p.id === task.propertyId) : undefined));
  const events = useStore((s) => (task ? eventsForTask(s.events, task.id) : []));
  const last = useStore((s) => (task ? lastCompleted(s.events, task.id) : undefined));

  if (!task) return null;
  const status = taskStatus(task);
  const due = relativeDue(task.nextDueAt);

  const reschedule = () => {
    const today = new Date().toISOString().slice(0, 10);
    const next = window.prompt("Reschedule to (YYYY-MM-DD):", today);
    if (next) {
      const d = new Date(next + "T09:00:00");
      if (!isNaN(d.getTime())) updateTask(task.id, { nextDueAt: d.toISOString() });
    }
  };

  return (
    <Sheet open={!!openTaskId} onOpenChange={(o) => !o && closeTask()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-paper-dark border-l border-bark/5 p-0 overflow-y-auto"
      >
        <div className="p-8">
          <button
            onClick={closeTask}
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
            <h2 className="font-display font-semibold text-2xl leading-tight text-balance">
              {task.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {property?.name}
              {property?.detail ? ` · ${property.detail}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-7 pb-6 border-b border-bark/5">
            <Meta label="Schedule" value={task.recurrence.kind === "recurring" ? task.recurrence.label : "One-off"} />
            <Meta label="Next due" value={due.text} tone={due.tone === "overdue" ? "danger" : undefined} />
            <Meta label="Last done" value={last ? formatDate(last.completedAt) : "—"} />
          </div>

          {task.notes && (
            <p className="text-sm text-bark/70 leading-relaxed mb-7 italic">
              "{task.notes}"
            </p>
          )}

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => openCompleteFor(task.id)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90"
            >
              <Check className="size-4" />
              Mark complete
            </button>
            <button
              onClick={reschedule}
              className="size-10 grid place-items-center bg-card text-bark/70 rounded-md ring-1 ring-black/5 hover:text-bark"
              aria-label="Reschedule"
            >
              <Calendar className="size-4" />
            </button>
            <button
              className="size-10 grid place-items-center bg-card text-bark/70 rounded-md ring-1 ring-black/5 hover:text-bark"
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </button>
          </div>

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bark/40 mb-5">
              Event history
            </h3>
            {events.length === 0 ? (
              <p className="text-sm text-bark/50 italic">No completions logged yet.</p>
            ) : (
              <div className="relative space-y-7 pl-4">
                <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-moss/30" />
                {events.map((ev, i) => (
                  <div key={ev.id} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[13px] top-1.5 size-3 rounded-full bg-paper-dark ring-2",
                        i === 0 ? "ring-fern" : "ring-moss/40",
                      )}
                    />
                    <div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Meta({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div>
      <span className="block text-[10px] font-medium uppercase tracking-wider text-bark/40 mb-1">
        {label}
      </span>
      <span className={cn("text-sm font-medium", tone === "danger" ? "text-rust" : "text-bark")}>
        {value}
      </span>
    </div>
  );
}
