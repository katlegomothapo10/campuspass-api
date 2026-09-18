const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CampusPass API',
      version: '1.0.0',
      description: 'REST API for the CampusPass campus event management platform. Handles authentication, event management, ticket registration, QR generation, waitlists, attendance tracking, feedback, reporting and offline sync.'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development (HTTP)' },
      { url: 'https://localhost:3443', description: 'Local development (HTTPS)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Katlego Mothapo' },
            email: { type: 'string', example: 'katlego@example.com' },
            studentNumber: { type: 'string', example: 'ST10442760' },
            password: { type: 'string', example: 'secret123' },
            role: { type: 'string', enum: ['student', 'organizer', 'admin'], example: 'student' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'katlego@example.com' },
            password: { type: 'string', example: 'secret123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { type: 'object' }
          }
        },
        EventRequest: {
          type: 'object',
          required: ['title', 'date', 'time', 'location', 'capacity', 'category'],
          properties: {
            title: { type: 'string', example: 'Campus Music Festival' },
            description: { type: 'string', example: 'Live music and food' },
            date: { type: 'string', example: '2026-10-15' },
            time: { type: 'string', example: '18:00' },
            location: { type: 'string', example: 'Amphitheatre' },
            capacity: { type: 'integer', example: 100 },
            category: { type: 'string', enum: ['academic', 'social', 'sports', 'cultural', 'other'] },
            waitlistEnabled: { type: 'boolean', example: true }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
