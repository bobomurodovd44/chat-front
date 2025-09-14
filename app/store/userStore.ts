import { create } from "zustand";

type User = {
  _id: string;
  email: string;
  password?: string;
  fullName: string;
  username: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
