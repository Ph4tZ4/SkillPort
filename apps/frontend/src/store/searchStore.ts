import { create } from 'zustand';
import { searchAPI } from '../utils/api';

interface SearchState {
  query: string;
  results: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: Record<string, string>;

  setQuery: (query: string) => void;
  setFilters: (filters: Record<string, string>) => void;
  searchPortfolios: () => Promise<void>;
  searchJobs: () => Promise<void>;
  setPage: (page: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: {},

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  setPage: (page) => set({ page }),

  searchPortfolios: async () => {
    const { query, page, pageSize, filters } = get();
    set({ isLoading: true, error: null });
    try {
      const { data } = await searchAPI.searchPortfolios({ q: query, page, page_size: pageSize, ...filters });
      set({
        results: data.items || [],
        total: data.total,
        totalPages: data.total_pages,
        isLoading: false,
      });
    } catch {
      set({ error: 'Search failed', isLoading: false });
    }
  },

  searchJobs: async () => {
    const { query, page, pageSize, filters } = get();
    set({ isLoading: true, error: null });
    try {
      const { data } = await searchAPI.searchJobs({ q: query, page, page_size: pageSize, ...filters });
      set({
        results: data.items || [],
        total: data.total,
        totalPages: data.total_pages,
        isLoading: false,
      });
    } catch {
      set({ error: 'Search failed', isLoading: false });
    }
  },

  reset: () => set({ query: '', results: [], total: 0, page: 1, totalPages: 0, filters: {} }),
}));
