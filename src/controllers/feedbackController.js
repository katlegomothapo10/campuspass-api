const Feedback = require('../models/feedbackModel');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');

exports.submit = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const { rating, comment, anonymous } = req.body;

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be an integer between 1 and 5.' });
    }

    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const ticket = Ticket.getTicketByEventAndUser(eventId, req.user.userId);
    if (!ticket) return res.status(403).json({ message: 'You must have registered for this event to leave feedback.' });

    const feedback = Feedback.createFeedback({
      eventId,
      userId: req.user.userId,
      rating,
      comment,
      anonymous: Boolean(anonymous)
    });

    res.status(201).json({ feedback });
  } catch (err) { next(err); }
};

exports.list = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can view feedback.' });
    }
    const items = Feedback.listByEvent(eventId);
    const stats = Feedback.statsByEvent(eventId);
    res.json({ feedback: items, stats });
  } catch (err) { next(err); }
};
