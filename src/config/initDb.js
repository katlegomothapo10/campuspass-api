const fs = require('fs');
const path = require('path');
const db = require('./db');

const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

db.exec(schema);

console.log(' CampusPass database schema initialised');
process.exit(0);