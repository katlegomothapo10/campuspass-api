const db = require('../config/db');

function eventsSince(iso) {
  return db.prepare(`
    SELECT * FROM events
    WHERE createdAt >= ? OR updatedAt >= ?
    ORDER BY updatedAt DESC
  `).all(iso, iso);
}

function ticketsSince(userId, iso) {
  return db.prepare(`
    SELECT * FROM tickets
    WHERE userId = ? AND (registrationDate >= ? OR (scannedDate IS NOT NULL AND scannedDate >= ?))
    ORDER BY registrationDate DESC
  `).all(userId, iso, iso);
}

function deletedEventsSince(iso) {
  return [];
}

function deletedTicketsSince(userId, iso) {
  return [];
}

module.exports = { eventsSince, ticketsSince, deletedEventsSince, deletedTicketsSince };
