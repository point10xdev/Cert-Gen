import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, type Template } from '../services/templateService';
import { generateCertificate, type GenerateData } from '../services/generateService';
import './Generate.css';

const GeneratePage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [event, setEvent] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setLoading(true);
    try {
      const data: GenerateData = {
        name,
        email,
        templateId: selectedTemplate,
        sendEmail,
        event: event || undefined,
      };
      
      const result = await generateCertificate(data);
      toast.success('Certificate generated successfully!');
      
      // Reset form
      setName('');
      setEmail('');
      setEvent('');
      
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
              value={selectedTemplate || ''}
              onChange={(e) => setSelectedTemplate(Number(e.target.value))}
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

          <div className="form-group">
            <label>Event (Optional)</label>
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="Summer Hackathon 2024"
            />
          </div>

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

