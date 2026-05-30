import { create } from 'zustand';
import { jobAPI } from '../utils/api';

interface Job {
  id: string;
  company_id: string;
  company_name: string;
  title: string;
  description: string;
  profession: string;
  location: string;
  remote: boolean;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  status: string;
  required_skills: Array<{ name: string; level: string }>;
  tags: string[];
  created_at: string;
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;

  fetchJobs: (params?: Record<string, string | number>) => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  createJob: (data: Record<string, unknown>) => Promise<void>;
  updateJob: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,

  fetchJobs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobAPI.list(params);
      set({ jobs: data.items || [], isLoading: false });
    } catch {
      set({ error: 'Failed to fetch jobs', isLoading: false });
    }
  },

  fetchJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobAPI.getById(id);
      set({ currentJob: data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch job', isLoading: false });
    }
  },

  createJob: async (data: Record<string, unknown>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: job } = await jobAPI.create(data);
      set((state) => ({ jobs: [job, ...state.jobs], isLoading: false }));
    } catch {
      set({ error: 'Failed to create job', isLoading: false });
    }
  },

  updateJob: async (id: string, data: Record<string, unknown>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await jobAPI.update(id, data);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? updated : j)),
        currentJob: state.currentJob?.id === id ? updated : state.currentJob,
        isLoading: false,
      }));
    } catch {
      set({ error: 'Failed to update job', isLoading: false });
    }
  },

  deleteJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await jobAPI.delete(id);
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
        isLoading: false,
      }));
    } catch {
      set({ error: 'Failed to delete job', isLoading: false });
    }
  },
}));
