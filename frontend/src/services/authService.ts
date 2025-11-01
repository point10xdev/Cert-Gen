import api from './api'; // Import the pre-configured Axios instance

// ✅ Type definition for login form data
export interface LoginData {
  username: string;
  password: string;
}

// ✅ Type definition for registration form data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// ✅ Send login request to backend
export const login = async (data: LoginData) => {
  // POST /auth/login with username & password
  const response = await api.post('/auth/login', data);
  return response.data; // Return response payload (e.g., token, user info)
};

// ✅ Send registration request to backend
export const register = async (data: RegisterData) => {
  // POST /auth/register with username, email & password
  const response = await api.post('/auth/register', data);
  return response.data; // Return server response (e.g., success message)
};

// ✅ Logout function: clear local storage and redirect to login page
export const logout = () => {
  localStorage.removeItem('token'); // Remove auth token
  localStorage.removeItem('user');  // Remove user details if stored
  window.location.href = '/login';  // Redirect to login screen
};

// ✅ Check if user is logged in (token present)
export const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Returns true if token exists
};
