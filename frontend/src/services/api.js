import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // Django backend URL
  withCredentials: true,  // Important for handling sessions
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Add CSRF token to requests
api.interceptors.request.use(config => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;
