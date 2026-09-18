const db = require('../config/db');

function createFeedback({ eventId, userId, rating, comment, anonymous }) {
  const stmt = db.prepare(`
    INSERT INTO feedback (eventId, userId, rating, comment, anonymous)
    VALUES (@eventId, @userId, @rating, @comment, @anonymous)
  `);
  const result = stmt.run({
    eventId,
    userId,
    rating,
    comment: comment || null,
    anonymous: anonymous ? 1 : 0
  });
  return getById(result.lastInsertRowid);
}

function getById(feedbackId) {
  return db.prepare('SELECT * FROM feedback WHERE feedbackId = ?').get(feedbackId);
}

function listByEvent(eventId) {
  return db.prepare(`
    SELECT f.*, CASE WHEN f.anonymous = 1 THEN 'Anonymous' ELSE u.name END AS userName
    FROM feedback f
    JOIN users u ON u.userId = f.userId
    WHERE f.eventId = ?
    ORDER BY f.submittedAt DESC
  `).all(eventId);
}

function statsByEvent(eventId) {
  const row = db.prepare(`
    SELECT COUNT(*) AS total, AVG(rating) AS avgRating
    FROM feedback WHERE eventId = ?
  `).get(eventId);
  return {
    totalFeedback: row.total,
    averageRating: row.avgRating ? Number(row.avgRating.toFixed(2)) : 0
  };
}

module.exports = { createFeedback, getById, listByEvent, statsByEvent };
