import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

let refreshPromise = null;

/**
 * Stores auth tokens in localStorage.
 * @param {{accessToken?: string, refreshToken?: string}} tokens
 */
export function storeTokens(tokens) {
  if (tokens.accessToken) {
    localStorage.setItem('accessToken', tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

/**
 * Clears auth tokens from localStorage.
 */
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient.post('/auth/refresh', { refreshToken }).finally(() => {
            refreshPromise = null;
          });
        }

        const { data } = await refreshPromise;
        storeTokens(data);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: (payload) => api.post('/auth/refresh', payload),
  me: () => api.get('/auth/me')
};

export const stockAPI = {
  search: (query) => api.get('/stocks/search', { params: { q: query } }),
  quote: (symbol) => api.get(`/stocks/${symbol}/quote`),
  history: (symbol, range = '1W') => api.get(`/stocks/${symbol}/history`, { params: { range } }),
  news: (symbol) => api.get(`/stocks/${symbol}/news`),
  marketStatus: () => api.get('/stocks/market-status'),
  predict: (symbol, days = 7) => api.get(`/ml/${symbol}/predict`, { params: { days } })
};

export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  add: (payload) => api.post('/portfolio/add', payload),
  remove: (id) => api.delete(`/portfolio/${id}`),
  summary: () => api.get('/portfolio/summary')
};

export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (payload) => api.post('/watchlist/add', payload),
  remove: (symbol) => api.delete(`/watchlist/${symbol}`)
};

export default api;
