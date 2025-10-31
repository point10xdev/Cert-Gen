import api from './api';

export interface Template {
  id: number;
  name: string;
  svg_content: string;
  placeholders: string[];
  file_url?: string;
  created_at: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get('/template');
  return response.data;
};

export const uploadTemplate = async (file: File, name: string): Promise<Template> => {
  const formData = new FormData();
  formData.append('template', file);
  formData.append('name', name);
  
  const response = await api.post('/template/upload', formData);
  return response.data;
};

