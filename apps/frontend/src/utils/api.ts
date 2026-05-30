import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoint functions
export const authAPI = {
  register: (data: { email: string; password: string; full_name: string; profession: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put('/users/me', data),
  getById: (id: string) => api.get(`/users/${id}`),
};

export const portfolioAPI = {
  create: (data: Record<string, unknown>) => api.post('/portfolios', data),
  getById: (id: string) => api.get(`/portfolios/${id}`),
  getBySlug: (slug: string) => api.get(`/portfolios/slug/${slug}`),
  getByUser: (userId: string) => api.get(`/users/${userId}/portfolios`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/portfolios/${id}`, data),
  delete: (id: string) => api.delete(`/portfolios/${id}`),
  list: (params: Record<string, string | number>) => api.get('/portfolios', { params }),
};

export const jobAPI = {
  create: (data: Record<string, unknown>) => api.post('/jobs', data),
  getById: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  list: (params: Record<string, string | number>) => api.get('/jobs', { params }),
};

export const searchAPI = {
  searchPortfolios: (params: Record<string, string | number>) =>
    api.get('/search/portfolios', { params }),
  searchJobs: (params: Record<string, string | number>) =>
    api.get('/search/jobs', { params }),
  matchForJob: (jobId: string, topK = 10) =>
    api.get(`/match/job/${jobId}`, { params: { top_k: topK } }),
  matchForPortfolio: (portfolioId: string, topK = 10) =>
    api.get(`/match/portfolio/${portfolioId}`, { params: { top_k: topK } }),
};
