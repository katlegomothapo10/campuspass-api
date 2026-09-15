const db = require('../config/database');

const User = {
  create: (name, email, studentNumber, hashedPassword, role = 'student') => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, student_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, studentNumber, hashedPassword, role);
    return result.lastInsertRowid;
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  findByStudentNumber: (studentNumber) => {
    const stmt = db.prepare('SELECT * FROM users WHERE student_number = ?');
    return stmt.get(studentNumber);
  },

  update: (id, name, email, studentNumber) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, student_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, email, studentNumber, id);
    return User.findById(id);
  },

  getSafeUser: (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
};

module.exports = User;