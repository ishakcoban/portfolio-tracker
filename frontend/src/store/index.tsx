import { create } from "zustand";
import {
  createCurrencySlice,
  type CurrencyState,
} from "./slices/CurrencySlice";
import {
  createPortfolioSlice,
  type PortfolioState,
} from "./slices/PortfolioSlice";

export const useStore = create<CurrencyState & PortfolioState>()((...args) => ({
  ...createCurrencySlice(...args),
  ...createPortfolioSlice(...args),
}));
