import api from './api';

export const verifyCertificate = async (code: string) => {
  const response = await api.get(`/verify/${code}`);
  return response.data;
};

