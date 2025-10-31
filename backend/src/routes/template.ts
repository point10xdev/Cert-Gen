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

// --- NEW ---
// Edit a template's name
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

// Delete a template
router.delete('/:id', verifyAdminRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if template is in use by any certificates
    const inUseCheck = await pool.query(
      'SELECT id FROM certificates WHERE template_id = $1 LIMIT 1',
      [id]
    );

    if (inUseCheck.rows.length > 0) {
      res.status(400).json({ error: 'Template is in use and cannot be deleted' });
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
// --- END NEW ---

function extractPlaceholders(svgContent: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = svgContent.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
}

export default router;