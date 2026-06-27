import { create } from "zustand";
import { addDays, subDays, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

export type Property = {
  id: string;
  name: string;
  detail?: string;
};

export type Recurrence =
  | { kind: "once" }
  | { kind: "recurring"; everyDays: number; label: string };

export type MaintenanceEvent = {
  id: string;
  taskId: string;
  completedAt: string;
  by?: string;
  note?: string;
};

export type Task = {
  id: string;
  title: string;
  propertyId: string;
  recurrence: Recurrence;
  nextDueAt: string;
  createdAt: string;
  notes?: string;
};

type State = {
  properties: Property[];
  tasks: Task[];
  events: MaintenanceEvent[];
  initialized: boolean;
  loading: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addProperty: (p: Omit<Property, "id">) => string;
  addTask: (t: Omit<Task, "id" | "createdAt">) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  completeTask: (
    taskId: string,
    opts?: { completedAt?: string; note?: string; by?: string },
  ) => void;
  updateEvent: (
    id: string,
    patch: Partial<Omit<MaintenanceEvent, "id" | "taskId">>,
  ) => void;
  deleteEvent: (id: string) => void;
};

// ---------- Row <-> App mappers ----------

type PropertyRow = { id: string; name: string; detail: string | null };
type TaskRow = {
  id: string;
  property_id: string;
  title: string;
  recurrence_kind: "once" | "recurring";
  recurrence_every_days: number | null;
  recurrence_label: string | null;
  next_due_at: string;
  notes: string | null;
  created_at: string;
};
type EventRow = {
  id: string;
  task_id: string;
  completed_at: string;
  by_name: string | null;
  note: string | null;
};

function propertyFromRow(r: PropertyRow): Property {
  return { id: r.id, name: r.name, detail: r.detail ?? undefined };
}
function taskFromRow(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    propertyId: r.property_id,
    recurrence:
      r.recurrence_kind === "recurring"
        ? {
            kind: "recurring",
            everyDays: r.recurrence_every_days ?? 0,
            label: r.recurrence_label ?? "",
          }
        : { kind: "once" },
    nextDueAt: r.next_due_at,
    createdAt: r.created_at,
    notes: r.notes ?? undefined,
  };
}
function eventFromRow(r: EventRow): MaintenanceEvent {
  return {
    id: r.id,
    taskId: r.task_id,
    completedAt: r.completed_at,
    by: r.by_name ?? undefined,
    note: r.note ?? undefined,
  };
}

function taskRecurrenceCols(r: Recurrence) {
  return r.kind === "recurring"
    ? {
        recurrence_kind: "recurring" as const,
        recurrence_every_days: r.everyDays,
        recurrence_label: r.label,
      }
    : {
        recurrence_kind: "once" as const,
        recurrence_every_days: null,
        recurrence_label: null,
      };
}

function newId() {
  return (globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)) as string;
}

// ---------- Demo seed (inserted on first sign-in) ----------

