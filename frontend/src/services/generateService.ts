import api from './api';

export interface GenerateData {
  name: string;
  email: string;
  templateId: number;
  sendEmail: boolean;
  event?: string;
  metadata?: any;
}

export interface Certificate {
  id: number;
  verification_code: string;
  recipient_name: string;
  recipient_email: string;
  template_id: number;
  file_url: string;
  qr_code_url?: string;
  metadata?: any;
  issued_at: string;
}

export const generateCertificate = async (data: GenerateData) => {
  const response = await api.post('/generate', data);
  return response.data;
};

export const bulkGenerate = async (recipients: any[], templateId: number, sendEmail: boolean) => {
  const response = await api.post('/generate/bulk', {
    recipients,
    templateId,
    sendEmail,
  });
  return response.data;
};

