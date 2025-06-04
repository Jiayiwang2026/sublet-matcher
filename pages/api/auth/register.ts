import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { User } from '@/models/User';
import nc from 'next-connect';

// Types
interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
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
const validateInput = (body: RegisterRequestBody) => {
  const errors: string[] = [];

  if (!body.username?.trim()) {
    errors.push('用户名不能为空');
  } else if (body.username.length < 3) {
    errors.push('用户名至少需要3个字符');
  }

  if (!body.email?.trim()) {
    errors.push('邮箱不能为空');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push('请输入有效的邮箱地址');
    }
  }

  if (!body.password?.trim()) {
    errors.push('密码不能为空');
  } else if (body.password.length < 6) {
    errors.push('密码至少需要6个字符');
  }

  return errors;
};

// API handler
const handler = nc<NextApiRequest, NextApiResponse<RegisterResponse>>({
  onError: (err, req, res) => {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '注册过程中发生错误，请稍后重试',
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

// POST /api/auth/register
handler.post(async (req, res) => {
  try {
    // Validate request body
    const body = req.body as RegisterRequestBody;
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: body.email.toLowerCase() }, { username: body.username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User exists',
        message:
          existingUser.email === body.email.toLowerCase() ? '该邮箱已被注册' : '该用户名已被使用',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create new user
    const newUser = await User.create({
      username: body.username.toLowerCase(),
      email: body.email.toLowerCase(),
      password: hashedPassword,
      role: 'user', // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT token
    const token = generateToken({
      _id: newUser._id.toString(),
      role: newUser.role,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: '服务器错误，请稍后重试',
    });
  }
});

export default handler;
