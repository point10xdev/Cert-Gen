import api from './api'; // Import the configured Axios instance

// ✅ Type definition for dashboard statistics
export interface DashboardStats {
  templates: number;    // Total number of certificate templates
  certificates: number; // Total number of certificates generated
  verified: number;     // Total number of certificates verified
}

// ✅ Fetch dashboard stats from backend
export const getStats = async (): Promise<DashboardStats> => {
  // GET request to /stats endpoint
  const response = await api.get('/stats');
  return response.data; // Return the stats object (templates, certificates, verified)
};
