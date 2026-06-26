import { useStore, taskStatus, lastCompleted, type Task } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { relativeDue, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal } from "lucide-react";

const accent: Record<"overdue" | "due-soon" | "later", string> = {
  overdue: "border-rust/60",
  "due-soon": "border-fern/60",
  later: "border-bark/10",
};

export function TaskRow({ task }: { task: Task }) {
  const properties = useStore((s) => s.properties);
  const events = useStore((s) => s.events);
  const openTask = useUIStore((s) => s.openTask);
  const openCompleteFor = useUIStore((s) => s.openCompleteFor);

  const status = taskStatus(task);
  const property = properties.find((p) => p.id === task.propertyId);
  const due = relativeDue(task.nextDueAt);
  const last = lastCompleted(events, task.id);

  return (
    <div
      onClick={() => openTask(task.id)}
      className={cn(
        "group relative flex items-center gap-3 bg-card pl-4 pr-3 py-3 rounded-md ring-1 ring-black/[0.04] border-l-4 transition-shadow hover:ring-black/10 hover:shadow-sm cursor-pointer",
        accent[status],
        status === "later" && "opacity-90",
      )}
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-bark truncate">{task.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="truncate">{property?.name}</span>
          <span className="size-1 rounded-full bg-bark/15 shrink-0" />
          <DueChip text={due.text} tone={due.tone} />
          {task.recurrence.kind === "recurring" && (
            <>
              <span className="size-1 rounded-full bg-bark/15 shrink-0 hidden sm:block" />
              <span className="hidden sm:inline text-bark/40 truncate">{task.recurrence.label}</span>
            </>
          )}
          {last && (
            <>
              <span className="size-1 rounded-full bg-bark/15 shrink-0 hidden md:block" />
              <span className="hidden md:inline text-bark/40 truncate">
                Last: {formatDate(last.completedAt)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openCompleteFor(task.id);
          }}
          className="flex items-center gap-1.5 text-xs font-medium bg-fern text-paper py-1.5 px-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90"
        >
          <Check className="size-3.5" />
          Mark complete
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openTask(task.id);
          }}
          className="size-7 grid place-items-center text-bark/40 hover:text-bark rounded-md"
          aria-label="More"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}

function DueChip({ text, tone }: { text: string; tone: "overdue" | "soon" | "neutral" }) {
  return (
    <span
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded ring-1 font-medium",
        tone === "overdue" && "bg-rust/8 text-rust ring-rust/15",
        tone === "soon" && "bg-paper-dark text-bark/70 ring-bark/10",
        tone === "neutral" && "bg-paper-dark text-bark/50 ring-bark/10",
      )}
      style={tone === "overdue" ? { backgroundColor: "color-mix(in srgb, var(--rust) 8%, transparent)" } : undefined}
    >
      {text}
    </span>
  );
}
