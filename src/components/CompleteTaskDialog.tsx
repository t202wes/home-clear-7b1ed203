import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { Check } from "lucide-react";

export function CompleteTaskDialog() {
  const taskId = useUIStore((s) => s.completeTaskId);
  const close = useUIStore((s) => s.closeComplete);
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const property = useStore((s) => (task ? s.properties.find((p) => p.id === task.propertyId) : undefined));
  const completeTask = useStore((s) => s.completeTask);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [by, setBy] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (taskId) {
      setDate(new Date().toISOString().slice(0, 10));
      setBy("");
      setNote("");
    }
  }, [taskId]);

  if (!task) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    completeTask(task.id, {
      completedAt: new Date(date + "T12:00:00").toISOString(),
      by: by.trim() || undefined,
      note: note.trim() || undefined,
    });
    close();
  };

  return (
    <Dialog open={!!taskId} onOpenChange={(o) => !o && close()}>
      <DialogContent className="bg-paper border-bark/10 sm:max-w-md">
        <DialogHeader>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fern">
            Record completion
          </span>
          <DialogTitle className="font-display font-semibold text-xl mt-1 text-balance">
            {task.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{property?.name}</p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
                Completed on
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
                Completed by
              </span>
              <input
                value={by}
                onChange={(e) => setBy(e.target.value)}
                placeholder="Optional"
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
              Notes
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What was done, parts used, anything notable…"
              className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern resize-none"
            />
          </label>

          {task.recurrence.kind === "recurring" && (
            <p className="text-xs text-bark/50 italic">
              Next occurrence will be scheduled {task.recurrence.everyDays} days after the completion date.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-2.5 rounded-md text-sm font-medium text-bark/60 hover:text-bark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] flex items-center justify-center gap-1.5 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90"
            >
              <Check className="size-4" />
              Save completion
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
