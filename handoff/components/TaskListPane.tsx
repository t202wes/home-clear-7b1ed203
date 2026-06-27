import { useMemo } from "react";
import { Plus } from "lucide-react";
import { startOfMonth, isAfter, addDays } from "date-fns";
import { SummaryTiles, type Tile } from "./SummaryTiles";
import { TaskRow } from "./TaskRow";
import {
  taskStatus,
  type Task,
  type Property,
  type MaintenanceEvent,
} from "../lib/mockData";

type Props = {
  tasks: Task[];
  properties: Property[];
  events: MaintenanceEvent[];
  propertyFilter: string;
  openTaskId: string | null;
  onOpenTask: (id: string) => void;
  onAddTask: () => void;
};

export function TaskListPane({
  tasks, properties, events, propertyFilter, openTaskId, onOpenTask, onAddTask,
}: Props) {
  const filtered = useMemo(
    () => propertyFilter === "all" ? tasks : tasks.filter((t) => t.propertyId === propertyFilter),
    [tasks, propertyFilter],
  );

  const groups = useMemo(() => {
    const overdue: Task[] = [], soon: Task[] = [], later: Task[] = [];
    for (const t of filtered) {
      const s = taskStatus(t);
      if (s === "overdue") overdue.push(t);
      else if (s === "due-soon") soon.push(t);
      else later.push(t);
    }
    const byDue = (a: Task, b: Task) => +new Date(a.nextDueAt) - +new Date(b.nextDueAt);
    return {
      overdue: overdue.sort(byDue),
      soon: soon.sort(byDue),
      later: later.sort(byDue),
    };
  }, [filtered]);

  const tiles: Tile[] = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const inWeek = addDays(new Date(), 7);
    const visibleEvents = events.filter(
      (e) => propertyFilter === "all" ||
        tasks.find((t) => t.id === e.taskId)?.propertyId === propertyFilter,
    );
    const completedThisMonth = visibleEvents.filter(
      (e) => isAfter(new Date(e.completedAt), monthStart),
    ).length;
    const dueThisWeek = filtered.filter((t) => {
      const d = new Date(t.nextDueAt);
      return d <= inWeek && taskStatus(t) !== "overdue";
    }).length;
    return [
      { label: "Open", value: filtered.length, tone: "neutral" },
      { label: "Overdue", value: groups.overdue.length, tone: "danger" },
      { label: "Due this week", value: dueThisWeek, tone: "primary" },
      { label: "Done this month", value: completedThisMonth, tone: "muted" },
    ];
  }, [filtered, events, tasks, propertyFilter, groups.overdue.length]);

  const activeProperty = properties.find((p) => p.id === propertyFilter);

  return (
    <div className="list-pane">
      <header className="list-pane__header">
        <div style={{ minWidth: 0 }}>
          <h2 className="list-pane__title">{activeProperty?.name ?? "Maintenance"}</h2>
          <p className="list-pane__subtitle">
            {activeProperty ? "Property tasks" : "All properties"}
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onAddTask}>
          <Plus size={16} />
          Add task
        </button>
      </header>

      <div className="list-pane__tiles">
        <SummaryTiles tiles={tiles} />
      </div>

      <div className="list-pane__groups">
        <Group
          title="Overdue" count={groups.overdue.length} tasks={groups.overdue}
          emptyText="Nothing overdue."
          properties={properties} events={events}
          propertyFilter={propertyFilter} openTaskId={openTaskId} onOpenTask={onOpenTask}
        />
        <Group
          title="Due soon" count={groups.soon.length} tasks={groups.soon}
          emptyText="Nothing due in the next week."
          properties={properties} events={events}
          propertyFilter={propertyFilter} openTaskId={openTaskId} onOpenTask={onOpenTask}
        />
        <Group
          title="Later" count={groups.later.length} tasks={groups.later}
          emptyText="No upcoming tasks."
          properties={properties} events={events}
          propertyFilter={propertyFilter} openTaskId={openTaskId} onOpenTask={onOpenTask}
        />
      </div>
    </div>
  );
}

function Group({
  title, count, tasks, emptyText, properties, events, propertyFilter, openTaskId, onOpenTask,
}: {
  title: string; count: number; tasks: Task[]; emptyText: string;
  properties: Property[]; events: MaintenanceEvent[];
  propertyFilter: string; openTaskId: string | null;
  onOpenTask: (id: string) => void;
}) {
  return (
    <section>
      <div className="group__head">
        <h3 className="section-label">{title}</h3>
        <span className="group__count">{count}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="group__empty">{emptyText}</p>
      ) : (
        <div className="group__list">
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              property={properties.find((p) => p.id === t.propertyId)}
              events={events}
              isSelected={openTaskId === t.id}
              showProperty={propertyFilter === "all"}
              onClick={() => onOpenTask(t.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
