import request from 'supertest';
import app from '../src/app.js';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toHaveProperty('id');
  });

  it('should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should fail with missing email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      });

    expect(response.status).toBe(400);
  });

  it('should fail with missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
      });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return user data when authenticated', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should return 401 with malformed authorization header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'invalid-format');

    expect(response.status).toBe(401);
  });
});