import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, taskStatus } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { TaskRow } from "@/components/TaskRow";
import { SummaryTiles } from "@/components/SummaryTiles";
import { ClientOnly } from "@/components/ClientOnly";
import { Plus } from "lucide-react";
import { startOfMonth, isAfter, addDays } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All tasks — Evergreen" },
      { name: "description", content: "All maintenance tasks across your properties, grouped by status." },
    ],
  }),
  component: TasksPageWrapper,
});

function TasksPageWrapper() {
  return (
    <ClientOnly fallback={<TasksPageSkeleton />}>
      <TasksPage />
    </ClientOnly>
  );
}

function TasksPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <div className="h-9 w-48 rounded-md bg-paper-dark" />
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-paper-dark ring-1 ring-black/5" />
        ))}
      </div>
      <div className="mt-10 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 rounded-md bg-card ring-1 ring-black/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);
  const openAddTask = useUIStore((s) => s.openAddTask);

  const filtered = useMemo(
    () => (propertyFilter === "all" ? tasks : tasks.filter((t) => t.propertyId === propertyFilter)),
    [tasks, propertyFilter],
  );

  const groups = useMemo(() => {
    const overdue: typeof filtered = [];
    const soon: typeof filtered = [];
    const later: typeof filtered = [];
    for (const t of filtered) {
      const s = taskStatus(t);
      if (s === "overdue") overdue.push(t);
      else if (s === "due-soon") soon.push(t);
      else later.push(t);
    }
    const byDue = (a: typeof tasks[0], b: typeof tasks[0]) => +new Date(a.nextDueAt) - +new Date(b.nextDueAt);
    return {
      overdue: overdue.sort(byDue),
      soon: soon.sort(byDue),
      later: later.sort(byDue),
    };
  }, [filtered, tasks]);

  const tiles = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const inWeek = addDays(new Date(), 7);
    const visibleEvents = events.filter(
      (e) => propertyFilter === "all" || tasks.find((t) => t.id === e.taskId)?.propertyId === propertyFilter,
    );
    const completedThisMonth = visibleEvents.filter((e) => isAfter(new Date(e.completedAt), monthStart)).length;
    const dueThisWeek = filtered.filter((t) => {
      const d = new Date(t.nextDueAt);
      return d <= inWeek && taskStatus(t) !== "overdue";
    }).length;
    return [
      { label: "Open", value: filtered.length, tone: "neutral" as const },
      { label: "Overdue", value: groups.overdue.length, tone: "danger" as const },
      { label: "Due this week", value: dueThisWeek, tone: "primary" as const },
      { label: "Done this month", value: completedThisMonth, tone: "muted" as const },
    ];
  }, [filtered, events, tasks, propertyFilter, groups.overdue.length]);

  const activeProperty = properties.find((p) => p.id === propertyFilter);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <header className="flex items-end justify-between gap-4 mb-7">
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-bark truncate">
            {activeProperty?.name ?? "Maintenance"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeProperty ? "Property tasks" : "All properties"}
          </p>
        </div>
        <button
          onClick={openAddTask}
          className="hidden sm:inline-flex items-center gap-1.5 bg-card text-bark text-sm font-medium py-2 px-3 rounded-md ring-1 ring-black/5 hover:ring-black/10"
        >
          <Plus className="size-4" />
          Add task
        </button>
      </header>

      <div className="mb-10">
        <SummaryTiles tiles={tiles} />
      </div>

      <div className="space-y-10">
        <Group title="Overdue" count={groups.overdue.length} tasks={groups.overdue} emptyText="Nothing overdue." />
        <Group title="Due soon" count={groups.soon.length} tasks={groups.soon} emptyText="Nothing due in the next week." />
        <Group title="Later" count={groups.later.length} tasks={groups.later} emptyText="No upcoming tasks." />
      </div>
    </div>
  );
}

function Group({
  title,
  count,
  tasks,
  emptyText,
}: {
  title: string;
  count: number;
  tasks: ReturnType<typeof useStore.getState>["tasks"];
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3 px-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bark/45">
          {title}
        </h3>
        <span className="text-[10px] font-medium text-bark/30">{count}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-bark/40 italic px-1">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      )}
    </section>
  );
}
