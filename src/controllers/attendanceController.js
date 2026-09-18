const Attendance = require('../models/attendanceModel');
const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const db = require('../config/db');

exports.scan = (req, res, next) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) return res.status(400).json({ message: 'ticketId is required.' });

    const ticket = Ticket.getTicketById(Number(ticketId));
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    if (ticket.status === 'cancelled') return res.status(400).json({ message: 'Ticket is cancelled.' });
    if (ticket.status === 'used') return res.status(400).json({ message: 'Ticket has already been used.' });

    const event = Event.getEventById(ticket.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = event.organizerUserId === req.user.userId;
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Only the event organizer or an admin can scan tickets.' });

    const attendance = Attendance.markAttendance(ticket.ticketId, ticket.eventId, ticket.userId, req.user.userId);
    db.prepare("UPDATE tickets SET status = 'used', scannedDate = datetime('now') WHERE ticketId = ?").run(ticket.ticketId);

    res.status(201).json({ attendance });
  } catch (err) { next(err); }
};

exports.list = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can view attendance.' });
    }
    const records = Attendance.listByEvent(eventId);
    res.json({ attendance: records });
  } catch (err) { next(err); }
};

exports.stats = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can view attendance stats.' });
    }
    const stats = Attendance.getStats(eventId);
    res.json({ stats });
  } catch (err) { next(err); }
};
