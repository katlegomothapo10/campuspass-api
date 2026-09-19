const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authorised. No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised. Invalid or expired token.' });
  }
}

function organizerOnly(req, res, next) {
  if (!req.user || !req.user.isOrganizer) return res.status(403).json({ message: 'Organizer access required.' });
  next();
}

module.exports = { protect, organizerOnly };
