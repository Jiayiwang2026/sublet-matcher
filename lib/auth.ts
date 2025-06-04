import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { NextHandler } from 'next-connect';

// Environment variables type check
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Types
interface UserPayload {
  _id: string;
  role: string;
}

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
  listing?: any;
}

type NextApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Generates a JWT token for a user
 * @param user - User object containing _id and role
 * @returns JWT token string
 */
export const generateToken = (user: UserPayload): string => {
  if (!user._id || !user.role) {
    throw new Error('User ID and role are required for token generation');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws Error if token is invalid
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Middleware to authenticate requests using JWT
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @param next - Next.js API next handler
 * @returns Wrapped handler with authentication
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization required',
        message: 'No valid authorization token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    await next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

/**
 * Role-based authorization middleware
 * @param handler - Next.js API route handler
 * @param allowedRoles - Array of roles allowed to access the route
 * @returns Wrapped handler with role-based authorization
 */
export const roleAuth = (handler: NextApiHandler, allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      if (!req.user?.role) {
        return res.status(401).json({
          error: 'Authorization required',
          message: 'User role not found',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Insufficient permissions',
        });
      }

      return handler(req, res);
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization failed',
        message: 'An unexpected error occurred',
      });
    }
  };
};

/**
 * Hashes a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new Error('Password is required');
  }

  const salt = await bcrypt.genSalt(12); // Using 12 rounds for good security/performance balance
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  if (!password || !hashedPassword) {
    throw new Error('Both password and hash are required');
  }

  return bcrypt.compare(password, hashedPassword);
};

// Example usage of authMiddleware with roleAuth
export const protectedRouteHandler = (
  handler: NextApiHandler,
  allowedRoles: string[] = []
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      authMiddleware(req, res, () => {
        const finalHandler = allowedRoles.length ? roleAuth(handler, allowedRoles) : handler;
        resolve(finalHandler(req, res));
      });
    });
  };
}; 