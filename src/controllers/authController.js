const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const db = require('../config/db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      isOrganizer: user.role === 'organizer' || user.role === 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitize(user) {
  const { passwordHash, googleId, ...safe } = user;
  return safe;
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, studentNumber, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const allowedRoles = ['student', 'organizer', 'admin'];
    const chosenRole = role && allowedRoles.includes(role) ? role : 'student';
    const existing = User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.createUser({ name, email, studentNumber, passwordHash, role: chosenRole });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = User.findByEmail(email);
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid email or password.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });
    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.googleSso = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Google idToken is required.' });
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    let user = User.findByGoogleId(googleId) || User.findByEmail(email);
    if (!user) {
      user = User.createUser({ name: name || email.split('@')[0], email, studentNumber: null, passwordHash: null, googleId, profileImage: picture || null });
    } else if (!user.googleId) {
      db.prepare(`UPDATE users SET googleId = ?, profileImage = COALESCE(profileImage, ?), updatedAt = datetime('now') WHERE userId = ?`).run(googleId, picture || null, user.userId);
      user = User.findById(user.userId);
    }
    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.me = (req, res, next) => {
  try {
    const user = User.getPublicUser(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) { next(err); }
};
