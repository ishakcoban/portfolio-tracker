import { create } from 'zustand';
import { createCurrencySlice, type CurrencyState } from './slices/CurrencySlice';

export const useStore = create<CurrencyState>()((...args) => ({
  ...createCurrencySlice(...args),
}));