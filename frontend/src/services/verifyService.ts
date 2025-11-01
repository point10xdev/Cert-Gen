import api from './api'; // Import the configured Axios instance

// ✅ Verify certificate via URL or QR code
// Used when the verification link (with code) is opened directly
export const verifyCertificate = async (code: string) => {
  // GET request to /verify/:code to fetch certificate details
  const response = await api.get(`/verify/${code}`);
  return response.data; // Return verification result (e.g., valid/invalid, certificate info)
};

// ✅ Verify certificate manually via form input
// Used when the user enters code and name manually
export const verifyCertificateDetails = async (code: string, name: string) => {
  // POST request to /verify/details with both code and name
  const response = await api.post('/verify/details', { code, name });
  return response.data; // Return verification status or error message
};
