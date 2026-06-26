import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { addDays } from "date-fns";
import { X } from "lucide-react";

const RECURRENCE_OPTIONS = [
  { value: "once", label: "One-off", days: 0 },
  { value: "30", label: "Monthly", days: 30 },
  { value: "60", label: "Every 2 months", days: 60 },
  { value: "90", label: "Quarterly", days: 90 },
  { value: "180", label: "Twice a year", days: 180 },
  { value: "365", label: "Annually", days: 365 },
];

export function AddTaskSheet() {
  const open = useUIStore((s) => s.addTaskOpen);
  const close = useUIStore((s) => s.closeAddTask);
  const properties = useStore((s) => s.properties);
  const filterProp = useUIStore((s) => s.propertyFilter);
  const addTask = useStore((s) => s.addTask);

  const defaultProp = filterProp !== "all" ? filterProp : properties[0]?.id ?? "";

  const [title, setTitle] = useState("");
  const [propertyId, setPropertyId] = useState(defaultProp);
  const [recurrence, setRecurrence] = useState("90");
  const [dueDate, setDueDate] = useState(() => addDays(new Date(), 7).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const reset = () => {
    setTitle("");
    setPropertyId(defaultProp);
    setRecurrence("90");
    setDueDate(addDays(new Date(), 7).toISOString().slice(0, 10));
    setNotes("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !propertyId) return;
    const opt = RECURRENCE_OPTIONS.find((o) => o.value === recurrence)!;
    addTask({
      title: title.trim(),
      propertyId,
      recurrence:
        opt.value === "once"
          ? { kind: "once" }
          : { kind: "recurring", everyDays: opt.days, label: opt.label },
      nextDueAt: new Date(dueDate + "T09:00:00").toISOString(),
      notes: notes.trim() || undefined,
    });
    reset();
    close();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          close();
        }
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md bg-paper p-0 overflow-y-auto">
        <form onSubmit={submit} className="p-8 flex flex-col h-full">
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
              New maintenance task
            </span>
            <h2 className="font-display font-semibold text-2xl mt-1">Add task</h2>
          </div>

          <div className="space-y-5">
            <Field label="Title">
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Replace water filter"
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </Field>

            <Field label="Property">
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Schedule">
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
                >
                  {RECURRENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Next due">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything worth remembering next time"
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern resize-none"
              />
            </Field>
          </div>

          <div className="mt-auto pt-8 flex gap-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-2.5 rounded-md text-sm font-medium text-bark/60 hover:text-bark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90"
            >
              Create task
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
