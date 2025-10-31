import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { verifyAdminRole, AuthRequest } from '../middleware/auth';
import { PDFService } from '../services/pdfService';

const router = express.Router();

// Use memory storage (file buffer) for uploaded files
const upload = multer({ storage: multer.memoryStorage() });

/* ============================================================
   🧾 GET ALL TEMPLATES (Admin Only)
   ============================================================ */
router.get('/', verifyAdminRole, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM templates ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ============================================================
   📤 UPLOAD NEW TEMPLATE (Admin Only)
   ============================================================ */
router.post(
  '/upload',
  verifyAdminRole,
  upload.single('template'),
  async (req: AuthRequest, res) => {
    try {
      // Validate file presence
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { name } = req.body;
      
      // Validate name is provided
      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Template name is required' });
        return;
      }

      const userId = req.user?.id;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      let placeholders: string[] = [];
      let svgContent: string | null = null;
      let fileUrl: string | null = null;
      let templateType: string = 'svg';

      // Determine template type based on file extension
      if (fileExtension === '.pdf') {
        templateType = 'pdf';
        
        // Save PDF to disk
        const templatesDir = path.join(__dirname, '../../public/templates');
        if (!fs.existsSync(templatesDir)) {
          fs.mkdirSync(templatesDir, { recursive: true });
        }
        
        const uniqueFilename = `${uuidv4()}.pdf`;
        const filePath = path.join(templatesDir, uniqueFilename);
        fs.writeFileSync(filePath, req.file.buffer);
        
        // Generate file URL
        fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/templates/${uniqueFilename}`;
        
        // Extract placeholders from PDF
        placeholders = await PDFService.extractPlaceholdersFromPDF(req.file.buffer);
      } else if (fileExtension === '.svg' || fileExtension === '.html') {
        templateType = 'svg';
        svgContent = req.file.buffer.toString('utf-8');
        placeholders = extractPlaceholders(svgContent);
      } else {
        res.status(400).json({ error: 'Unsupported file type. Only SVG, HTML, and PDF files are allowed.' });
        return;
      }

      // Insert template into database
      const result = await pool.query(
        `INSERT INTO templates (name, svg_content, template_type, placeholders, file_url, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, svgContent, templateType, placeholders, fileUrl, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error uploading template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ============================================================
   🔍 GET SINGLE TEMPLATE BY ID (Admin Only)
   ============================================================ */
router.get('/:id', verifyAdminRole, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM templates WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ============================================================
   ✏️ UPDATE TEMPLATE NAME (Admin Only)
   ============================================================ */
router.put('/:id', verifyAdminRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await pool.query(
      'UPDATE templates SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ============================================================
   ❌ DELETE TEMPLATE (Admin Only)
   ============================================================ */
router.delete('/:id', verifyAdminRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if template is used in certificates
    const inUseCheck = await pool.query(
      'SELECT id FROM certificates WHERE template_id = $1 LIMIT 1',
      [id]
    );

    if (inUseCheck.rows.length > 0) {
      res
        .status(400)
        .json({ error: 'Template is in use and cannot be deleted' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM templates WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ============================================================
   🧩 HELPER: Extract placeholders from SVG
   Example: {{name}}, {{email}}
   ============================================================ */
function extractPlaceholders(svgContent: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g; // Match {{anything}}
  const matches = svgContent.match(regex);
  return matches ? Array.from(new Set(matches)) : []; // Remove duplicates
}

export default router;
