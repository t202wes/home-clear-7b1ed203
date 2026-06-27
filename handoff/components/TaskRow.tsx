import { cn } from "../lib/cn";
import { relativeDue, formatDate, type DueTone } from "../lib/format";
import {
  taskStatus,
  lastCompleted,
  type Task,
  type MaintenanceEvent,
  type Property,
} from "../lib/mockData";

type Props = {
  task: Task;
  property?: Property;
  events: MaintenanceEvent[];
  isSelected: boolean;
  showProperty: boolean;
  onClick: () => void;
};

export function TaskRow({ task, property, events, isSelected, showProperty, onClick }: Props) {
  const status = taskStatus(task);
  const due = relativeDue(task.nextDueAt);
  const last = lastCompleted(events, task.id);

  return (
    <div
      onClick={onClick}
      className={cn(
        "task-row",
        status === "overdue" && "task-row--overdue",
        status === "due-soon" && "task-row--due-soon",
        status === "later" && "task-row--later",
        isSelected && "is-selected",
      )}
    >
      <div className="task-row__body">
        <h4 className="task-row__title">{task.title}</h4>
        <div className="task-row__meta">
          {showProperty && (
            <>
              <span className="task-row__meta-text">{property?.name ?? "Unknown property"}</span>
              <span className="task-row__meta-sep" />
            </>
          )}
          <DueChip text={due.text} tone={due.tone} />
          {task.recurrence.kind === "recurring" && (
            <>
              <span className="task-row__meta-sep task-row__meta--sm-hide" />
              <span className="task-row__meta-text task-row__meta-text--faint task-row__meta--sm-hide">
                {task.recurrence.label}
              </span>
            </>
          )}
          {last && (
            <>
              <span className="task-row__meta-sep task-row__meta--md-hide" />
              <span className="task-row__meta-text task-row__meta-text--faint task-row__meta--md-hide">
                Last: {formatDate(last.completedAt)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DueChip({ text, tone }: { text: string; tone: DueTone }) {
  return (
    <span
      className={cn(
        "chip",
        tone === "overdue" && "chip--overdue",
        tone === "soon" && "chip--soon",
        tone === "neutral" && "chip--neutral",
      )}
    >
      {text}
    </span>
  );
}
