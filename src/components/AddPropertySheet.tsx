import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { X } from "lucide-react";

export function AddPropertySheet() {
  const open = useUIStore((s) => s.addPropertyOpen);
  const close = useUIStore((s) => s.closeAddProperty);
  const addProperty = useStore((s) => s.addProperty);

  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");

  const reset = () => {
    setName("");
    setDetail("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProperty({
      name: name.trim(),
      detail: detail.trim() || undefined,
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
              New property
            </span>
            <h2 className="font-display font-semibold text-2xl mt-1">Add property</h2>
          </div>

          <div className="space-y-5">
            <Field label="Property name">
              <input
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oak Ridge Estate"
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </Field>

            <Field label="Detail (optional)">
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="e.g. Main building, 4 units"
                className="w-full bg-card rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
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
              Create property
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
