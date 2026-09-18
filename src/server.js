require('dotenv').config();

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const db = require('./config/db');

const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

try {
  db.prepare('SELECT 1 FROM users LIMIT 1').get();
} catch (err) {
  console.log('Database not initialised. Run: npm run db:init');
}

// HTTP server
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`CampusPass API (HTTP) running on http://localhost:${HTTP_PORT}`);
});

// HTTPS server
const certPath = path.join(__dirname, '../certs/cert.pem');
const keyPath = path.join(__dirname, '../certs/key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`CampusPass API (HTTPS) running on https://localhost:${HTTPS_PORT}`);
  });
} else {
  console.log('HTTPS disabled — certificate not found. Run: npm run cert:gen');
}
