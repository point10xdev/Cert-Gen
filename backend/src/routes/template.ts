import express from 'express';
import multer from 'multer';
import { pool } from '../config/database';
import { verifyAdminRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyAdminRole, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload', verifyAdminRole, upload.single('template'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { name } = req.body;
    const svgContent = req.file.buffer.toString('utf-8');
    const placeholders = extractPlaceholders(svgContent);
    const userId = req.user?.id;

    const result = await pool.query(
      'INSERT INTO templates (name, svg_content, placeholders, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, svgContent, placeholders, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', verifyAdminRole, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
    
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

function extractPlaceholders(svgContent: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = svgContent.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
}

export default router;

