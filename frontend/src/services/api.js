
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/csrf/`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include CSRF token
api.interceptors.request.use(async (config) => {
  if (config.method !== 'get') {
    try {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRFToken'] = token;
      }
    } catch (error) {
      console.error('Error in interceptor:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  checkAuth: () => api.get('/auth/user/'),
  deleteAccount: () => api.post('/auth/delete_account/'),
};

export const spotifyAPI = {
  authorize: () => api.get('/spotify/auth/'),
  callback: (data) => api.post('/spotify/callback/', data),
  getUserPlaylists: () => api.get('/spotify/playlists/'),
  getLatestWrap: () => api.get('/spotify/wraps/latest/'),
  getWrappedData: () => api.get('/spotify/wrapped/'),
  getWrapHistory: () => api.get('/spotify/wraps/'),
  getWrapDetail: (wrapId) => api.get(`/spotify/wraps/${wrapId}/`),
  deleteWrap: (wrapId) => api.delete(`/spotify/wraps/${wrapId}/`),
  createWrapped: (timeRange) => 
    api.post('/spotify/wrapped/create/', 
      { time_range: timeRange },
      { withCredentials: true }
    ),
};

export default api;
