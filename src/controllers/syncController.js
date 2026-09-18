const Sync = require('../models/syncModel');

function validateIso(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

exports.events = (req, res, next) => {
  try {
    const lastSync = validateIso(req.query.lastSync) || '1970-01-01 00:00:00';
    const events = Sync.eventsSince(lastSync);
    const deleted = Sync.deletedEventsSince(lastSync);
    res.json({ events, deleted, lastSync: new Date().toISOString() });
  } catch (err) { next(err); }
};

exports.tickets = (req, res, next) => {
  try {
    const lastSync = validateIso(req.query.lastSync) || '1970-01-01 00:00:00';
    const tickets = Sync.ticketsSince(req.user.userId, lastSync);
    const deleted = Sync.deletedTicketsSince(req.user.userId, lastSync);
    res.json({ tickets, deleted, lastSync: new Date().toISOString() });
  } catch (err) { next(err); }
};

exports.offline = (req, res, next) => {
  try {
    const { actions } = req.body;
    if (!Array.isArray(actions)) {
      return res.status(400).json({ message: 'actions must be an array.' });
    }
    const synced = [];
    const failed = [];
    actions.forEach((a, i) => {
      if (a && a.type) synced.push({ index: i, action: a.type, status: 'accepted' });
      else failed.push({ index: i, reason: 'Missing action type' });
    });
    res.json({ synced, failed, processedAt: new Date().toISOString() });
  } catch (err) { next(err); }
};
