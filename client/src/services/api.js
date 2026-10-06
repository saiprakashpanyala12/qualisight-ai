import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qualisight_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('qualisight_token');
      localStorage.removeItem('qualisight_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

// Inspection endpoints
export const inspectApi = {
  analyze: (formData) => api.post('/inspect/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: (params) => api.get('/inspect/history', { params }),
  getById: (id) => api.get(`/inspect/${id}`),
  delete: (id) => api.delete(`/inspect/${id}`)
};

// Analytics endpoints
export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary')
};

export default api;
