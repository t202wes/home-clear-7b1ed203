import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Sidebar } from "./components/Sidebar";
import { TaskListPane } from "./components/TaskListPane";
import { TaskDetailPane } from "./components/TaskDetailPane";
import { SheetModal } from "./components/SheetModal";
import { properties, tasks, events, taskStatus } from "./lib/mockData";

/**
 * Drop-in reference page that renders the "All tasks" screen exactly
 * as it appears in production, with mock data.
 *
 *   import ReferencePage from "./handoff/ReferencePage";
 *   export default function App() { return <ReferencePage />; }
 */
export default function ReferencePage() {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | { kind: "add" } | { kind: "edit"; taskId: string }>(null);

  const filtered = useMemo(
    () => propertyFilter === "all" ? tasks : tasks.filter((t) => t.propertyId === propertyFilter),
    [propertyFilter],
  );

  // Auto-select most urgent task on desktop when list / filter changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches === false) return;
    if (filtered.length === 0) return;
    if (openTaskId && filtered.some((t) => t.id === openTaskId)) return;
    const first = [...filtered].sort(
      (a, b) => +new Date(a.nextDueAt) - +new Date(b.nextDueAt),
    )[0];
    if (first) setOpenTaskId(first.id);
  }, [filtered, openTaskId, propertyFilter]);

  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) : undefined;
  const openProperty = openTask ? properties.find((p) => p.id === openTask.propertyId) : undefined;

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            currentPath="tasks"
            onNavigate={() => { /* no-op in reference */ }}
            properties={properties}
            propertyFilter={propertyFilter}
            onPropertyFilterChange={setPropertyFilter}
            onAddTask={() => setSheet({ kind: "add" })}
          />
        }
        detail={
          <TaskDetailPane
            task={openTask}
            property={openProperty}
            events={events}
            onClose={() => setOpenTaskId(null)}
            onComplete={() => { /* no-op */ }}
            onEdit={() => openTask && setSheet({ kind: "edit", taskId: openTask.id })}
            onEditEvent={() => { /* no-op */ }}
          />
        }
      >
        <TaskListPane
          tasks={tasks}
          properties={properties}
          events={events}
          propertyFilter={propertyFilter}
          openTaskId={openTaskId}
          onOpenTask={setOpenTaskId}
          onAddTask={() => setSheet({ kind: "add" })}
        />
      </AppShell>

      <SheetModal
        open={sheet?.kind === "add"}
        onClose={() => setSheet(null)}
        title="Add task"
      >
        <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>
          Sheet body goes here. This handoff ships the sheet primitive only —
          wire it to your real form when porting.
        </p>
      </SheetModal>

      <SheetModal
        open={sheet?.kind === "edit"}
        onClose={() => setSheet(null)}
        title="Edit task"
      >
        <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>
          Editing {sheet?.kind === "edit" ? tasks.find((t) => t.id === sheet.taskId)?.title : ""}.
        </p>
      </SheetModal>

      {/* Reference-only: keeps unused `taskStatus` import warning-free for downstream porters */}
      <span style={{ display: "none" }}>{taskStatus(tasks[0])}</span>
    </>
  );
}
