const QRCode = require('qrcode');
const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');

exports.registerForEvent = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.userId;

    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.status === 'cancelled') return res.status(400).json({ message: 'Event is cancelled.' });
    if (event.organizerUserId === userId) return res.status(400).json({ message: 'You cannot register for your own event.' });

    const existing = Ticket.getTicketByEventAndUser(eventId, userId);
    if (existing) return res.status(409).json({ message: 'You are already registered for this event.', ticket: existing });

    if (event.registeredCount >= event.capacity) {
      return res.status(409).json({ message: 'Event is full.' });
    }

    const ticket = Ticket.createTicket(eventId, userId);
    Ticket.incrementRegisteredCount(eventId);

    res.status(201).json({ ticket });
  } catch (err) { next(err); }
};

exports.getMine = (req, res, next) => {
  try {
    const tickets = Ticket.getTicketsByUser(req.user.userId);
    res.json({ tickets });
  } catch (err) { next(err); }
};

exports.getOne = (req, res, next) => {
  try {
    const ticket = Ticket.getTicketById(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    const isOwner = ticket.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isOrganizer = req.user.role === 'organizer';
    if (!isOwner && !isAdmin && !isOrganizer) {
      return res.status(403).json({ message: 'You can only view your own tickets.' });
    }
    res.json({ ticket });
  } catch (err) { next(err); }
};

exports.getQr = async (req, res, next) => {
  try {
    const ticket = Ticket.getTicketById(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    const isOwner = ticket.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only view your own tickets.' });
    }
    const payload = JSON.stringify({ ticketId: ticket.ticketId, eventId: ticket.eventId, qrCode: ticket.qrCode });
    const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', width: 400 });
    res.json({ qrCode: ticket.qrCode, qrDataUrl: dataUrl });
  } catch (err) { next(err); }
};

exports.cancel = (req, res, next) => {
  try {
    const ticket = Ticket.getTicketById(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    const isOwner = ticket.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'You can only cancel your own tickets.' });
    if (ticket.status === 'cancelled') return res.status(400).json({ message: 'Ticket already cancelled.' });
    if (ticket.status === 'used') return res.status(400).json({ message: 'Cannot cancel a used ticket.' });

    const updated = Ticket.cancelTicket(ticket.ticketId);
    Ticket.decrementRegisteredCount(ticket.eventId);
    res.json({ ticket: updated });
  } catch (err) { next(err); }
};
