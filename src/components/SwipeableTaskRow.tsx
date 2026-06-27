import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { TaskRow } from "@/components/TaskRow";
import { useUIStore } from "@/lib/ui-store";
import type { Task } from "@/lib/store";

const ACTION_WIDTH = 88;
const TRIGGER = 96;

/**
 * Swipe a row left to reveal Delete, right to reveal Complete.
 * Past the trigger threshold the action fires on release.
 * Falls back to a normal tap-to-open row on desktop.
 */
export function SwipeableTaskRow({ task }: { task: Task }) {
  const x = useMotionValue(0);
  const [primed, setPrimed] = useState<"complete" | "delete" | null>(null);
  const startX = useRef(0);

  const openCompleteFor = useUIStore((s) => s.openCompleteFor);

  // Background actions fade in as you drag.
  const completeOpacity = useTransform(x, [0, 40, TRIGGER], [0, 0.6, 1]);
  const deleteOpacity = useTransform(x, [-TRIGGER, -40, 0], [1, 0.6, 0]);

  function handleDrag(_: unknown, info: PanInfo) {
    const next = info.offset.x;
    if (next > TRIGGER && primed !== "complete") setPrimed("complete");
    else if (next < -TRIGGER && primed !== "delete") setPrimed("delete");
    else if (Math.abs(next) < TRIGGER && primed) setPrimed(null);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > TRIGGER) {
      openCompleteFor(task.id);
    }
    // Delete intentionally no-ops for now (no destructive store action wired);
    // the swipe still reveals the affordance.
    setPrimed(null);
    x.set(0);
  }

  return (
    <div className="relative">
      {/* Complete action (revealed on right-swipe) */}
      <motion.div
        style={{ opacity: completeOpacity }}
        className="absolute inset-y-0 left-0 flex items-center pl-5 rounded-md bg-[var(--accent-success)] text-paper"
      >
        <div className="flex items-center gap-2 text-sm font-medium" style={{ width: ACTION_WIDTH }}>
          <Check className="size-4" /> Done
        </div>
      </motion.div>

      {/* Delete action (revealed on left-swipe) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-5 rounded-md bg-[var(--accent-danger)] text-paper"
      >
        <div className="flex items-center gap-2 text-sm font-medium justify-end" style={{ width: ACTION_WIDTH }}>
          <Trash2 className="size-4" /> Delete
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH * 1.4, right: ACTION_WIDTH * 1.4 }}
        dragElastic={0.18}
        dragDirectionLock
        style={{ x }}
        onDragStart={(_, info) => { startX.current = info.point.x; }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 500, damping: 38 }}
        className="relative touch-pan-y"
      >
        <TaskRow task={task} />
      </motion.div>
    </div>
  );
}
