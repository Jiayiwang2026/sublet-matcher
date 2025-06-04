import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/lib/auth';
import { Listing } from '@/models/Listing';
import nc from 'next-connect';

// Types
interface ListingBody {
  title: string;
  description: string;
  price: number;
  deposit: number;
  startDate: string;
  endDate: string;
  location: string;
  images: string[];
  furnished: boolean;
  roomType: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
}

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

// Validation
const validateListing = (body: ListingBody) => {
  const errors: string[] = [];

  if (!body.title?.trim()) {
    errors.push('标题不能为空');
  }

  if (!body.description?.trim()) {
    errors.push('描述不能为空');
  }

  if (!body.price || body.price <= 0) {
    errors.push('请输入有效的价格');
  }

  if (!body.deposit || body.deposit < 0) {
    errors.push('请输入有效的押金金额');
  }

  if (!body.startDate) {
    errors.push('请选择开始日期');
  }

  if (!body.endDate) {
    errors.push('请选择结束日期');
  }

  if (new Date(body.startDate) >= new Date(body.endDate)) {
    errors.push('结束日期必须晚于开始日期');
  }

  if (!body.location?.trim()) {
    errors.push('地理位置不能为空');
  }

  if (!body.roomType?.trim()) {
    errors.push('请选择房间类型');
  }

  return errors;
};

// API handler
const handler = nc<AuthenticatedRequest, NextApiResponse>({
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

// GET /api/listing - Get paginated listings
handler.get(async (req, res) => {
  try {
    await connectToDatabase();

    const {
      page = '1',
      limit = '10',
      startDate,
      endDate,
      minPrice,
      maxPrice,
      location,
    } = req.query as QueryParams;

    // Build query
    const query: any = {};

    // Date filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$lte = new Date(startDate);
      if (endDate) query.endDate.$gte = new Date(endDate);
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'username email')
        .lean(),
      Listing.countDocuments(query),
    ]);

    return res.status(200).json({
      listings,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Get listings error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: '获取房源列表失败',
    });
  }
});

// POST /api/listing - Create new listing (protected)
handler.post(
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const body = req.body as ListingBody;
      
      // Validate input
      const validationErrors = validateListing(body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationErrors.join(', '),
        });
      }

      await connectToDatabase();

      // Create listing
      const listing = await Listing.create({
        ...body,
        owner: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Populate owner details
      await listing.populate('owner', 'username email');

      return res.status(201).json({
        success: true,
        listing,
      });
    } catch (error) {
      console.error('Create listing error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: '创建房源失败',
      });
    }
  }
);

export default handler; 