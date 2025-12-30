import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const poemAPI = {
  create: (data) => api.post('/poem', data),
  getAll: () => api.get('/poem'),
  getById: (id) => api.get(`/poem/${id}`),
  getByLink: (link) => api.get(`/poem/share/${link}`),
  update: (id, data) => api.put(`/poem/${id}`, data),
  delete: (id) => api.delete(`/poem/${id}`),
  search: (query) => api.get(`/poem/search?query=${query}`),
  getTags: () => api.get('/poem/tags'),
  getAnalytics: () => api.get('/poem/analytics'),
  like: (id) => api.post(`/poem/${id}/like`),
  updateNarration: (id, data) => api.put(`/poem/${id}/narration`, data),
};

export const commentAPI = {
  add: (poemId, data) => api.post(`/comment/${poemId}`, data),
  getAll: (poemId) => api.get(`/comment/${poemId}`),
  delete: (commentId) => api.delete(`/comment/${commentId}`),
};

export const narrationAPI = {
  getVoiceInfo: () => api.get('/poem/voice-info'),
  getBackgroundMusic: () => api.get('/poem/background-music'),
};


export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  getMyProfile: () => api.get('/profile/me/profile'),
  updateProfile: (data) => api.put('/profile/me/profile', data),
};

export default api;