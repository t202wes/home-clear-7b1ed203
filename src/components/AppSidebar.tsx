import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ListChecks, History, Plus, Building2, Menu } from "lucide-react";
import faviconAsset from "@/assets/fernwood-favicon.png.asset.json";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";



export function AppSidebar() {
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);
  const openAddTask = useUIStore((s) => s.openAddTask);

  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <img
          src={faviconAsset.url}
          alt="Fernwood"
          className="size-7 rounded-md object-cover"
        />
        <h1 className="font-display font-semibold text-lg tracking-tight">Fernwood</h1>
      </div>

      <nav className="px-4 space-y-1">
        <NavLink
          to="/"
          icon={<ListChecks className="size-4" />}
          label="All tasks"
          active={pathname === "/"}
        />
        <NavLink
          to="/history"
          icon={<History className="size-4" />}
          label="History"
          active={pathname === "/history"}
        />
      </nav>

      <div className="mt-10 px-7">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
          Properties
        </span>
      </div>
      <nav className="mt-3 px-4 space-y-0.5 flex-1 overflow-y-auto">
        <PropertyButton
          label="All properties"
          dot="white"
          active={propertyFilter === "all"}
          onClick={() => setPropertyFilter("all")}
        />
        {properties.map((p) => (
          <PropertyButton
            key={p.id}
            label={p.name}
            dot="fern"
            active={propertyFilter === p.id}
            onClick={() => setPropertyFilter(p.id)}
          />
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={openAddTask}
          className="w-full flex items-center justify-center gap-2 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90 transition-colors"
        >
          <Plus className="size-4" />
          Add task
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-white/5 text-sidebar-foreground"
          : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground",
      )}
    >
      <span className="text-sidebar-foreground/70">{icon}</span>
      {label}
    </Link>
  );
}

function PropertyButton({
  label,
  dot,
  active,
  onClick,
}: {
  label: string;
  dot: "fern" | "white";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
        active
          ? "bg-white/5 text-sidebar-foreground"
          : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          dot === "white" ? "bg-white/60" : active ? "bg-fern" : "bg-fern/40",
        )}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function MobileTopBar() {
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);
  const openAddTask = useUIStore((s) => s.openAddTask);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-30 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-3/4 max-w-xs bg-sidebar text-sidebar-foreground p-0 border-r border-sidebar-foreground/10">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between tasks, history, and properties.
            </SheetDescription>
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-between border-b border-sidebar-foreground/10">
                <div className="flex items-center gap-3">
                  <img
                    src={faviconAsset.url}
                    alt="Fernwood"
                    className="size-7 rounded-md object-cover"
                  />
                  <h1 className="font-display font-semibold text-base tracking-tight text-sidebar-foreground">Fernwood</h1>
                </div>
              </div>

              <nav className="px-4 py-3 space-y-1">
                <MobileNavLink
                  to="/"
                  icon={<ListChecks className="size-5" />}
                  label="All tasks"
                  active={pathname === "/"}
                  onClick={() => setMenuOpen(false)}
                />
                <MobileNavLink
                  to="/history"
                  icon={<History className="size-5" />}
                  label="History"
                  active={pathname === "/history"}
                  onClick={() => setMenuOpen(false)}
                />
              </nav>

              <div className="mt-2 px-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                  Properties
                </span>
              </div>
              <nav className="mt-2 px-4 space-y-0.5 flex-1 overflow-y-auto">
                <PropertyButton
                  label="All properties"
                  dot="white"
                  active={propertyFilter === "all"}
                  onClick={() => {
                    setPropertyFilter("all");
                    setMenuOpen(false);
                  }}
                />
                {properties.map((p) => (
                  <PropertyButton
                    key={p.id}
                    label={p.name}
                    dot="fern"
                    active={propertyFilter === p.id}
                    onClick={() => {
                      setPropertyFilter(p.id);
                      setMenuOpen(false);
                    }}
                  />
                ))}
              </nav>

              <div className="p-4 border-t border-sidebar-foreground/10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openAddTask();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90 transition-colors"
                >
                  <Plus className="size-4" />
                  Add task
                </button>
              </div>
            </div>
          </SheetContent>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-white/5 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </Sheet>

        <div className="flex-1 flex justify-center">
          <div className="inline-flex items-center rounded-lg bg-white/5 p-1">
            <Link
              to="/"
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                pathname === "/"
                  ? "bg-white/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
              )}
            >
              Tasks
            </Link>
            <Link
              to="/history"
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                pathname === "/history"
                  ? "bg-white/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
              )}
            >
              History
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddTask}
          className="inline-flex items-center justify-center gap-1.5 bg-fern text-paper text-xs font-medium px-3 py-2 rounded-md hover:bg-fern/90 transition-colors shrink-0"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <Building2 className="size-3.5 text-sidebar-foreground/50 shrink-0" />
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="bg-transparent text-sm font-medium text-sidebar-foreground/90 focus:outline-none min-w-0 truncate"
          aria-label="Filter by property"
        >
          <option value="all" className="text-bark">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id} className="text-bark">{p.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function MobileNavLink({
  to,
  icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
        active
          ? "bg-white/10 text-sidebar-foreground"
          : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground",
      )}
    >
      <span className={cn("size-5", active ? "text-sidebar-foreground" : "text-sidebar-foreground/70")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
