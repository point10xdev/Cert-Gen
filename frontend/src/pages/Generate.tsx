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
  
  // --- MODIFICATION 1: Store the full template object ---
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  // --- END MODIFICATION 1 ---

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [event, setEvent] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- MODIFICATION 2: Add state for dynamic metadata ---
  const [metadata, setMetadata] = useState<{ [key: string]: string }>({});
  // --- END MODIFICATION 2 ---

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

  // --- MODIFICATION 3: Handle template selection ---
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === Number(templateId)) || null;
    setSelectedTemplate(template);
    // Clear dynamic data when template changes
    setMetadata({});
  };
  // --- END MODIFICATION 3 ---

  // --- MODIFICATION 4: Handle dynamic field changes ---
  const handleMetadataChange = (key: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  // --- END MODIFICATION 4 ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setLoading(true);
    try {
      // --- MODIFICATION 5: Send metadata to the API ---
      const data: GenerateData = {
        name,
        email,
        templateId: selectedTemplate.id,
        sendEmail,
        event: event || undefined,
        metadata: metadata, // Pass the dynamic fields
      };
      // --- END MODIFICATION 5 ---
      
      const result = await generateCertificate(data);
      toast.success('Certificate generated successfully!');
      
      // Reset form
      setName('');
      setEmail('');
      setEvent('');
      setMetadata({}); // Reset dynamic fields
      
      // Show download link
      if (result.fileUrl) {
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.download = `certificate_${name}.pdf`;
        link.click();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // --- MODIFICATION 6: Calculate which fields to render ---
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
  // --- END MODIFICATION 6 ---

  return (
    <div className="generate-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </header>

      <div className="page-content">
        <h1>Generate Certificate</h1>

        <form onSubmit={handleSubmit} className="generate-form">
          <div className="form-group">
            <label>Template</label>
            <select
              // --- MODIFICATION 7: Update select value and onChange ---
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              // --- END MODIFICATION 7 ---
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

          {/* --- MODIFICATION 8: Conditionally show Event field --- */}
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
          {/* --- END MODIFICATION 8 --- */}
          
          {/* --- MODIFICATION 9: Render dynamic fields --- */}
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
          {/* --- END MODIFICATION 9 --- */}

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
            {loading ? 'Generating...' : 'Generate Certificate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeneratePage;