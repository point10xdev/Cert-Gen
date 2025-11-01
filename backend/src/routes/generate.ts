import express from 'express';
import { pool } from '../config/database';
import { PDFService } from '../services/pdfService'; // Handles SVG → PDF conversion
import { QRService } from '../services/qrService';   // Generates QR codes
// import { MailService } from '../services/mailService'; // Handles email sending
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Generates unique filenames and temporary codes

const router = express.Router();

// =========================
// 🧾 SINGLE CERTIFICATE GENERATION
// =========================
router.post('/', async (req, res) => {
  let certificatePath: string | null = null;

  try {
    const { name, email, templateId, sendEmail, event, metadata } = req.body;

    // ✅ 1. Validate required fields
    if (!name || !email || !templateId) {
      res.status(400).json({ error: 'Name, email, and templateId are required' });
      return;
    }

    // ✅ 2. Ensure recipient is allowed
    const recipientCheck = await pool.query(
      'SELECT * FROM allowed_recipients WHERE email = $1',
      [email]
    );
    if (recipientCheck.rows.length === 0) {
      res.status(403).json({ error: 'Recipient not in allowed list' });
      return;
    }

    // ✅ 3. Fetch the certificate template
    const templateResult = await pool.query(
      'SELECT * FROM templates WHERE id = $1',
      [templateId]
    );
    if (templateResult.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const template = templateResult.rows[0];
    const templateType = template.template_type || 'svg';

    // =========================
    // 📁 PREPARE FILE PATHS
    // =========================
    // 1️⃣ Create public directory if missing
    const outputDir = path.join(__dirname, '../../public/certificates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 2️⃣ Create unique PDF filename and URL (we know this before generation)
    const uniqueFilename = `${uuidv4()}.pdf`;
    certificatePath = path.join(outputDir, uniqueFilename);
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/certificates/${uniqueFilename}`;

    // =========================
    // 🌟 NEW ID GENERATION LOGIC
    // =========================

    // ✅ 4. Insert record with a temporary code to get the auto-increment ID
    const tempCode = uuidv4(); // A temporary unique code
    const certResult = await pool.query(
      `INSERT INTO certificates 
       (verification_code, recipient_name, recipient_email, template_id, file_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tempCode, name, email, templateId, fileUrl, JSON.stringify(metadata || {})]
    );

    const certificateRecord = certResult.rows[0];
    const newCertId = certificateRecord.id;

    // ✅ 5. Generate the final, formatted verification code (FOSS-xxxxxx)
    const finalVerificationCode = `FOSS-${String(newCertId).padStart(6, '0')}`;

    // ✅ 6. Update the record in the database with the final code
    await pool.query(
      `UPDATE certificates SET verification_code = $1 WHERE id = $2`,
      [finalVerificationCode, newCertId]
    );

    // Update the local object so the response is correct
    certificateRecord.verification_code = finalVerificationCode;

    // =========================
    // 🧩 PREPARE FOR PDF GENERATION
    // =========================

    // ✅ 7. Generate QR code using the *final* verification code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${finalVerificationCode}`;
    const qrDataURL = await QRService.generateQRCode(verificationUrl);

    // ✅ 8. Prepare placeholder replacements using the *final* code
    const replacements: { [key: string]: string } = {
      NAME: name,
      name: name,
      EVENT: event || '',
      event: event || '',
      ID: finalVerificationCode, // Use the final code here
      id: finalVerificationCode, // Use the final code here
      EMAIL: email,
      email: email,
    };

    // Include metadata values as placeholders
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        replacements[key.toUpperCase()] = String(value);
        replacements[key] = String(value);
      });
    }

    // =========================
    // 📄 GENERATE PDF
    // =========================

    // 3️⃣ Generate PDF based on template type (now using final code)
    if (templateType === 'pdf') {
      // Load PDF template from file
      if (!template.file_url) {
        res.status(500).json({ error: 'PDF template file not found' });
        return;
      }

      // Extract filename from file_url
      const templateFilename = path.basename(template.file_url);
      const templatePath = path.join(__dirname, '../../public/templates', templateFilename);

      if (!fs.existsSync(templatePath)) {
        res.status(404).json({ error: 'PDF template file not found on disk' });
        return;
      }

      // Read PDF template
      const pdfBuffer = fs.readFileSync(templatePath);

      // Generate PDF from template with placeholder replacement
      await PDFService.generateFromPDFTemplate(
        pdfBuffer,
        replacements,
        certificatePath,
        qrDataURL
      );
    } else {
      // Handle SVG/HTML templates
      let svgContent = template.svg_content || '';

      // ✅ Replace all placeholders like {{NAME}}, {{event}}, etc.
      Object.entries(replacements).forEach(([key, value]) => {
        svgContent = svgContent.replace(new RegExp(`{{${key}}}`, 'gi'), value);
      });

      // ✅ Handle QR placeholder — insert QR image or embed at default position
      const hasQRPlaceholder = /\{\{QR\}\}/gi.test(svgContent);
      if (hasQRPlaceholder) {
        svgContent = svgContent.replace(
          /\{\{QR\}\}/gi,
          `<image x="850" y="600" width="200" height="200" href="${qrDataURL}" />`
        );
      } else {
        svgContent = embedQRCodeInSVG(svgContent, qrDataURL);
      }

      // Generate PDF from SVG
      await PDFService.generateFromSVG(svgContent, certificatePath);
    }

    // ✅ 10. Optionally send certificate via email
    /*
    if (sendEmail) {
      try {
        await MailService.sendCertificate(name, email, certificatePath, finalVerificationCode);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }
    */

    // ✅ 11. Respond with success and details
    res.json({
      success: true,
      certificate: certificateRecord, // This now has the final code
      fileUrl,
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // File deletion disabled (certificates stored permanently)
    /*
    if (certificatePath && fs.existsSync(certificatePath)) {
      fs.unlinkSync(certificatePath);
    }
    */
  }
});

// =========================
// 🧩 BULK CERTIFICATE GENERATION
// =========================
router.post('/bulk', async (req, res) => {
  try {
    const { recipients, templateId, sendEmail } = req.body;

    // Validate input array
    if (!Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: 'Recipients array required' });
      return;
    }

    const results = [];
    const errors = [];

    // Process each recipient one by one
    for (const recipient of recipients) {
      try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recipient.name,
            email: recipient.email,
            templateId,
            sendEmail,
            event: recipient.event,
            metadata: recipient.metadata,
          }),
        });

        const data = await response.json();
        results.push({ ...recipient, ...data });
      } catch (error) {
        errors.push({ ...recipient, error: String(error) });
      }
    }

    res.json({ success: true, results, errors });
  } catch (error) {
    console.error('Bulk generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================
// 🧩 HELPER: Embed QR in SVG
// =========================
function embedQRCodeInSVG(svgContent: string, qrDataURL: string): string {
  const qrImageTag = `<image x="850" y="600" width="200" height="200" href="${qrDataURL}" />`;

  // Insert QR before closing </svg> tag (default position)
  if (svgContent.includes('</svg>')) {
    return svgContent.replace('</svg>', `${qrImageTag}</svg>`);
  }

  // If malformed SVG, append QR at the end
  return svgContent;
}

export default router;