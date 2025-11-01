import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyCertificate, verifyCertificateDetails } from '../services/verifyService';
import './Verify.css';

interface VerificationResult {
  valid: boolean;
  certificate: {
    recipientName: string;
    recipientEmail: string;
    issuedAt: string;
    verifiedAt?: string;
    fileUrl: string;
  };
}

const VerifyPage = () => {
  // Check for code in URL (from QR/email link)
  const { code } = useParams<{ code: string }>();

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  // State for the manual verification form
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');

  // --- Automatic Verification (if code in URL) ---
  useEffect(() => {
    if (code) {
      verifyByCode(code);
    } else {
      // If no code, just stop loading and show the form
      setLoading(false);
    }
  }, [code]);

  const verifyByCode = async (verificationCode: string) => {
    setLoading(true);
    try {
      const data = await verifyCertificate(verificationCode);
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Certificate verification failed');
      setResult({ valid: false, certificate: null as any });
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Form Submission ---
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) {
      toast.error('Please enter both Certificate ID and Name');
      return;
    }
    
    setLoading(true);
    try {
      const data = await verifyCertificateDetails(formCode, formName);
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed. Please check details.');
      setResult({ valid: false, certificate: null as any });
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Show Loading State ---
  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="loading">Verifying certificate...</div>
        </div>
      </div>
    );
  }

  // --- 2. Show Invalid Result ---
  if (result && !result.valid) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="verify-result invalid">
            <h1>❌ Invalid Certificate</h1>
            <p>The certificate details are not valid or could not be found.</p>
            {/* Link to go back to the form */}
            <a href="/verify" className="btn-secondary" style={{ marginTop: '1.5rem' }}>
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Show Valid Result ---
  if (result && result.valid) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="verify-result valid">
            <h1>✅ Verified Certificate</h1>
            <div className="certificate-details">
              <div className="detail-item">
                <strong>Recipient:</strong> {result.certificate.recipientName}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {result.certificate.recipientEmail}
              </div>
              <div className="detail-item">
                <strong>Issued:</strong> {new Date(result.certificate.issuedAt).toLocaleString()}
              </div>
              {result.certificate.verifiedAt && (
                <div className="detail-item">
                  <strong>Verified:</strong> {new Date(result.certificate.verifiedAt).toLocaleString()}
                </div>
              )}
              <div className="actions">
                <a href={result.certificate.fileUrl} download className="btn-download">
                  Download Certificate
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. Show Verification Form (Default) ---
  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-result">
          <h1>Verify Certificate</h1>
          <p style={{ marginBottom: '2rem' }}>
            Enter the details from your certificate to verify its authenticity.
          </p>
          
          <form onSubmit={handleDetailsSubmit} className="verify-form">
            <div className="form-group">
              <label htmlFor="formCode">Certificate ID</label>
              <input
                id="formCode"
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g., FOSS-000001"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="formName">Recipient Name</label>
              <input
                id="formName"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div className="actions">
              <button type="submit" className="btn-download">
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;