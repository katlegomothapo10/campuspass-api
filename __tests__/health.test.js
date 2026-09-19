jest.mock('better-sqlite3', () => {
  const mockDb = {
    pragma: jest.fn(),
    exec: jest.fn(),
    prepare: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      all: jest.fn().mockReturnValue([]),
      run: jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 0 })
    })
  };
  return jest.fn(() => mockDb);
});

const request = require('supertest');

describe('CampusPass API health check', () => {
  let app;

  beforeAll(() => {
    app = require('../src/app');
  });

  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CampusPass API');
  });

  it('GET /unknown-route should return 404 JSON', async () => {
    const res = await request(app).get('/totally-unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });
});
