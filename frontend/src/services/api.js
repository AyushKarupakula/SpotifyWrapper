import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

// Interceptor to add CSRF token to all non-GET requests
api.interceptors.request.use((config) => {
  if (config.method !== 'get') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Define authAPI and spotifyAPI as before
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  checkAuth: () => api.get('/auth/user/'),
};

export const spotifyAPI = {
  authorize: () => api.get('/spotify/auth/'),
  callback: (data) => api.post('/spotify/callback/', data),
  getUserPlaylists: () => api.get('/spotify/playlists/'),
};

export default api;
