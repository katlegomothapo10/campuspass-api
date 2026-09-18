const Event = require('../models/eventModel');

const VALID_CATEGORIES = ['academic', 'social', 'sports', 'cultural', 'other'];

exports.list = (req, res, next) => {
  try {
    const { category, status, location, dateFrom, dateTo, search } = req.query;
    const events = Event.listEvents({ category, status, location, dateFrom, dateTo, search });
    res.json({ events });
  } catch (err) { next(err); }
};

exports.getOne = (req, res, next) => {
  try {
    const event = Event.getEventById(Number(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (err) { next(err); }
};

exports.create = (req, res, next) => {
  try {
    const { title, description, date, time, location, capacity, category, clubId, waitlistEnabled } = req.body;

    if (!title || !date || !time || !location || !capacity || !category) {
      return res.status(400).json({ message: 'title, date, time, location, capacity and category are required.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return res.status(400).json({ message: 'capacity must be a positive integer.' });
    }

    const event = Event.createEvent({
      title, description, date, time, location, capacity, category, clubId, waitlistEnabled,
      organizerUserId: req.user.userId
    });

    res.status(201).json({ event });
  } catch (err) { next(err); }
};

exports.update = (req, res, next) => {
  try {
    const event = Event.getEventById(Number(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit events you created.' });
    }
    if (req.body.category && !VALID_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (req.body.capacity !== undefined && (!Number.isInteger(req.body.capacity) || req.body.capacity <= 0)) {
      return res.status(400).json({ message: 'capacity must be a positive integer.' });
    }
    const updated = Event.updateEvent(Number(req.params.id), req.body);
    res.json({ event: updated });
  } catch (err) { next(err); }
};

exports.remove = (req, res, next) => {
  try {
    const event = Event.getEventById(Number(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete events you created.' });
    }
    const success = Event.deleteEvent(Number(req.params.id));
    res.json({ success });
  } catch (err) { next(err); }
};