async function seedDemoData(userId: string) {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const propIds = {
    "oak-ridge": newId(),
    "pine-harbor": newId(),
    "fern-gully": newId(),
    "cedar-row": newId(),
  };

  const props = [
    { id: propIds["oak-ridge"], name: "Oak Ridge Estate", detail: "Main Building" },
    { id: propIds["pine-harbor"], name: "Pine Harbor", detail: "12 units" },
    { id: propIds["fern-gully"], name: "Fern Gully Lodge", detail: "Cabin + outbuildings" },
    { id: propIds["cedar-row"], name: "Cedar Row Duplex", detail: "2 units" },
  ].map((p) => ({ ...p, owner_user_id: userId }));

  const { error: pErr } = await supabase.from("properties").insert(props);
  if (pErr) throw pErr;

  const taskIds: Record<string, string> = {};
  const T = (
    key: string,
    title: string,
    propKey: keyof typeof propIds,
    rec: Recurrence,
    due: Date,
    created: Date,
    notes?: string,
  ) => {
    const id = newId();
    taskIds[key] = id;
    return {
      id,
      property_id: propIds[propKey],
      title,
      next_due_at: iso(due),
      created_at: iso(created),
      notes: notes ?? null,
      ...taskRecurrenceCols(rec),
    };
  };

  const tasks = [
    T("t1", "HVAC Filter Replacement", "oak-ridge",
      { kind: "recurring", everyDays: 90, label: "Every 3 months" },
      subDays(now, 3), subMonths(now, 8),
      "Use HEPA-grade replacements. 3 main units in basement."),
    T("t2", "Smoke Detector Battery Check", "pine-harbor",
      { kind: "recurring", everyDays: 180, label: "Every 6 months" },
      subDays(now, 1), subMonths(now, 7)),
    T("t3", "Repair leaking kitchen faucet", "fern-gully",
      { kind: "once" }, subDays(now, 5), subDays(now, 10),
      "Tenant reported drip from cold side."),
    T("t4", "Gutter Debris Clearance", "pine-harbor",
      { kind: "recurring", everyDays: 180, label: "Twice a year" },
      addDays(now, 1), subMonths(now, 6)),
    T("t5", "Septic System Inspection", "oak-ridge",
      { kind: "recurring", everyDays: 365, label: "Annually" },
      addDays(now, 4), subMonths(now, 12)),
    T("t6", "Replace porch lightbulb", "cedar-row",
      { kind: "once" }, addDays(now, 3), subDays(now, 2)),
    T("t7", "Exterior Pressure Wash", "fern-gully",
      { kind: "recurring", everyDays: 90, label: "Quarterly" },
      addDays(now, 22), subMonths(now, 3)),
    T("t8", "Test sump pump", "oak-ridge",
      { kind: "recurring", everyDays: 60, label: "Every 2 months" },
      addDays(now, 18), subMonths(now, 4)),
    T("t9", "Chimney sweep", "fern-gully",
      { kind: "recurring", everyDays: 365, label: "Annually" },
      addDays(now, 45), subMonths(now, 11)),
  ];

  const { error: tErr } = await supabase.from("tasks").insert(tasks);
  if (tErr) throw tErr;

  const events = [
    { task_id: taskIds.t1, completed_at: iso(subMonths(now, 3)), by_name: "Mark Ross", note: "Replaced all 3 main unit filters. Used HEPA-grade replacements." },
    { task_id: taskIds.t1, completed_at: iso(subMonths(now, 6)), by_name: "Mark Ross", note: null },
    { task_id: taskIds.t1, completed_at: iso(subMonths(now, 9)), by_name: "Sarah Miller", note: null },
    { task_id: taskIds.t2, completed_at: iso(subMonths(now, 6)), by_name: "Sarah Miller", note: "All 8 detectors replaced." },
    { task_id: taskIds.t4, completed_at: iso(subMonths(now, 6)), by_name: "Mark Ross", note: "Heavy moss buildup on north side." },
    { task_id: taskIds.t5, completed_at: iso(subMonths(now, 12)), by_name: "Pro Septic Co.", note: null },
    { task_id: taskIds.t7, completed_at: iso(subMonths(now, 3)), by_name: "Mark Ross", note: null },
    { task_id: taskIds.t8, completed_at: iso(subDays(now, 42)), by_name: "Sarah Miller", note: "Float switch tested OK." },
    { task_id: taskIds.t8, completed_at: iso(subDays(now, 102)), by_name: "Sarah Miller", note: null },
    { task_id: taskIds.t9, completed_at: iso(subMonths(now, 12)), by_name: "Cascade Chimney Co.", note: null },
  ];

  const { error: eErr } = await supabase.from("events").insert(events);
  if (eErr) throw eErr;
}

// ---------- Store ----------

let hydratePromise: Promise<void> | null = null;

