import express from 'express';
import { pool } from '../config/database';
import { verifyAdminRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/stats - Get dashboard statistics
router.get('/', verifyAdminRole, async (req: AuthRequest, res) => {
  try {
    // 1. Get total templates
    const templateCount = await pool.query(`SELECT COUNT(*) FROM templates`);
    
    // 2. Get total certificates generated
    const certCount = await pool.query(`SELECT COUNT(*) FROM certificates`);
    
    // 3. Get total certificates verified
    const verifiedCount = await pool.query(
      `SELECT COUNT(*) FROM certificates WHERE is_verified = TRUE`
    );

    res.json({
      templates: parseInt(templateCount.rows[0].count, 10),
      certificates: parseInt(certCount.rows[0].count, 10),
      verified: parseInt(verifiedCount.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;