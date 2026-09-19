const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '../../certs');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'ZA' },
  { name: 'organizationName', value: 'CampusPass Development' },
  { name: 'organizationalUnitName', value: 'Backend' }
];

const options = {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: true },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      keyEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' }
      ]
    }
  ]
};

const pems = selfsigned.generate(attrs, options);

fs.writeFileSync(path.join(certDir, 'key.pem'), pems.private);
fs.writeFileSync(path.join(certDir, 'cert.pem'), pems.cert);

console.log('SSL certificate generated:');
console.log('  - certs/cert.pem');
console.log('  - certs/key.pem');
