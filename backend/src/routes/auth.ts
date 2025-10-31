import express from 'express';
import bcrypt from 'bcrypt';                  // For hashing and comparing passwords
import jwt from 'jsonwebtoken';               // For generating authentication tokens
import { pool } from '../config/database';    // PostgreSQL connection pool

const router = express.Router();

// ---------------------- LOGIN ROUTE ----------------------
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    // Fetch user record from database by username
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    // If user not found, return invalid credentials
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Compare entered password with stored hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    // If password mismatch, deny access
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token with user info and 24h expiry
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // Send token and user details in response
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------- REGISTER ROUTE ----------------------
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Ensure all fields are provided
    if (!username || !email || !password) {
      res.status(400).json({ error: 'All fields required' });
      return;
    }

    // Hash the user's password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database and return basic info
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error: any) {
    // Handle duplicate username/email (Postgres error code: 23505)
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
