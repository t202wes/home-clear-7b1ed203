import { Check, Pencil, X, ListChecks } from "lucide-react";
import { cn } from "../lib/cn";
import { relativeDue, formatDate, formatDateLong } from "../lib/format";
import {
  eventsForTask, lastCompleted, taskStatus,
  type Task, type Property, type MaintenanceEvent,
} from "../lib/mockData";

type Props = {
  task: Task | undefined;
  property: Property | undefined;
  events: MaintenanceEvent[];
  onClose: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onEditEvent: (eventId: string) => void;
};

export function TaskDetailPane(props: Props) {
  return (
    <aside className="detail-pane">
      <DetailContent {...props} />
    </aside>
  );
}

export function DetailContent({
  task, property, events, onClose, onComplete, onEdit, onEditEvent,
}: Props) {
  if (!task) {
    return (
      <div className="detail--empty">
        <ListChecks size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
        <p>Select a task to view details</p>
      </div>
    );
  }

  const status = taskStatus(task);
  const due = relativeDue(task.nextDueAt);
  const taskEvents = eventsForTask(events, task.id);
  const last = lastCompleted(events, task.id);

  return (
    <div className="detail">
      <button
        type="button" onClick={onClose}
        className="btn--close detail__close" aria-label="Close"
      >
        <X size={16} />
      </button>

      <div style={{ marginBottom: 28 }}>
        <div className={cn("detail__status", `detail__status--${status}`)}>
          <span className="detail__status-dot" />
          <span>
            {status === "overdue" ? "Overdue" : status === "due-soon" ? "Due soon" : "Active task"}
          </span>
        </div>
        <h2 className="detail__title">{task.title}</h2>
        <p className="detail__subtitle">
          {property?.name}
          {property?.detail ? ` · ${property.detail}` : ""}
        </p>
      </div>

      <div className="detail__meta-grid">
        <Meta
          label="Schedule"
          value={task.recurrence.kind === "recurring" ? task.recurrence.label : "One-off"}
        />
        <Meta label="Next due" value={due.text} tone={due.tone === "overdue" ? "danger" : undefined} />
        <Meta label="Last done" value={last ? formatDate(last.completedAt) : "—"} />
      </div>

      {task.notes && <p className="detail__notes">"{task.notes}"</p>}

      <div className="detail__actions">
        <button type="button" className="btn btn--primary" onClick={onComplete}>
          <Check size={16} />
          Mark complete
        </button>
        <button type="button" className="btn--icon" onClick={onEdit} aria-label="Edit">
          <Pencil size={16} />
        </button>
      </div>

      <section>
        <h3 className="section-label" style={{ marginBottom: 20, display: "block" }}>
          Event history
        </h3>
        {taskEvents.length === 0 ? (
          <p className="detail__empty">No completions logged yet.</p>
        ) : (
          <div className="timeline">
            {taskEvents.map((ev, i) => (
              <div
                key={ev.id}
                className={cn("timeline__item", i === 0 && "timeline__item--newest")}
              >
                <span className="timeline__dot" />
                <button type="button" className="timeline__entry" onClick={() => onEditEvent(ev.id)}>
                  <span className="timeline__who">
                    Completed{ev.by ? ` by ${ev.by}` : ""}
                  </span>
                  <span className="timeline__when">{formatDateLong(ev.completedAt)}</span>
                  {ev.note && <p className="timeline__note">"{ev.note}"</p>}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({
  label, value, tone,
}: { label: string; value: string; tone?: "danger" }) {
  return (
    <div>
      <span className="meta__label">{label}</span>
      <span className={cn("meta__value", tone === "danger" && "meta__value--danger")}>
        {value}
      </span>
    </div>
  );
}
