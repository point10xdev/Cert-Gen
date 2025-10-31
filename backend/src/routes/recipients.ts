import express from 'express';
import { pool } from '../config/database'; // Import PostgreSQL connection pool

const router = express.Router();

// =========================
// 📋 GET ALL ALLOWED RECIPIENTS
// =========================
router.get('/', async (req, res) => {
  try {
    // Fetch all recipients, sorted by creation date (newest first)
    const result = await pool.query(
      'SELECT * FROM allowed_recipients ORDER BY created_at DESC'
    );

    // Send list of recipients as JSON
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================
// ➕ ADD NEW ALLOWED RECIPIENT
// =========================
router.post('/', async (req, res) => {
  try {
    const { name, email, event, metadata } = req.body;

    // Validate required fields
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email required' });
      return;
    }

    // Insert new recipient record into database
    const result = await pool.query(
      'INSERT INTO allowed_recipients (name, email, event, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, event, JSON.stringify(metadata || {})]
    );

    // Respond with created recipient data
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    // Handle duplicate email entry (PostgreSQL code 23505)
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Error adding recipient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
