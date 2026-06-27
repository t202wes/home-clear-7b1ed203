import { addDays, subDays, subMonths } from "date-fns";

export type Property = { id: string; name: string; detail?: string };

export type Recurrence =
  | { kind: "once" }
  | { kind: "recurring"; everyDays: number; label: string };

export type Task = {
  id: string;
  title: string;
  propertyId: string;
  recurrence: Recurrence;
  nextDueAt: string;
  createdAt: string;
  notes?: string;
};

export type MaintenanceEvent = {
  id: string;
  taskId: string;
  completedAt: string;
  by?: string;
  note?: string;
};

export type TaskStatus = "overdue" | "due-soon" | "later";

export function taskStatus(t: Task, ref = new Date()): TaskStatus {
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

const iso = (d: Date) => d.toISOString();
const now = new Date();

export const properties: Property[] = [
  { id: "oak-ridge", name: "Oak Ridge Estate", detail: "Main Building" },
  { id: "pine-harbor", name: "Pine Harbor", detail: "12 units" },
  { id: "fern-gully", name: "Fern Gully Lodge", detail: "Cabin + outbuildings" },
  { id: "cedar-row", name: "Cedar Row Duplex", detail: "2 units" },
];

export const tasks: Task[] = [
  { id: "t1", title: "HVAC Filter Replacement", propertyId: "oak-ridge",
    recurrence: { kind: "recurring", everyDays: 90, label: "Every 3 months" },
    nextDueAt: iso(subDays(now, 3)), createdAt: iso(subMonths(now, 8)),
    notes: "Use HEPA-grade replacements. 3 main units in basement." },
  { id: "t2", title: "Smoke Detector Battery Check", propertyId: "pine-harbor",
    recurrence: { kind: "recurring", everyDays: 180, label: "Every 6 months" },
    nextDueAt: iso(subDays(now, 1)), createdAt: iso(subMonths(now, 7)) },
  { id: "t3", title: "Repair leaking kitchen faucet", propertyId: "fern-gully",
    recurrence: { kind: "once" },
    nextDueAt: iso(subDays(now, 5)), createdAt: iso(subDays(now, 10)),
    notes: "Tenant reported drip from cold side." },
  { id: "t4", title: "Gutter Debris Clearance", propertyId: "pine-harbor",
    recurrence: { kind: "recurring", everyDays: 180, label: "Twice a year" },
    nextDueAt: iso(addDays(now, 1)), createdAt: iso(subMonths(now, 6)) },
  { id: "t5", title: "Septic System Inspection", propertyId: "oak-ridge",
    recurrence: { kind: "recurring", everyDays: 365, label: "Annually" },
    nextDueAt: iso(addDays(now, 4)), createdAt: iso(subMonths(now, 12)) },
  { id: "t6", title: "Replace porch lightbulb", propertyId: "cedar-row",
    recurrence: { kind: "once" },
    nextDueAt: iso(addDays(now, 3)), createdAt: iso(subDays(now, 2)) },
  { id: "t7", title: "Exterior Pressure Wash", propertyId: "fern-gully",
    recurrence: { kind: "recurring", everyDays: 90, label: "Quarterly" },
    nextDueAt: iso(addDays(now, 22)), createdAt: iso(subMonths(now, 3)) },
  { id: "t8", title: "Test sump pump", propertyId: "oak-ridge",
    recurrence: { kind: "recurring", everyDays: 60, label: "Every 2 months" },
    nextDueAt: iso(addDays(now, 18)), createdAt: iso(subMonths(now, 4)) },
  { id: "t9", title: "Chimney sweep", propertyId: "fern-gully",
    recurrence: { kind: "recurring", everyDays: 365, label: "Annually" },
    nextDueAt: iso(addDays(now, 45)), createdAt: iso(subMonths(now, 11)) },
];

export const events: MaintenanceEvent[] = [
  { id: "e1", taskId: "t1", completedAt: iso(subMonths(now, 3)), by: "Mark Ross", note: "Replaced all 3 main unit filters. Used HEPA-grade replacements." },
  { id: "e2", taskId: "t1", completedAt: iso(subMonths(now, 6)), by: "Mark Ross" },
  { id: "e3", taskId: "t1", completedAt: iso(subMonths(now, 9)), by: "Sarah Miller" },
  { id: "e4", taskId: "t2", completedAt: iso(subMonths(now, 6)), by: "Sarah Miller", note: "All 8 detectors replaced." },
  { id: "e5", taskId: "t4", completedAt: iso(subMonths(now, 6)), by: "Mark Ross", note: "Heavy moss buildup on north side." },
  { id: "e6", taskId: "t5", completedAt: iso(subMonths(now, 12)), by: "Pro Septic Co." },
  { id: "e7", taskId: "t7", completedAt: iso(subMonths(now, 3)), by: "Mark Ross" },
  { id: "e8", taskId: "t8", completedAt: iso(subDays(now, 42)), by: "Sarah Miller", note: "Float switch tested OK." },
  { id: "e9", taskId: "t8", completedAt: iso(subDays(now, 102)), by: "Sarah Miller" },
  { id: "e10", taskId: "t9", completedAt: iso(subMonths(now, 12)), by: "Cascade Chimney Co." },
];
