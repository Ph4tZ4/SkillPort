import { create } from 'zustand';
import { portfolioAPI } from '../utils/api';

interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  profession: string;
  summary: string;
  skills: Array<{ name: string; level: string; category: string; years_experience: number }>;
  sections: Array<{ id: string; type: string; title: string; description: string; order_index: number; content: unknown }>;
  tags: string[];
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;

  fetchPortfolios: (params?: Record<string, string | number>) => Promise<void>;
  fetchPortfolio: (id: string) => Promise<void>;
  fetchUserPortfolios: (userId: string) => Promise<void>;
  createPortfolio: (data: Record<string, unknown>) => Promise<Portfolio>;
  updatePortfolio: (id: string, data: Record<string, unknown>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,

  fetchPortfolios: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await portfolioAPI.list(params);
      set({ portfolios: data.items || [], isLoading: false });
    } catch {
      set({ error: 'Failed to fetch portfolios', isLoading: false });
    }
  },

  fetchPortfolio: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await portfolioAPI.getById(id);
      set({ currentPortfolio: data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch portfolio', isLoading: false });
    }
  },

  fetchUserPortfolios: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await portfolioAPI.getByUser(userId);
      set({ portfolios: data || [], isLoading: false });
    } catch {
      set({ error: 'Failed to fetch user portfolios', isLoading: false });
    }
  },

  createPortfolio: async (data: Record<string, unknown>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: portfolio } = await portfolioAPI.create(data);
      set((state) => ({ portfolios: [portfolio, ...state.portfolios], isLoading: false }));
      return portfolio;
    } catch {
      set({ error: 'Failed to create portfolio', isLoading: false });
      throw new Error('Failed to create portfolio');
    }
  },

  updatePortfolio: async (id: string, data: Record<string, unknown>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await portfolioAPI.update(id, data);
      set((state) => ({
        portfolios: state.portfolios.map((p) => (p.id === id ? updated : p)),
        currentPortfolio: state.currentPortfolio?.id === id ? updated : state.currentPortfolio,
        isLoading: false,
      }));
    } catch {
      set({ error: 'Failed to update portfolio', isLoading: false });
    }
  },

  deletePortfolio: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await portfolioAPI.delete(id);
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p.id !== id),
        currentPortfolio: state.currentPortfolio?.id === id ? null : state.currentPortfolio,
        isLoading: false,
      }));
    } catch {
      set({ error: 'Failed to delete portfolio', isLoading: false });
    }
  },

  setCurrentPortfolio: (portfolio) => set({ currentPortfolio: portfolio }),
}));
