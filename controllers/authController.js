const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register controller
const register = async (req, res) => {
  try {
    const { name, email, studentNumber, password } = req.body;

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingStudent = User.findByStudentNumber(studentNumber);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student number already registered'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = User.create(name, email, studentNumber, hashedPassword);
    const user = User.findById(userId);
    const safeUser = User.getSafeUser(user);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);
    const safeUser = User.getSafeUser(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Google SSO controller
const googleSSO = async (req, res) => {
  try {
    const { idToken, studentNumber } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists
    let user = User.findByEmail(email);

    if (!user) {
      // Create new user with SSO
      const finalStudentNumber = studentNumber || `SSO_${Date.now()}`;
      
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-12),
        10
      );

      const userId = User.create(name, email, finalStudentNumber, randomPassword);
      user = User.findById(userId);
    }

    const token = generateToken(user);
    const safeUser = User.getSafeUser(user);

    res.status(200).json({
      success: true,
      message: 'SSO login successful',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('SSO error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
};

module.exports = {
  register,
  login,
  googleSSO
};