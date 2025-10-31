import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // ✅ dynamic base URL for dev/prod
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // set true if using cookies for auth
});

// ✅ Add Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If the data is FormData, remove Content-Type header to let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle common API errors globally (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response from server. Check your backend connection.');
    } else {
      console.error('Axios error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
