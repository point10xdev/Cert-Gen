import { Request, Response, NextFunction } from 'express'; // Import types for Express middleware
import jwt from 'jsonwebtoken'; // Import JWT for token verification

// Extend Express Request type to include decoded user info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// Middleware to verify JWT token from request headers
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from "Authorization" header (format: Bearer <token>)
    const token = req.headers.authorization?.split(' ')[1];

    // If no token found, respond with 401 Unauthorized
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Get secret key from environment or fallback
    const secret = process.env.JWT_SECRET || 'Random';

    // Verify and decode JWT
    const decoded = jwt.verify(token, secret) as any;

    // Attach decoded user info to request object for later use
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    // Continue to next middleware or route handler
    next();
  } catch (error) {
    // If verification fails, respond with 401 Unauthorized
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to restrict access to admin users only
export const verifyAdminRole = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // First verify token, then check if role is 'admin'
  verifyToken(req, res, () => {
    // If user is not an admin, respond with 403 Forbidden
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    // If admin, proceed to next handler
    next();
  });
};
