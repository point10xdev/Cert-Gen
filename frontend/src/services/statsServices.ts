import api from './api';

export interface DashboardStats {
  templates: number;
  certificates: number;
  verified: number;
}

export const getStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/stats');
  return response.data;
};