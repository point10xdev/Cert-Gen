import api from './api'; // Import the pre-configured Axios instance

// ✅ Type definition for data required to generate a single certificate
export interface GenerateData {
  name: string;            // Recipient's name
  email: string;           // Recipient's email address
  templateId: number;      // ID of the certificate template
  sendEmail: boolean;      // Whether to send the certificate via email
  event?: string;          // Optional event name (if applicable)
  metadata?: any;          // Additional custom data (optional)
}

// ✅ Type definition for a generated certificate object
export interface Certificate {
  id: number;                     // Unique ID of the certificate
  verification_code: string;      // Code used for certificate verification
  recipient_name: string;         // Name of the recipient
  recipient_email: string;        // Email of the recipient
  template_id: number;            // Template used for generation
  file_url: string;               // Direct link to the generated certificate file
  qr_code_url?: string;           // Optional QR code for verification
  metadata?: any;                 // Optional extra data
  issued_at: string;              // Timestamp when the certificate was issued
}

// ✅ Generate a single certificate using provided data
export const generateCertificate = async (data: GenerateData) => {
  // POST request to /generate endpoint
  const response = await api.post('/generate', data);
  return response.data; // Return generated certificate details
};

// ✅ Generate certificates in bulk for multiple recipients
export const bulkGenerate = async (
  recipients: any[],     // List of recipient objects
  templateId: number,    // Template ID to use for all recipients
  sendEmail: boolean     // Whether to email all generated certificates
) => {
  // POST request to /generate/bulk endpoint
  const response = await api.post('/generate/bulk', {
    recipients,
    templateId,
    sendEmail,
  });
  return response.data; // Return response (e.g., success count, generated files)
};
