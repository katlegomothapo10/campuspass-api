const db = require('../config/db');

function listEvents(filters = {}) {
  let sql = 'SELECT * FROM events WHERE 1=1';
  const params = {};

  if (filters.category) { sql += ' AND category = @category'; params.category = filters.category; }
  if (filters.status) { sql += ' AND status = @status'; params.status = filters.status; }
  if (filters.location) { sql += ' AND location LIKE @location'; params.location = '%' + filters.location + '%'; }
  if (filters.dateFrom) { sql += ' AND date >= @dateFrom'; params.dateFrom = filters.dateFrom; }
  if (filters.dateTo) { sql += ' AND date <= @dateTo'; params.dateTo = filters.dateTo; }
  if (filters.search) { sql += ' AND (title LIKE @search OR description LIKE @search)'; params.search = '%' + filters.search + '%'; }

  sql += ' ORDER BY date ASC, time ASC';
  return db.prepare(sql).all(params);
}

function getEventById(eventId) {
  return db.prepare('SELECT * FROM events WHERE eventId = ?').get(eventId);
}

function createEvent(data) {
  const stmt = db.prepare(`
    INSERT INTO events (title, description, date, time, location, capacity, category, clubId, organizerUserId, waitlistEnabled)
    VALUES (@title, @description, @date, @time, @location, @capacity, @category, @clubId, @organizerUserId, @waitlistEnabled)
  `);
  const result = stmt.run({
    title: data.title,
    description: data.description || null,
    date: data.date,
    time: data.time,
    location: data.location,
    capacity: data.capacity,
    category: data.category,
    clubId: data.clubId || null,
    organizerUserId: data.organizerUserId,
    waitlistEnabled: data.waitlistEnabled === false ? 0 : 1
  });
  return getEventById(result.lastInsertRowid);
}

function updateEvent(eventId, data) {
  const fields = [];
  const params = { eventId };
  const allowed = ['title', 'description', 'date', 'time', 'location', 'capacity', 'category', 'status', 'waitlistEnabled'];
  allowed.forEach((f) => {
    if (data[f] !== undefined) {
      fields.push(`${f} = @${f}`);
      params[f] = f === 'waitlistEnabled' ? (data[f] ? 1 : 0) : data[f];
    }
  });
  if (fields.length === 0) return getEventById(eventId);
  fields.push("updatedAt = datetime('now')");
  db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE eventId = @eventId`).run(params);
  return getEventById(eventId);
}

function deleteEvent(eventId) {
  const result = db.prepare('DELETE FROM events WHERE eventId = ?').run(eventId);
  return result.changes > 0;
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
