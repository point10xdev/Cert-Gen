import api from './api'; // Import pre-configured Axios instance for API calls

// ✅ Type definition for a certificate template
export interface Template {
  id: number;                // Unique ID of the template
  name: string;              // Template name
  svg_content: string | null; // Raw SVG content (if available)
  template_type?: string;    // Optional type/category of template
  placeholders: string[];    // Dynamic fields (e.g., {name}, {event})
  file_url?: string;         // Optional file URL (for download or preview)
  created_at: string;        // Creation timestamp
}

// ✅ Fetch all templates from the backend
export const getTemplates = async (): Promise<Template[]> => {
  // GET request to /template endpoint
  const response = await api.get('/template');
  return response.data; // Return list of templates
};

// ✅ Upload a new template file (e.g., SVG or image)
export const uploadTemplate = async (file: File, name: string): Promise<Template> => {
  const formData = new FormData(); // Create form data for file upload
  formData.append('template', file); // Attach file
  formData.append('name', name);     // Attach template name
  
  // POST request to /template/upload endpoint
  const response = await api.post('/template/upload', formData);
  return response.data; // Return uploaded template info
};

// ✅ Update an existing template’s name
export const updateTemplate = async (id: number, name: string): Promise<Template> => {
  // PUT request to /template/:id with updated name
  const response = await api.put(`/template/${id}`, { name });
  return response.data; // Return updated template data
};

// ✅ Delete a template by ID
export const deleteTemplate = async (id: number): Promise<any> => {
  // DELETE request to /template/:id
  const response = await api.delete(`/template/${id}`);
  return response.data; // Return server response (e.g., success message)
};
