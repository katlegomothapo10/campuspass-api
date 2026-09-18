const Event = require('../models/eventModel');
const Attendance = require('../models/attendanceModel');

function buildCsv(event, stats, records) {
  const lines = [];
  lines.push('CampusPass Attendance Report');
  lines.push(`Event,"${event.title.replace(/"/g, '""')}"`);
  lines.push(`Date,"${event.date} ${event.time}"`);
  lines.push(`Location,"${event.location.replace(/"/g, '""')}"`);
  lines.push(`Capacity,${event.capacity}`);
  lines.push(`Registered,${event.registeredCount}`);
  lines.push(`Attended,${stats.totalAttended}`);
  lines.push(`Attendance %,${stats.attendancePercentage}`);
  lines.push(`Peak Hour,${stats.peakHour || 'N/A'}`);
  lines.push('');
  lines.push('TicketId,UserId,UserName,UserEmail,ScannedAt');
  records.forEach((r) => {
    const safeName = (r.userName || '').replace(/"/g, '""');
    lines.push(`${r.ticketId},${r.userId},"${safeName}","${r.userEmail}","${r.scannedAt}"`);
  });
  return lines.join('\n');
}

exports.generate = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can generate reports.' });
    }

    const format = (req.query.format || 'csv').toLowerCase();
    const records = Attendance.listByEvent(eventId);
    const stats = Attendance.getStats(eventId);

    if (format === 'csv') {
      const csv = buildCsv(event, stats, records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-report.csv"`);
      return res.send(csv);
    }

    res.json({ event, stats, records });
  } catch (err) { next(err); }
};

exports.exportReport = (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const event = Event.getEventById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerUserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organizer can export reports.' });
    }

    const stats = Attendance.getStats(eventId);
    const records = Attendance.listByEvent(eventId);
    const format = (req.query.format || 'csv').toLowerCase();

    if (format === 'csv') {
      const csv = buildCsv(event, stats, records);
      return res.json({
        format: 'csv',
        filename: `event-${eventId}-report.csv`,
        content: csv
      });
    }

    res.json({ format: 'json', event, stats, records });
  } catch (err) { next(err); }
};
