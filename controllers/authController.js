const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate JWT
const signToken = (id, role) => {
  return jwt.sign(
    { id, userId: id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Hide password from response
  user.password = undefined;

  // 5. Generate token
  const token = signToken(user._id, user.role);

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id, user.role);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});