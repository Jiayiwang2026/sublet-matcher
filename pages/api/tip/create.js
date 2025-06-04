import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { Listing } from '@/models/Listing';
import Tip from '@/models/Tip';
import nc from 'next-connect';

const handler = nc({
  onError: (err, req, res) => {
    console.error('Create tip API error:', err);
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

// POST /api/tip/create - Create a new tip
handler.post(authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();

    const { listingId, amount, message } = req.body;

    // Validate input
    if (!listingId || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: '无效的打赏信息',
      });
    }

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '房源不存在',
      });
    }

    // Create tip
    const tip = await Tip.create({
      listing: listingId,
      fromUser: req.user._id,
      toUser: listing.owner,
      amount,
      message,
      status: 'completed', // For now, we'll mark it as completed immediately
    });

    // Populate user info
    await tip.populate('fromUser', 'username');
    await tip.populate('toUser', 'username');
    await tip.populate('listing', 'title');

    return res.status(201).json({
      message: '打赏成功',
      tip,
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