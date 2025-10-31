import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

/* ============================================================
   🔍 VERIFY CERTIFICATE BY CODE
   ============================================================ */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Basic validation for code format
    if (!code || code.trim().length < 6) {
      res.status(400).json({ valid: false, error: 'Invalid verification code' });
      return;
    }

    // Fetch certificate by unique verification code
    const result = await pool.query(
      'SELECT * FROM certificates WHERE verification_code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ valid: false, error: 'Certificate not found' });
      return;
    }

    const certificate = result.rows[0];

    // If not verified, mark as verified now
    if (!certificate.is_verified) {
      await pool.query(
        `UPDATE certificates
         SET is_verified = TRUE,
             verified_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [certificate.id]
      );

      // Reflect updates locally
      certificate.is_verified = true;
      certificate.verified_at = new Date();
    }

    // Return clean, frontend-friendly response
    res.status(200).json({
      valid: true,
      certificate: {
        recipientName: certificate.recipient_name,
        recipientEmail: certificate.recipient_email,
        issuedAt: certificate.issued_at,
        verifiedAt: certificate.verified_at,
        event: certificate.event_name || null, // Optional
        templateId: certificate.template_id || null,
        fileUrl: certificate.file_url,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error',
    });
  }
});

export default router;
