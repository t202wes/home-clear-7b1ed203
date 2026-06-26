import { useUIStore } from "@/lib/ui-store";
import { TaskDetailContent } from "@/components/TaskDetailContent";

export function TaskDetailPane() {
  const openTaskId = useUIStore((s) => s.openTaskId);
  const closeTask = useUIStore((s) => s.closeTask);

  return (
    <div className="hidden lg:flex w-96 shrink-0 flex-col bg-paper-dark border-l border-bark/5 overflow-y-auto">
      <TaskDetailContent taskId={openTaskId} onClose={closeTask} />
    </div>
  );
}
