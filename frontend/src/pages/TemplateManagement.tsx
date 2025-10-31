import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, uploadTemplate, updateTemplate, deleteTemplate, type Template } from '../services/templateService';
import './TemplateManagement.css';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // --- NEW STATE ---
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  // --- END NEW STATE ---

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

  // --- NEW HANDLERS ---
  const openPreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const openEdit = (template: Template) => {
    setSelectedTemplate(template);
    setEditName(template.name);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setSelectedTemplate(null);
    setShowPreviewModal(false);
    setShowEditModal(false);
    setEditName('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !editName) return;

    setLoading(true);
    try {
      await updateTemplate(selectedTemplate.id, editName);
      toast.success('Template name updated!');
      closeModals();
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
      try {
        await deleteTemplate(id);
        toast.success('Template deleted!');
        loadTemplates();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete template');
      }
    }
  };
  // --- END NEW HANDLERS ---

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
              <button type="submit" disabled={loading} className="btn-primary">
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
              {/* --- NEW BUTTONS --- */}
              <div className="template-actions">
                <button onClick={() => openPreview(template)} className="btn-secondary">
                  Preview
                </button>
                <button onClick={() => openEdit(template)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(template.id)} className="btn-danger">
                  Delete
                </button>
              </div>
              {/* --- END NEW BUTTONS --- */}
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="empty-state">
            <p>No templates yet. Upload your first template to get started!</p>
          </div>
        )}
      </div>

      {/* --- NEW MODALS --- */}
      {showPreviewModal && selectedTemplate && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Preview: {selectedTemplate.name}</h2>
              <button onClick={closeModals} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div
                className="preview-svg"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.svg_content }}
              />
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTemplate && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit: {selectedTemplate.name}</h2>
              <button onClick={closeModals} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeModals} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* --- END NEW MODALS --- */}
    </div>
  );
};

export default TemplateManagement;