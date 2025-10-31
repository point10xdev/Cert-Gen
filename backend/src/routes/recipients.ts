import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM allowed_recipients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, event, metadata } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email required' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO allowed_recipients (name, email, event, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, event, JSON.stringify(metadata || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Error adding recipient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;

