import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

// Users
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: (params) => api.get('/users/history', { params }),
  changePassword: (data) => api.put('/users/change-password', data),
  getLeaderboard: () => api.get('/users/leaderboard'),
};

// Interviews
export const interviewAPI = {
  generate: (data) => api.post('/interviews/generate', data),
  getAll: (params) => api.get('/interviews', { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  start: (id) => api.put(`/interviews/${id}/start`),
  complete: (id, data) => api.put(`/interviews/${id}/complete`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// Answers
export const answerAPI = {
  submit: (data) => api.post('/answers/submit', data),
  getByInterview: (interviewId) => api.get(`/answers/interview/${interviewId}`),
  getById: (id) => api.get(`/answers/${id}`),
};

// Coding
export const codingAPI = {
  getAll: (params) => api.get('/coding', { params }),
  getById: (id) => api.get(`/coding/${id}`),
  submit: (id, data) => api.post(`/coding/${id}/submit`, data),
  getSubmissions: () => api.get('/coding/submissions'),
  create: (data) => api.post('/coding', data),
};

// Resume
export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  generateQuestions: () => api.post('/resume/generate-questions'),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getDetailed: (params) => api.get('/analytics/detailed', { params }),
  getCareerSuggestions: () => api.get('/analytics/career-suggestions'),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  promoteUser: (id) => api.put(`/admin/users/${id}/promote`),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
