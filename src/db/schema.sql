PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  userId INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  studentNumber TEXT UNIQUE,
  passwordHash TEXT,
  profileImage TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','zu','af')),
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','organizer','admin')),
  notificationsEnabled INTEGER NOT NULL DEFAULT 1,
  biometricEnabled INTEGER NOT NULL DEFAULT 0,
  googleId TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clubs (
  clubId INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  ownerUserId INTEGER NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ownerUserId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  eventId INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  registeredCount INTEGER NOT NULL DEFAULT 0,
  waitlistCount INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK(category IN ('academic','social','sports','cultural','other')),
  clubId INTEGER,
  organizerUserId INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming','ongoing','completed','cancelled')),
  waitlistEnabled INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (clubId) REFERENCES clubs(clubId) ON DELETE SET NULL,
  FOREIGN KEY (organizerUserId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  ticketId INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  qrCode TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','used','cancelled','expired')),
  registrationDate TEXT NOT NULL DEFAULT (datetime('now')),
  scannedDate TEXT,
  waitlistPosition INTEGER,
  FOREIGN KEY (eventId) REFERENCES events(eventId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  UNIQUE(eventId, userId)
);

CREATE TABLE IF NOT EXISTS attendance (
  attendanceId INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketId INTEGER NOT NULL UNIQUE,
  eventId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  scannedByUserId INTEGER NOT NULL,
  scannedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticketId) REFERENCES tickets(ticketId) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(eventId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (scannedByUserId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  feedbackId INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  anonymous INTEGER NOT NULL DEFAULT 0,
  submittedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (eventId) REFERENCES events(eventId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  settingId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(userId, key),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS waitlist (
  waitlistId INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  position INTEGER NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(eventId, userId),
  FOREIGN KEY (eventId) REFERENCES events(eventId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  logId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  action TEXT NOT NULL,
  entity TEXT,
  entityId INTEGER,
  details TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE SET NULL
);
