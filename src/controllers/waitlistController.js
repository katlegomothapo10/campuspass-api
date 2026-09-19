const Waitlist = require('../models/waitlistModel');
const Event = require('../models/eventModel');

exports.join = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.userId;

    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (!event.waitlistEnabled) return res.status(400).json({ message: 'Waitlist is disabled for this event.' });
    if (event.registeredCount < event.capacity) return res.status(400).json({ message: 'Event is not full. You can register directly.' });
    if (event.organizerUserId === userId) return res.status(400).json({ message: 'You cannot join the waitlist for your own event.' });

    const existing = Waitlist.getByEventAndUser(eventId, userId);
    if (existing) return res.status(409).json({ message: 'You are already on the waitlist.', waitlist: existing });

    const entry = Waitlist.addToWaitlist(eventId, userId);
    Waitlist.incrementWaitlistCount(eventId);
    res.status(201).json({ waitlist: entry });
  } catch (err) { next(err); }
};

exports.status = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const entry = Waitlist.getByEventAndUser(eventId, req.user.userId);
    res.json({
      onWaitlist: Boolean(entry),
      position: entry ? entry.position : null,
      eventFull: event.registeredCount >= event.capacity,
      eventWaitlistCount: event.waitlistCount
    });
  } catch (err) { next(err); }
};

exports.list = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can view the waitlist.' });
    }
    const entries = Waitlist.listByEvent(eventId);
    res.json({ waitlist: entries });
  } catch (err) { next(err); }
};
