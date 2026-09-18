const db = require('../config/db');

const publicUserFields = `
  userId, name, email, studentNumber, profileImage,
  language, role, notificationsEnabled, biometricEnabled,
  createdAt, updatedAt
`;

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(userId) {
  return db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
}

function findByGoogleId(googleId) {
  return db.prepare('SELECT * FROM users WHERE googleId = ?').get(googleId);
}

function createUser({
  name, email, studentNumber = null, passwordHash = null,
  googleId = null, profileImage = null, role = 'student'
}) {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, studentNumber, passwordHash, googleId, profileImage, role)
    VALUES (@name, @email, @studentNumber, @passwordHash, @googleId, @profileImage, @role)
  `);
  const result = stmt.run({ name, email, studentNumber, passwordHash, googleId, profileImage, role });
  return findById(result.lastInsertRowid);
}

function getPublicUser(userId) {
  return db.prepare(`SELECT ${publicUserFields} FROM users WHERE userId = ?`).get(userId);
}

function updateRole(userId, role) {
  db.prepare(`UPDATE users SET role = ?, updatedAt = datetime('now') WHERE userId = ?`).run(role, userId);
  return findById(userId);
}

module.exports = { findByEmail, findById, findByGoogleId, createUser, getPublicUser, updateRole };
