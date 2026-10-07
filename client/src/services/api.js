import axios from 'axios';

// Dynamically determine backend URL (Vite environment or local fallback)
const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uno_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized / expired
      localStorage.removeItem('uno_token');
    }
    return Promise.reject(error);
  }
);

/* ==========================================================================
   API Service Endpoints
   ========================================================================== */

// --- Auth Endpoints ---
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// --- Object Storage (Avatar Upload) Endpoints ---
export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('userId', userId);

  const response = await api.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Returns { success: true, avatarUrl: "..." }
};

// --- Leaderboard & Stats Endpoints ---
export const getLeaderboard = async () => {
  const response = await api.get('/stats/leaderboard');
  return response.data;
};

export const getUserMatchHistory = async (userId) => {
  const response = await api.get(`/stats/history/${userId}`);
  return response.data;
};

export default api;