import axios from 'axios';

// ✅ Create an Axios instance with default settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use backend URL from env or fallback to '/api'
  headers: {
    'Content-Type': 'application/json', // Default request content type
  },
  withCredentials: false, // Set to true if using cookies/sessions for authentication
});

// ✅ Request interceptor — runs before every API request
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData (e.g., file uploads), remove default Content-Type
    // so the browser can set the correct multipart boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Return the modified config to proceed with the request
    return config;
  },
  (error) => Promise.reject(error) // Reject the promise if request setup fails
);

// ✅ Response interceptor — handles responses and global errors
api.interceptors.response.use(
  (response) => response, // Return response directly if successful

  (error) => {
    // If the server responded with an error status
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., expired or invalid token)
        localStorage.removeItem('token'); // Remove old token
        window.location.href = '/login'; // Redirect user to login page
      }
    } 
    // If request was made but no response received (e.g., network issue)
    else if (error.request) {
      console.error('No response from server. Check your backend connection.');
    } 
    // If Axios itself threw an error (e.g., setup issue)
    else {
      console.error('Axios error:', error.message);
    }

    // Always reject to let individual API calls handle errors if needed
    return Promise.reject(error);
  }
);

// ✅ Export the configured Axios instance for reuse across the app
export default api;
