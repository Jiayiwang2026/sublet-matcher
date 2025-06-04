import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { User } from '@/models/User';
import { Listing } from '@/models/Listing';
import Tip from '@/models/Tip';
import nc from 'next-connect';

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

// Admin middleware
const isAdmin = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: '需要管理员权限',
    });
  }
  next();
};

// API handler
const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error('Admin stats API error:', err);
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

// GET /api/admin/stats - Get admin dashboard stats
handler.get(authMiddleware, isAdmin, async (req, res) => {
  try {
    await connectToDatabase();

    // Fetch statistics
    const [totalUsers, totalListings, totalTipsAmount] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Tip.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(result => result[0]?.total || 0),
    ]);

    // Fetch latest records
    const [latestUsers, latestListings, latestTips] = await Promise.all([
      User.find()
        .select('username email createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Listing.find()
        .select('title price location createdAt owner')
        .populate('owner', 'username')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Tip.find()
        .select('amount createdAt fromUser listing')
        .populate('fromUser', 'username')
        .populate('listing', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalListings,
        totalTipsAmount,
      },
      lists: {
        latestUsers,
        latestListings,
        latestTips,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '获取统计数据失败',
    });
  }
});

export default handler; 