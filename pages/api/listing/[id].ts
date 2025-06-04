import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { Listing } from '@/models/Listing';
import nc from 'next-connect';
import { isValidObjectId } from 'mongoose';

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

interface UpdateListingBody {
  title?: string;
  description?: string;
  price?: number;
  deposit?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  images?: string[];
  furnished?: boolean;
  roomType?: string;
}

// Validation for update
const validateUpdateListing = (body: UpdateListingBody) => {
  const errors: string[] = [];

  if (body.title !== undefined && !body.title.trim()) {
    errors.push('标题不能为空');
  }

  if (body.description !== undefined && !body.description.trim()) {
    errors.push('描述不能为空');
  }

  if (body.price !== undefined && body.price <= 0) {
    errors.push('请输入有效的价格');
  }

  if (body.deposit !== undefined && body.deposit < 0) {
    errors.push('请输入有效的押金金额');
  }

  if (body.startDate && body.endDate) {
    if (new Date(body.startDate) >= new Date(body.endDate)) {
      errors.push('结束日期必须晚于开始日期');
    }
  }

  if (body.location !== undefined && !body.location.trim()) {
    errors.push('地理位置不能为空');
  }

  if (body.roomType !== undefined && !body.roomType.trim()) {
    errors.push('请选择房间类型');
  }

  return errors;
};

// Authorization middleware
const isAuthorized = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const listingId = req.query.id as string;

  if (!isValidObjectId(listingId)) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: '无效的房源ID',
    });
  }

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '找不到该房源',
      });
    }

    const isOwner = listing.owner.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限执行此操作',
      });
    }

    req.listing = listing;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: '服务器错误',
    });
  }
};

// API handler
const handler = nc<AuthenticatedRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error('Listing detail API error:', err);
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

// GET /api/listing/[id] - Get single listing
handler.get(async (req, res) => {
  try {
    const listingId = req.query.id as string;

    if (!isValidObjectId(listingId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: '无效的房源ID',
      });
    }

    await connectToDatabase();

    const listing = await Listing.findById(listingId)
      .populate('owner', 'username email')
      .lean();

    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: '找不到该房源',
      });
    }

    return res.status(200).json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '获取房源详情失败',
    });
  }
});

// PUT /api/listing/[id] - Update listing
handler.put(authMiddleware, isAuthorized, async (req, res) => {
  try {
    const body = req.body as UpdateListingBody;
    
    // Validate input
    const validationErrors = validateUpdateListing(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationErrors.join(', '),
      });
    }

    await connectToDatabase();

    const updatedListing = await Listing.findByIdAndUpdate(
      req.query.id,
      {
        ...body,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('owner', 'username email');

    return res.status(200).json({
      success: true,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '更新房源失败',
    });
  }
});

// DELETE /api/listing/[id] - Delete listing
handler.delete(authMiddleware, isAuthorized, async (req, res) => {
  try {
    await connectToDatabase();
    await Listing.findByIdAndDelete(req.query.id);

    return res.status(200).json({
      success: true,
      message: '房源已成功删除',
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