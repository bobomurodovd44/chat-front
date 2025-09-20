// store/paginationStore.ts
import { create } from "zustand";

interface PaginationState {
  total: number;
  limit: number;
  skip: number;
  setTotal: (total: number) => void;
  setLimit: (limit: number) => void;
  setSkip: (skip: number) => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  total: 0,
  limit: 15,
  skip: 0,

  setTotal: (total) => set({ total }),
  setLimit: (limit) => set({ limit }),
  setSkip: (skip) => set({ skip }),
}));
