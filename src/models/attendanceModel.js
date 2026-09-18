const db = require('../config/db');

function markAttendance(ticketId, eventId, userId, scannedByUserId) {
  const stmt = db.prepare(`
    INSERT INTO attendance (ticketId, eventId, userId, scannedByUserId)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(ticketId, eventId, userId, scannedByUserId);
  return db.prepare('SELECT * FROM attendance WHERE attendanceId = ?').get(result.lastInsertRowid);
}

function getByTicketId(ticketId) {
  return db.prepare('SELECT * FROM attendance WHERE ticketId = ?').get(ticketId);
}

function listByEvent(eventId) {
  return db.prepare(`
    SELECT a.*, u.name AS userName, u.email AS userEmail
    FROM attendance a
    JOIN users u ON u.userId = a.userId
    WHERE a.eventId = ?
    ORDER BY a.scannedAt DESC
  `).all(eventId);
}

function getStats(eventId) {
  const total = db.prepare('SELECT COUNT(*) AS count FROM attendance WHERE eventId = ?').get(eventId).count;
  const event = db.prepare('SELECT capacity, registeredCount FROM events WHERE eventId = ?').get(eventId);
  const peak = db.prepare(`
    SELECT strftime('%H:00', scannedAt) AS hour, COUNT(*) AS count
    FROM attendance WHERE eventId = ?
    GROUP BY hour ORDER BY count DESC LIMIT 1
  `).get(eventId);
  return {
    totalAttended: total,
    capacity: event ? event.capacity : 0,
    registeredCount: event ? event.registeredCount : 0,
    attendancePercentage: event && event.registeredCount > 0 ? Number(((total / event.registeredCount) * 100).toFixed(2)) : 0,
    peakHour: peak ? peak.hour : null,
    peakCount: peak ? peak.count : 0
  };
}

module.exports = { markAttendance, getByTicketId, listByEvent, getStats };
