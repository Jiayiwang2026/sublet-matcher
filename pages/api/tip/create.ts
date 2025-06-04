import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { Tip } from '@/models/Tip';
import { Listing } from '@/models/Listing';
import nc from 'next-connect';
import { isValidObjectId } from 'mongoose';

interface TipRequestBody {
  listingId: string;
  amount: number;
}

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

// Validation
const validateTip = (body: TipRequestBody) => {
  const errors: string[] = [];

  if (!body.listingId || !isValidObjectId(body.listingId)) {
    errors.push('无效的房源ID');
  }

  if (!body.amount || body.amount <= 0) {
    errors.push('打赏金额必须大于0');
  }

  return errors;
};

// API handler
const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error('Tip creation error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器错误，请稍后重试',
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      error: 'Method not allowed',
      message: '不支持的请求方法',
    });
  },
});

// POST /api/tip/create - Create new tip
handler.post(authMiddleware, async (req, res) => {
  try {
    const body = req.body as TipRequestBody;

    // Validate input
    const validationErrors = validateTip(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationErrors.join(', '),
      });
    }

    await connectToDatabase();

    // Check if listing exists
    const listing = await Listing.findById(body.listingId);
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '找不到该房源',
      });
    }

    // Prevent tipping own listing
    if (listing.owner.toString() === req.user!.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: '不能给自己的房源打赏',
      });
    }

    // Create tip
    const tip = await Tip.create({
      fromUser: req.user!.id,
      listing: body.listingId,
      amount: body.amount,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      tipId: tip._id,
    });
  } catch (error) {
    console.error('Create tip error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '创建打赏记录失败',
    });
  }
});

export default handler; 