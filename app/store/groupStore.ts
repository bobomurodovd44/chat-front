import { create } from "zustand";

export type Group = {
  _id: string;
  name: string;
  type: "private" | "group";
};

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
};

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
}));
