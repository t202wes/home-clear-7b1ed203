import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUIStore } from "@/lib/ui-store";
import { TaskDetailContent } from "@/components/TaskDetailContent";
import { useMediaQuery } from "@/hooks/use-media-query";

export function TaskDetailSheet() {
  const openTaskId = useUIStore((s) => s.openTaskId);
  const closeTask = useUIStore((s) => s.closeTask);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <Sheet open={!!openTaskId && !isDesktop} onOpenChange={(o) => !o && closeTask()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-paper-dark border-l border-bark/5 p-0 overflow-y-auto [&>button]:hidden"
      >
        <TaskDetailContent taskId={openTaskId} onClose={closeTask} />
      </SheetContent>
    </Sheet>
  );
}