export const useStore = create<State>((set, get) => ({
  properties: [],
  tasks: [],
  events: [],
  initialized: false,
  loading: false,

  reset: () => set({ properties: [], tasks: [], events: [], initialized: false, loading: false }),

  hydrate: async () => {
    if (hydratePromise) return hydratePromise;
    hydratePromise = (async () => {
      set({ loading: true });
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          set({ properties: [], tasks: [], events: [], initialized: true, loading: false });
          return;
        }

        const [pRes, tRes, eRes] = await Promise.all([
          supabase.from("properties").select("id,name,detail").order("name"),
          supabase
            .from("tasks")
            .select(
              "id,property_id,title,recurrence_kind,recurrence_every_days,recurrence_label,next_due_at,notes,created_at",
            ),
          supabase
            .from("events")
            .select("id,task_id,completed_at,by_name,note")
            .order("completed_at", { ascending: false }),
        ]);

        if (pRes.error) throw pRes.error;
        if (tRes.error) throw tRes.error;
        if (eRes.error) throw eRes.error;

        let properties = (pRes.data ?? []).map(propertyFromRow);
        let tasks = (tRes.data ?? []).map(taskFromRow);
        let events = (eRes.data ?? []).map(eventFromRow);

        // First sign-in: seed demo data so the user lands in a populated app.
        if (properties.length === 0) {
          try {
            await seedDemoData(user.id);
            const [pRes2, tRes2, eRes2] = await Promise.all([
              supabase.from("properties").select("id,name,detail").order("name"),
              supabase
                .from("tasks")
                .select(
                  "id,property_id,title,recurrence_kind,recurrence_every_days,recurrence_label,next_due_at,notes,created_at",
                ),
              supabase
                .from("events")
                .select("id,task_id,completed_at,by_name,note")
                .order("completed_at", { ascending: false }),
            ]);
            properties = (pRes2.data ?? []).map(propertyFromRow);
            tasks = (tRes2.data ?? []).map(taskFromRow);
            events = (eRes2.data ?? []).map(eventFromRow);
          } catch (err) {
            console.error("Demo seed failed", err);
          }
        }

        set({ properties, tasks, events, initialized: true, loading: false });
      } catch (err) {
        console.error("Store hydrate failed", err);
        set({ initialized: true, loading: false });
      } finally {
        hydratePromise = null;
      }
    })();
    return hydratePromise;
  },

  addProperty: (p) => {
    const id = newId();
    const property: Property = { ...p, id };
    set((s) => ({ properties: [...s.properties, property] }));
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        set((s) => ({ properties: s.properties.filter((x) => x.id !== id) }));
        return;
      }
      const { error } = await supabase.from("properties").insert({
        id,
        owner_user_id: user.id,
        name: p.name,
        detail: p.detail ?? null,
      });
      if (error) {
        console.error("addProperty failed", error);
        set((s) => ({ properties: s.properties.filter((x) => x.id !== id) }));
      }
    })();
    return id;
  },

  addTask: (t) => {
    const id = newId();
    const createdAt = new Date().toISOString();
    const task: Task = { ...t, id, createdAt };
    set((s) => ({ tasks: [...s.tasks, task] }));
    (async () => {
      const { error } = await supabase.from("tasks").insert({
        id,
        property_id: t.propertyId,
        title: t.title,
        next_due_at: t.nextDueAt,
        notes: t.notes ?? null,
        ...taskRecurrenceCols(t.recurrence),
      });
      if (error) {
        console.error("addTask failed", error);
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }));
      }
    })();
    return id;
  },

  updateTask: (id, patch) => {
    const prev = get().tasks.find((t) => t.id === id);
    if (!prev) return;
    const next = { ...prev, ...patch };
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? next : t)) }));

    const dbPatch: TablesUpdate<"tasks"> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.propertyId !== undefined) dbPatch.property_id = patch.propertyId;
    if (patch.nextDueAt !== undefined) dbPatch.next_due_at = patch.nextDueAt;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
    if (patch.recurrence !== undefined) Object.assign(dbPatch, taskRecurrenceCols(patch.recurrence));

    (async () => {
      const { error } = await supabase.from("tasks").update(dbPatch).eq("id", id);
      if (error) {
        console.error("updateTask failed", error);
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? prev : t)) }));
      }
    })();
  },

  completeTask: (taskId, opts) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const completedAt = opts?.completedAt ?? new Date().toISOString();
    const evId = newId();
    const event: MaintenanceEvent = {
      id: evId,
      taskId,
      completedAt,
      by: opts?.by,
      note: opts?.note,
    };

    let updatedTask = task;
    if (task.recurrence.kind === "recurring") {
      const next = addDays(new Date(completedAt), task.recurrence.everyDays);
      updatedTask = { ...task, nextDueAt: next.toISOString() };
    }

    set((s) => ({
      events: [event, ...s.events],
      tasks: s.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));

    (async () => {
      const { error: insErr } = await supabase.from("events").insert({
        id: evId,
        task_id: taskId,
        completed_at: completedAt,
        by_name: opts?.by ?? null,
        note: opts?.note ?? null,
      });
      if (insErr) {
        console.error("completeTask insert failed", insErr);
        set((s) => ({
          events: s.events.filter((e) => e.id !== evId),
          tasks: s.tasks.map((t) => (t.id === taskId ? task : t)),
        }));
        return;
      }
      if (task.recurrence.kind === "recurring") {
        const { error: updErr } = await supabase
          .from("tasks")
          .update({ next_due_at: updatedTask.nextDueAt })
          .eq("id", taskId);
        if (updErr) console.error("completeTask reschedule failed", updErr);
      }
    })();
  },

  updateEvent: (id, patch) => {
    const prev = get().events.find((e) => e.id === id);
    if (!prev) return;
    const next = { ...prev, ...patch };
    set((s) => ({ events: s.events.map((e) => (e.id === id ? next : e)) }));

    const dbPatch: TablesUpdate<"events"> = {};
    if (patch.completedAt !== undefined) dbPatch.completed_at = patch.completedAt;
    if (patch.by !== undefined) dbPatch.by_name = patch.by ?? null;
    if (patch.note !== undefined) dbPatch.note = patch.note ?? null;

    (async () => {
      const { error } = await supabase.from("events").update(dbPatch).eq("id", id);
      if (error) {
        console.error("updateEvent failed", error);
        set((s) => ({ events: s.events.map((e) => (e.id === id ? prev : e)) }));
      }
    })();
  },

  deleteEvent: (id) => {
    const prev = get().events.find((e) => e.id === id);
    if (!prev) return;
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    (async () => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        console.error("deleteEvent failed", error);
        set((s) => ({ events: [prev, ...s.events] }));
      }
    })();
  },
}));

export type TaskStatus = "overdue" | "due-soon" | "later" | "completed";

export function taskStatus(t: Task, ref = new Date()): Exclude<TaskStatus, "completed"> {
  const due = new Date(t.nextDueAt);
  const diffDays = Math.floor((due.getTime() - ref.getTime()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due-soon";
  return "later";
}

export function eventsForTask(events: MaintenanceEvent[], taskId: string) {
  return events
    .filter((e) => e.taskId === taskId)
    .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
}

export function lastCompleted(events: MaintenanceEvent[], taskId: string) {
  return eventsForTask(events, taskId)[0];
}
