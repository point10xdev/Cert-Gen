import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyCertificate } from '../services/verifyService';
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
  const { code } = useParams<{ code: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      verify(code);
    }
  }, [code]);

  const verify = async (verificationCode: string) => {
    setLoading(true);
    try {
      const data = await verifyCertificate(verificationCode);
      setResult(data);
    } catch (error: any) {
      toast.error('Certificate verification failed');
      setResult({ valid: false, certificate: null as any });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="loading">Verifying certificate...</div>
        </div>
      </div>
    );
  }

  if (!result || !result.valid) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="verify-result invalid">
            <h1>❌ Invalid Certificate</h1>
            <p>The certificate code you entered is not valid or has been tampered with.</p>
          </div>
        </div>
      </div>
    );
  }

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
};

export default VerifyPage;

