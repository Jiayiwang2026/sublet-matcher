import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { Listing } from '@/models/Listing';
import nc from 'next-connect';

const handler = nc({
  onError: (err, req, res) => {
    console.error('Listing API error:', err);
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

// GET /api/listing/[id] - Get a single listing
handler.get(async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.query;
    const listing = await Listing.findById(id)
      .populate('owner', 'username email')
      .lean();

    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '房源不存在',
      });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '获取房源信息失败',
    });
  }
});

// PUT /api/listing/[id] - Update a listing
handler.put(authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.query;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '房源不存在',
      });
    }

    // Check authorization
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '无权修改此房源',
      });
    }

    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'username email');

    return res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '更新房源信息失败',
    });
  }
});

// DELETE /api/listing/[id] - Delete a listing
handler.delete(authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.query;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '房源不存在',
      });
    }

    // Check authorization
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '无权删除此房源',
      });
    }

    await listing.remove();

    return res.status(200).json({
      message: '房源已删除',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '删除房源失败',
    });
  }
});

export default handler; 