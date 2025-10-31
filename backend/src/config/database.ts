import { Pool } from 'pg';              // Import PostgreSQL connection pool
import dotenv from 'dotenv';            // Import dotenv to load environment variables

dotenv.config();                        // Load environment variables from .env file

// Create a new PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',                 // Database username
  host: process.env.DB_HOST || 'localhost',                // Database host
  database: process.env.DB_NAME || 'certificate_generator',// Database name
  password: process.env.DB_PASSWORD || 'postgres',         // Database password
  port: parseInt(process.env.DB_PORT || '5432'),           // Database port (default: 5432)
});

// Initialize all required tables if they don’t exist
export const initDatabase = async () => {
  try {
    // Create 'users' table to store admin or system users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create 'templates' table to store certificate templates and their metadata
    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        svg_content TEXT NOT NULL,
        placeholders TEXT[],                     -- List of placeholder tags in the template
        file_url VARCHAR(500),                   -- Optional file storage URL
        created_by INTEGER REFERENCES users(id), -- Link to creator (user)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create 'allowed_recipients' table for pre-approved participants or recipients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowed_recipients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        event VARCHAR(255),                      -- Event name associated with recipient
        metadata JSONB,                          -- Additional dynamic data
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create 'certificates' table to store issued certificates and their verification info
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        verification_code VARCHAR(255) UNIQUE NOT NULL, -- Unique code for verification
        recipient_name VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        template_id INTEGER REFERENCES templates(id),   -- Link to used template
        file_url VARCHAR(500) NOT NULL,                 -- URL of generated certificate
        qr_code_url VARCHAR(500),                       -- Optional QR code link
        metadata JSONB,                                 -- Extra details (e.g., event info)
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,                          -- Timestamp when verified
        is_verified BOOLEAN DEFAULT FALSE               -- Status flag for verification
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
