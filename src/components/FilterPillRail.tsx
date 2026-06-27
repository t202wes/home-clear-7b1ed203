import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/**
 * Horizontal, swipable rail of filter pills.
 * Tap a pill to scope the task list to a property (or All).
 */
export function FilterPillRail() {
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);

  const pills = [{ id: "all", name: "All" }, ...properties];

  return (
    <div className="-mx-5 md:-mx-8 px-5 md:px-8 mb-5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {pills.map((p) => {
          const active = propertyFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPropertyFilter(p.id)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium ring-1 transition-all duration-150 active:scale-[0.96]",
                active
                  ? "bg-bark text-paper ring-bark shadow-sm"
                  : "bg-card text-bark/70 ring-black/[0.06] hover:ring-black/15 hover:text-bark",
              )}
            >
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
