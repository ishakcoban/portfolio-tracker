import { create } from "zustand";
import {
  createCurrencySlice,
  type CurrencyState,
} from "./slices/CurrencySlice";
import {
  createPortfolioSlice,
  type PortfolioState,
} from "./slices/PortfolioSlice";
import {
  createCurrentInvestmentSlice,
  type CurrentInvestmentState,
} from "./slices/CurrentInvestmentSlice";

export const useStore = create<
  CurrencyState & PortfolioState & CurrentInvestmentState
>()((...args) => ({
  ...createCurrencySlice(...args),
  ...createPortfolioSlice(...args),
  ...createCurrentInvestmentSlice(...args),
}));
