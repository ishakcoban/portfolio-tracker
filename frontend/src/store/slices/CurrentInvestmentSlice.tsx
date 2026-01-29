import type { StateCreator } from "zustand";

export interface CurrentInvestmentState {
  currentInvestment: {
    byUSD: number;
    byEURO: number;
    byTRY: number;
  };

  setCurrentInvestment: (currentInvestment: {
    byUSD: number;
    byEURO: number;
    byTRY: number;
  }) => void;
}

export const createCurrentInvestmentSlice: StateCreator<
  CurrentInvestmentState
> = (set, get) => ({
  currentInvestment: {
    byUSD: 0,
    byEURO: 0,
    byTRY: 0,
  },
  setCurrentInvestment: (currentInvestment) => set({ currentInvestment }),
});
