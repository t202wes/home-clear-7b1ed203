import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { ClientOnly } from "@/components/ClientOnly";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Evergreen" },
      { name: "description", content: "A chronological log of completed maintenance across your properties." },
    ],
  }),
  component: HistoryPageWrapper,
});

function HistoryPageWrapper() {
  return (
    <ClientOnly fallback={<HistoryPageSkeleton />}>
      <HistoryPage />
    </ClientOnly>
  );
}

function HistoryPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <div className="h-4 w-32 rounded bg-paper-dark" />
      <div className="mt-3 h-9 w-40 rounded-md bg-paper-dark" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-16 rounded-md bg-card ring-1 ring-black/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function HistoryPage() {
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);
  const openTask = useUIStore((s) => s.openTask);

  const grouped = useMemo(() => {
    const filtered = events.filter((e) => {
      if (propertyFilter === "all") return true;
      const t = tasks.find((x) => x.id === e.taskId);
      return t?.propertyId === propertyFilter;
    });
    const sorted = [...filtered].sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
    const map = new Map<string, typeof sorted>();
    for (const ev of sorted) {
      const key = format(new Date(ev.completedAt), "MMMM yyyy");
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [events, tasks, propertyFilter]);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <header className="mb-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bark/40">
          Maintenance log
        </span>
        <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-bark mt-1">
          History
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Building2 className="size-3.5" />
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="bg-transparent text-fern font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <span className="text-bark/30">·</span>
          <span className="text-bark/50">Read-only log of completed work</span>
        </div>
      </header>

      {grouped.length === 0 ? (
        <p className="text-sm text-bark/50 italic">No completions recorded yet.</p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([month, items]) => (
            <section key={month}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bark/40 mb-3 px-1">
                {month}
              </h3>
              <ul className="divide-y divide-bark/5 border-y border-bark/5">
                {items.map((ev) => {
                  const task = tasks.find((t) => t.id === ev.taskId);
                  const property = properties.find((p) => p.id === task?.propertyId);
                  return (
                    <li key={ev.id}>
                      <button
                        onClick={() => task && openTask(task.id)}
                        className="group w-full text-left py-3.5 px-1 flex items-center gap-4 hover:bg-paper-dark/50 transition-colors"
                      >
                        <span className="text-xs font-medium text-bark/45 w-12 shrink-0 tabular-nums">
                          {format(new Date(ev.completedAt), "MMM d")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-bark truncate">
                            {task?.title ?? "Removed task"}
                          </p>
                          <p className="text-xs text-bark/50 truncate">
                            {property?.name}
                            {ev.by ? ` · ${ev.by}` : ""}
                            {ev.note ? ` · ${ev.note}` : ""}
                          </p>
                        </div>
                        <ArrowUpRight className="size-3.5 text-bark/25 group-hover:text-bark/60 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
