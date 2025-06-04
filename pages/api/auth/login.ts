import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';
import { User } from '@/models/User';
import nc from 'next-connect';

// Types
interface LoginRequestBody {
  emailOrUsername: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  error?: string;
  message?: string;
}

// Input validation
const validateInput = (body: LoginRequestBody) => {
  const errors: string[] = [];

  if (!body.emailOrUsername?.trim()) {
    errors.push('请输入邮箱或用户名');
  }

  if (!body.password?.trim()) {
    errors.push('请输入密码');
  }

  return errors;
};

// API handler
const handler = nc<NextApiRequest, NextApiResponse<LoginResponse>>({
  onError: (err, req, res) => {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '登录过程中发生错误，请稍后重试',
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: '不支持的请求方法',
    });
  },
});

// POST /api/auth/login
handler.post(async (req, res) => {
  try {
    // Validate request body
    const body = req.body as LoginRequestBody;
    const validationErrors = validateInput(body);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validationErrors.join(', '),
      });
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: body.emailOrUsername.toLowerCase() },
        { username: body.emailOrUsername.toLowerCase() },
      ],
    });

    // If no user found or password doesn't match
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: '用户名或密码错误',
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(body.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: '用户名或密码错误',
      });
    }

    // Generate JWT token
    const token = generateToken({
      _id: user._id.toString(),
      role: user.role,
    });

    // Update last login time
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: '服务器错误，请稍后重试',
    });
  }
});

export default handler; 