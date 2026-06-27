import { Link, useRouterState } from "@tanstack/react-router";
import { ListChecks, History, Plus, Building2 } from "lucide-react";
import faviconAsset from "@/assets/fernwood-favicon.png.asset.json";
import { useStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";


export function AppSidebar() {
  const properties = useStore((s) => s.properties);
  const propertyFilter = useUIStore((s) => s.propertyFilter);
  const setPropertyFilter = useUIStore((s) => s.setPropertyFilter);
  const openAddTask = useUIStore((s) => s.openAddTask);
  const openAddProperty = useUIStore((s) => s.openAddProperty);

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

      <div className="mt-10 px-7 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
          Properties
        </span>
        <button
          onClick={openAddProperty}
          className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          aria-label="Add property"
        >
          <Plus className="size-4" />
        </button>
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

      <div className="p-4 space-y-2">
        <button
          onClick={openAddTask}
          className="w-full flex items-center justify-center gap-2 bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90 transition-colors"
        >
          <Plus className="size-4" />
          Add task
        </button>
        <SignOutButton />
      </div>
    </aside>
  );
}

function SignOutButton() {
  const signOut = useSignOut();
  return (
    <button
      onClick={signOut}
      className="w-full flex items-center justify-center gap-2 text-sidebar-foreground/55 hover:text-sidebar-foreground text-xs py-2 rounded-md hover:bg-white/5"
    >
      <LogOut className="size-3.5" />
      Sign out
    </button>
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
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="md:hidden sticky top-0 z-30 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={faviconAsset.url}
          alt="Fernwood"
          className="size-7 rounded-md object-cover"
        />
        <h1 className="font-display font-semibold text-base tracking-tight">Fernwood</h1>
        <div className="ml-auto flex items-center gap-1 text-xs">
          <Link
            to="/"
            className={cn(
              "px-2.5 py-1 rounded-md",
              pathname === "/" ? "bg-white/10" : "text-sidebar-foreground/60",
            )}
          >
            Tasks
          </Link>
          <Link
            to="/history"
            className={cn(
              "px-2.5 py-1 rounded-md",
              pathname === "/history" ? "bg-white/10" : "text-sidebar-foreground/60",
            )}
          >
            History
          </Link>
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center gap-2">
        <Building2 className="size-3.5 text-sidebar-foreground/50" />
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="bg-transparent text-sm font-medium text-sidebar-foreground/90 focus:outline-none"
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
