import { ListChecks, History, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import type { Property } from "../lib/mockData";

type Props = {
  currentPath: "tasks" | "history";
  onNavigate: (path: "tasks" | "history") => void;
  properties: Property[];
  propertyFilter: string;
  onPropertyFilterChange: (id: string) => void;
  onAddTask: () => void;
};

export function Sidebar({
  currentPath,
  onNavigate,
  properties,
  propertyFilter,
  onPropertyFilterChange,
  onAddTask,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">F</div>
        <h1 className="sidebar__brand-name">Fernwood</h1>
      </div>

      <nav className="sidebar__nav">
        <button
          type="button"
          className={cn("sidebar__nav-item", currentPath === "tasks" && "is-active")}
          onClick={() => onNavigate("tasks")}
        >
          <span className="sidebar__nav-icon"><ListChecks size={16} /></span>
          All tasks
        </button>
        <button
          type="button"
          className={cn("sidebar__nav-item", currentPath === "history" && "is-active")}
          onClick={() => onNavigate("history")}
        >
          <span className="sidebar__nav-icon"><History size={16} /></span>
          History
        </button>
      </nav>

      <div className="sidebar__section">
        <span className="section-label">Properties</span>
      </div>
      <nav className="sidebar__properties">
        <PropertyButton
          label="All properties"
          dot="white"
          active={propertyFilter === "all"}
          onClick={() => onPropertyFilterChange("all")}
        />
        {properties.map((p) => (
          <PropertyButton
            key={p.id}
            label={p.name}
            dot="fern"
            active={propertyFilter === p.id}
            onClick={() => onPropertyFilterChange(p.id)}
          />
        ))}
      </nav>

      <div className="sidebar__cta">
        <button type="button" className="btn btn--primary btn--primary--block" onClick={onAddTask}>
          <Plus size={16} />
          Add task
        </button>
      </div>
    </aside>
  );
}

function PropertyButton({
  label, dot, active, onClick,
}: {
  label: string; dot: "fern" | "white"; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("sidebar__nav-item", active && "is-active")}
    >
      <span
        className={cn(
          "sidebar__dot",
          dot === "white" ? "sidebar__dot--white" : "sidebar__dot--fern",
        )}
      />
      <span className="task-row__meta-text">{label}</span>
    </button>
  );
}
