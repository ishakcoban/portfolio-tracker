import type { StateCreator } from "zustand";

export interface PortfolioState {
  pID: number;
  setPortfolioId: (pID: number) => void;
}

export const createPortfolioSlice: StateCreator<PortfolioState> = (set, get) => ({
  pID: -1,
  setPortfolioId: (pID) => set({ pID }),
});
