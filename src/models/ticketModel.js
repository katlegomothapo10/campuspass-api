const crypto = require('crypto');
const db = require('../config/db');

function createTicket(eventId, userId) {
  const qrCode = crypto.randomUUID();
  const stmt = db.prepare(`INSERT INTO tickets (eventId, userId, qrCode) VALUES (?, ?, ?)`);
  const result = stmt.run(eventId, userId, qrCode);
  return getTicketById(result.lastInsertRowid);
}

function getTicketById(ticketId) {
  return db.prepare('SELECT * FROM tickets WHERE ticketId = ?').get(ticketId);
}

function getTicketByEventAndUser(eventId, userId) {
  return db.prepare('SELECT * FROM tickets WHERE eventId = ? AND userId = ?').get(eventId, userId);
}

function getTicketsByUser(userId) {
  return db.prepare(`
    SELECT t.*, e.title AS eventTitle, e.date AS eventDate, e.time AS eventTime, e.location AS eventLocation
    FROM tickets t
    JOIN events e ON e.eventId = t.eventId
    WHERE t.userId = ?
    ORDER BY t.registrationDate DESC
  `).all(userId);
}

function cancelTicket(ticketId) {
  db.prepare("UPDATE tickets SET status = 'cancelled' WHERE ticketId = ?").run(ticketId);
  return getTicketById(ticketId);
}

function incrementRegisteredCount(eventId) {
  db.prepare("UPDATE events SET registeredCount = registeredCount + 1, updatedAt = datetime('now') WHERE eventId = ?").run(eventId);
}

function decrementRegisteredCount(eventId) {
  db.prepare("UPDATE events SET registeredCount = MAX(registeredCount - 1, 0), updatedAt = datetime('now') WHERE eventId = ?").run(eventId);
}

module.exports = { createTicket, getTicketById, getTicketByEventAndUser, getTicketsByUser, cancelTicket, incrementRegisteredCount, decrementRegisteredCount };
