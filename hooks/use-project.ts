import { create } from "zustand";

interface ProjectStore {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
}

export const useProject = create<ProjectStore>((set) => ({
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  isCreating: false,
  setIsCreating: (value) => set({ isCreating: value }),
}));