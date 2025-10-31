import express from 'express';
import { pool } from '../config/database';
import { PDFService } from '../services/pdfService';
import { QRService } from '../services/qrService';
import { MailService } from '../services/mailService';
// import { StorageService } from '../services/storageService'; // <-- No longer using S3
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
  let certificatePath: string | null = null;

  try {
    const { name, email, templateId, sendEmail, event, metadata } = req.body;

    if (!name || !email || !templateId) {
      res.status(400).json({ error: 'Name, email, and templateId are required' });
      return;
    }

    // Check if recipient is in allowed list
    const recipientCheck = await pool.query(
      'SELECT * FROM allowed_recipients WHERE email = $1',
      [email]
    );

    if (recipientCheck.rows.length === 0) {
      res.status(403).json({ error: 'Recipient not in allowed list' });
      return;
    }

    // Get template
    const templateResult = await pool.query('SELECT * FROM templates WHERE id = $1', [templateId]);
    
    if (templateResult.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const template = templateResult.rows[0];
    let svgContent = template.svg_content;

    // Generate verification code
    const verificationCode = QRService.generateVerificationCode();

    // Generate QR code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationCode}`;
    const qrDataURL = await QRService.generateQRCode(verificationUrl);

    // Replace placeholders
    const replacements: { [key: string]: string } = { 
      NAME: name,
      name: name,
      EVENT: event || '',
      event: event || '',
      ID: verificationCode,
      id: verificationCode,
      EMAIL: email,
      email: email
    };
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        replacements[key.toUpperCase()] = String(value);
        replacements[key] = String(value);
      });
    }

    // Replace all placeholders (case-insensitive matching)
    Object.entries(replacements).forEach(([key, value]) => {
      // Match both {{KEY}} and {{key}}
      svgContent = svgContent.replace(new RegExp(`{{${key}}}`, 'gi'), value);
    });
    
    // Handle QR code placeholder - replace with image tag
    const hasQRPlaceholder = /\{\{QR\}\}/gi.test(svgContent);
    if (hasQRPlaceholder) {
      // Replace {{QR}} or {{qr}} with proper SVG image tag
      svgContent = svgContent.replace(/\{\{QR\}\}/gi, `<image x="850" y="600" width="200" height="200" href="${qrDataURL}" />`);
    } else {
      // No QR placeholder found, embed QR at default position
      svgContent = embedQRCodeInSVG(svgContent, qrDataURL);
    }
    
    const qrEmbeddedSVG = svgContent;

    // --- NEW LOCAL STORAGE LOGIC ---

    // 1. Set the output directory to 'backend/public/certificates'
    const outputDir = path.join(__dirname, '../../public/certificates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 2. Create a unique filename and the full disk path
    const uniqueFilename = `${uuidv4()}.pdf`;
    certificatePath = path.join(outputDir, uniqueFilename);

    // 3. Generate the PDF and save it to that path
    await PDFService.generateFromSVG(qrEmbeddedSVG, certificatePath);

    // 4. Create the public URL for the file
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/certificates/${uniqueFilename}`;
    
    // --- END NEW LOGIC ---

    // Save certificate record to DB
    const certResult = await pool.query(
      `INSERT INTO certificates (verification_code, recipient_name, recipient_email, template_id, file_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [verificationCode, name, email, templateId, fileUrl, JSON.stringify(metadata || {})]
    );

    // Send email if requested
    if (sendEmail) {
      try {
        await MailService.sendCertificate(name, email, certificatePath, verificationCode);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }

    res.json({
      success: true,
      certificate: certResult.rows[0],
      fileUrl,
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // We NO LONGER delete the file, so we comment this out
    /*
    if (certificatePath && fs.existsSync(certificatePath)) {
      fs.unlinkSync(certificatePath);
    }
    */
  }
});

// The 'bulk' route remains the same
router.post('/bulk', async (req, res) => {
  try {
    const { recipients, templateId, sendEmail } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: 'Recipients array required' });
      return;
    }

    const results = [];
    const errors = [];

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

function embedQRCodeInSVG(svgContent: string, qrDataURL: string): string {
  const qrImageTag = `<image x="850" y="600" width="200" height="200" href="${qrDataURL}" />`;
  
  if (svgContent.includes('</svg>')) {
    return svgContent.replace('</svg>', `${qrImageTag}</svg>`);
  }
  
  return svgContent;
}

export default router;