import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../pages/api/mongodb';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * Higher-order function that wraps an API route handler with database connection logic
 * @param handler The API route handler to wrap
 * @returns A wrapped handler that ensures database connection before execution
 */
export function withDatabase(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Connect to the database
      await connectToDatabase();
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  };
} 