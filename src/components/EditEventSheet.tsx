import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { Check, Trash2, X } from "lucide-react";

export function EditEventSheet() {
  const eventId = useUIStore((s) => s.editEventId);
  const close = useUIStore((s) => s.closeEditEvent);
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const updateEvent = useStore((s) => s.updateEvent);
  const deleteEvent = useStore((s) => s.deleteEvent);

  const event = events.find((e) => e.id === eventId);
  const task = event ? tasks.find((t) => t.id === event.taskId) : undefined;

  const [date, setDate] = useState("");
  const [by, setBy] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (event) {
      setDate(new Date(event.completedAt).toISOString().slice(0, 10));
      setBy(event.by ?? "");
      setNote(event.note ?? "");
    }
  }, [event]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    updateEvent(event.id, {
      completedAt: new Date(date + "T12:00:00").toISOString(),
      by: by.trim() || undefined,
      note: note.trim() || undefined,
    });
    close();
  };

  const remove = () => {
    if (!event) return;
    if (window.confirm("Delete this completion event?")) {
      deleteEvent(event.id);
      close();
    }
  };

  return (
    <Sheet open={!!eventId} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-paper-dark border-l border-bark/5 p-0 overflow-y-auto [&>button]:hidden"
      >
        {event && task && (
          <form onSubmit={submit} className="relative p-8 h-full flex flex-col">
            <button
              type="button"
              onClick={close}
              className="absolute right-5 top-5 size-8 grid place-items-center rounded-md text-bark/40 hover:text-bark hover:bg-bark/5"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="mb-7">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fern">
                Edit completion
              </span>
              <h2 className="font-display font-semibold text-2xl leading-tight text-balance mt-1">
                {task.title}
              </h2>
            </div>

            <div className="space-y-4 flex-1">
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

              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
                  Notes
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="What was done, parts used, anything notable…"
                  className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern resize-none"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-6 mt-6 border-t border-bark/5">
              <button
                type="button"
                onClick={remove}
                className="size-10 grid place-items-center bg-card text-rust/80 rounded-md ring-1 ring-black/5 hover:text-rust"
                aria-label="Delete event"
              >
                <Trash2 className="size-4" />
              </button>
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
                Save changes
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
