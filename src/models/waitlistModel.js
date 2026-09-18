const db = require('../config/db');

function getByEventAndUser(eventId, userId) {
  return db.prepare('SELECT * FROM waitlist WHERE eventId = ? AND userId = ?').get(eventId, userId);
}

function getPosition(eventId, userId) {
  const row = getByEventAndUser(eventId, userId);
  return row ? row.position : null;
}

function getNextPosition(eventId) {
  const row = db.prepare('SELECT MAX(position) AS maxPos FROM waitlist WHERE eventId = ?').get(eventId);
  return (row && row.maxPos !== null ? row.maxPos : 0) + 1;
}

function addToWaitlist(eventId, userId) {
  const position = getNextPosition(eventId);
  const stmt = db.prepare('INSERT INTO waitlist (eventId, userId, position) VALUES (?, ?, ?)');
  const result = stmt.run(eventId, userId, position);
  return db.prepare('SELECT * FROM waitlist WHERE waitlistId = ?').get(result.lastInsertRowid);
}

function removeFromWaitlist(eventId, userId) {
  const result = db.prepare('DELETE FROM waitlist WHERE eventId = ? AND userId = ?').run(eventId, userId);
  return result.changes > 0;
}

function listByEvent(eventId) {
  return db.prepare(`
    SELECT w.*, u.name AS userName, u.email AS userEmail
    FROM waitlist w
    JOIN users u ON u.userId = w.userId
    WHERE w.eventId = ?
    ORDER BY w.position ASC
  `).all(eventId);
}

function incrementWaitlistCount(eventId) {
  db.prepare("UPDATE events SET waitlistCount = waitlistCount + 1, updatedAt = datetime('now') WHERE eventId = ?").run(eventId);
}

function decrementWaitlistCount(eventId) {
  db.prepare("UPDATE events SET waitlistCount = MAX(waitlistCount - 1, 0), updatedAt = datetime('now') WHERE eventId = ?").run(eventId);
}

module.exports = { getByEventAndUser, getPosition, addToWaitlist, removeFromWaitlist, listByEvent, incrementWaitlistCount, decrementWaitlistCount };
