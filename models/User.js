const db = require('../config/database');

const User = {
  // Create a new user
  create: (name, email, studentNumber, hashedPassword, role = 'student') => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, student_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, studentNumber, hashedPassword, role);
    return result.lastInsertRowid;
  },

  // Find user by email
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Find user by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Find user by student number
  findByStudentNumber: (studentNumber) => {
    const stmt = db.prepare('SELECT * FROM users WHERE student_number = ?');
    return stmt.get(studentNumber);
  },

  // Remove password from user object before sending to client
  getSafeUser: (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
};

module.exports = User;