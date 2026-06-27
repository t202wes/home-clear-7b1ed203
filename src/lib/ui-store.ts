import { create } from "zustand";

type UIState = {
  propertyFilter: string; // property id or "all"
  setPropertyFilter: (v: string) => void;

  openTaskId: string | null;
  openTask: (id: string) => void;
  closeTask: () => void;

  addTaskOpen: boolean;
  openAddTask: () => void;
  closeAddTask: () => void;

  completeTaskId: string | null;
  openCompleteFor: (id: string) => void;
  closeComplete: () => void;

  editEventId: string | null;
  openEditEvent: (id: string) => void;
  closeEditEvent: () => void;

  editTaskId: string | null;
  openEditTask: (id: string) => void;
  closeEditTask: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  propertyFilter: "all",
  setPropertyFilter: (v) => set({ propertyFilter: v }),

  openTaskId: null,
  openTask: (id) => set({ openTaskId: id }),
  closeTask: () => set({ openTaskId: null }),

  addTaskOpen: false,
  openAddTask: () => set({ addTaskOpen: true }),
  closeAddTask: () => set({ addTaskOpen: false }),

  completeTaskId: null,
  openCompleteFor: (id) => set({ completeTaskId: id }),
  closeComplete: () => set({ completeTaskId: null }),

  editEventId: null,
  openEditEvent: (id) => set({ editEventId: id }),
  closeEditEvent: () => set({ editEventId: null }),

  editTaskId: null,
  openEditTask: (id) => set({ editTaskId: id }),
  closeEditTask: () => set({ editTaskId: null }),
}));
