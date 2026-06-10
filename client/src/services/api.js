import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (!error.response) {
      toast.loading('Waking up server... please wait', { id: 'wake' });
      await new Promise((r) => setTimeout(r, 4000));
      toast.dismiss('wake');
      return api.request(error.config);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: (data) => api.post('/api/auth/refresh', data),
  me: () => api.get('/api/auth/me'),
};

export const stockAPI = {
  search: (q) => api.get('/api/stocks/search', { params: { q } }),
  getQuote: (symbol) => api.get(`/api/stocks/${symbol}/quote`),
  getHistory: (symbol, range) => api.get(`/api/stocks/${symbol}/history`, { params: { range } }),
  getNews: (symbol) => api.get(`/api/stocks/${symbol}/news`),
  getMarketStatus: () => api.get('/api/stocks/market-status'),
};

export const portfolioAPI = {
  get: () => api.get('/api/portfolio'),
  add: (data) => api.post('/api/portfolio/add', data),
  remove: (id) => api.delete(`/api/portfolio/${id}`),
  summary: () => api.get('/api/portfolio/summary'),
};

export const watchlistAPI = {
  get: () => api.get('/api/watchlist'),
  add: (symbol) => api.post('/api/watchlist/add', { symbol }),
  remove: (symbol) => api.delete(`/api/watchlist/${symbol}`),
};

export const mlAPI = {
  predict: (symbol) => api.get(`/api/ml/predict/${symbol}`),
};

export default api;