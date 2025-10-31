import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, uploadTemplate, Template } from '../services/templateService';
import './TemplateManagement.css';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadName) {
      toast.error('Please provide a name and file');
      return;
    }

    setLoading(true);
    try {
      await uploadTemplate(uploadFile, uploadName);
      toast.success('Template uploaded successfully!');
      setShowUpload(false);
      setUploadName('');
      setUploadFile(null);
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-management">
      <header className="page-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <button onClick={() => setShowUpload(!showUpload)} className="btn-primary">
          {showUpload ? 'Cancel' : 'Upload Template'}
        </button>
      </header>

      <div className="page-content">
        {showUpload && (
          <div className="upload-section">
            <h2>Upload New Template</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Event Participation Certificate"
                  required
                />
              </div>
              <div className="form-group">
                <label>SVG File</label>
                <input
                  type="file"
                  accept=".svg,.html"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        )}

        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <h3>{template.name}</h3>
              <p className="template-placeholders">
                Placeholders: {template.placeholders.join(', ')}
              </p>
              <p className="template-date">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="empty-state">
            <p>No templates yet. Upload your first template to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManagement;

