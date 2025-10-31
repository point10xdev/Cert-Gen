import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      'SELECT * FROM certificates WHERE verification_code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    const certificate = result.rows[0];

    // Mark as verified if not already
    if (!certificate.is_verified) {
      await pool.query(
        'UPDATE certificates SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP WHERE id = $1',
        [certificate.id]
      );
      certificate.is_verified = true;
      certificate.verified_at = new Date();
    }

    res.json({
      valid: true,
      certificate: {
        recipientName: certificate.recipient_name,
        recipientEmail: certificate.recipient_email,
        issuedAt: certificate.issued_at,
        verifiedAt: certificate.verified_at,
        fileUrl: certificate.file_url,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

