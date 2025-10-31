import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, type Template } from '../services/templateService';
import { generateCertificate, type GenerateData } from '../services/generateService';
import './Generate.css';

// These are the "standard" placeholders handled by the non-dynamic fields
const STANDARD_PLACEHOLDERS = ['NAME', 'EMAIL', 'EVENT', 'ID', 'QR'];

const GeneratePage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Store the full template object
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [event, setEvent] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // Add state for dynamic metadata
  const [metadata, setMetadata] = useState<{ [key: string]: string }>({});
  
  // Add state for PDF preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error: any) {
      toast.error('Failed to load templates');
    }
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === Number(templateId)) || null;
    setSelectedTemplate(template);
    // Clear dynamic data when template changes
    setMetadata({});
    // Clear preview when template changes
    setPreviewUrl(null);
  };

  // Handle dynamic field changes
  const handleMetadataChange = (key: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setLoading(true);
    // Clear old preview on new submission
    setPreviewUrl(null); 
    
    try {
      // Send metadata to the API
      const data: GenerateData = {
        name,
        email,
        templateId: selectedTemplate.id,
        sendEmail,
        event: event || undefined,
        metadata: metadata, // Pass the dynamic fields
      };
      
      const result = await generateCertificate(data);
      toast.success('Certificate generated successfully!');
      
      // --- FIX: Convert absolute URL to relative path for proxy ---
      // result.fileUrl = "http://localhost:5000/certificates/file.pdf"
      // We need "/certificates/file.pdf"
      const relativeUrl = new URL(result.fileUrl).pathname;
      
      // Set preview state to the relative path
      setPreviewUrl(relativeUrl);

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate which fields to render
  // Get all placeholders from template
  const allPlaceholders = selectedTemplate
    ? selectedTemplate.placeholders.map(p => p.replace(/\{\{/g, '').replace(/\}\}/g, ''))
    : [];

  // Find which ones are custom
  const customPlaceholders = Array.from(new Set( // Use Set to remove duplicates
    allPlaceholders
      .filter(p => !STANDARD_PLACEHOLDERS.includes(p.toUpperCase()))
  ));

  // Check if the {{EVENT}} placeholder exists
  const showEventField = allPlaceholders.some(p => p.toUpperCase() === 'EVENT');

  return (
    <div className="generate-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </header>

      {/* Updated page content layout */}
      <div className="page-content">
        
        {/* Column 1: Form */}
        <div className="form-container">
          <h1>Generate Certificate</h1>

          <form onSubmit={handleSubmit} className="generate-form">
            <div className="form-group">
              <label>Template</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                required
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Recipient Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Recipient Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Conditionally show Event field */}
            {showEventField && (
              <div className="form-group">
                <label>Event (Optional)</label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  placeholder="Summer Hackathon 2024"
                />
              </div>
            )}
            
            {/* Render dynamic fields */}
            {customPlaceholders.map(placeholder => (
              <div className="form-group" key={placeholder}>
                {/* Create a user-friendly label from the placeholder */}
                <label>
                  {placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase().replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  value={metadata[placeholder] || ''}
                  onChange={(e) => handleMetadataChange(placeholder, e.target.value)}
                  placeholder={`Enter value for ${placeholder}`}
                  required
                />
              </div>
            ))}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Send via email
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Generating...' : 'Generate & Preview'}
            </button>
          </form>
        </div>

        {/* Column 2: Preview */}
        <div className="preview-container">
          <h2>Preview</h2>
          {previewUrl ? (
            <>
              <iframe
                src={previewUrl}
                title="Certificate Preview"
                className="preview-iframe"
              />
              <a
                href={previewUrl}
                download={`certificate_${name.replace(/\s+/g, '_') || 'download'}.pdf`}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}
              >
                Download PDF
              </a>
            </>
          ) : (
            <div className="preview-placeholder">
              <p>{loading ? 'Generating preview...' : 'Generate a certificate to see the preview here.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;