import type { StateCreator } from 'zustand';

export interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const createCurrencySlice: StateCreator<CurrencyState> = (set, get) => ({
  currency: "USD",
  setCurrency: (currency) => set({ currency }),
});