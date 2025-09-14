import { create } from "zustand";

type Group = {
  _id: string;
  name: string;
  type: "private" | "group";
};

type selectedGroupStore = {
  selectedGroup: Group | null;
  setSelectedGroup: (selectedGroup: Group | null) => void;
};

export const useSelectedGroupStore = create<selectedGroupStore>((set) => ({
  selectedGroup: null,
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
}));
