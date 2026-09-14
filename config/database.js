const Database = require('better-sqlite3');
const path = require('path');

// Creates/opens a database file called campuspass.db
const db = new Database(path.join(__dirname, '../campuspass.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ Database connected successfully');

module.exports = db;