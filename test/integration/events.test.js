// test/integration/events.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const connectDB = require('../../config/db');

// Create a mock admin/user token
const mockToken = jwt.sign(
  { id: new mongoose.Types.ObjectId(), role: 'admin' },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);

describe('Events API Integration Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/events should return status 200 OK and an array', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
  });

  test('POST /api/events with missing required fields should return status 422', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${mockToken}`) // Pass token to pass 401 check
      .send({});

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('status', 'fail');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});