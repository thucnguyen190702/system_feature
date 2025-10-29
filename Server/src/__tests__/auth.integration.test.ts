import request from 'supertest';
import express, { Express } from 'express';
import { DatabaseConfig } from '../shared/database/database.config';
import { AuthModule } from '../modules/auth/auth.module';
import { ErrorHandlerMiddleware } from '../shared/middleware/error-handler.middleware';
import { User } from '../modules/auth/entities/user.entity';

describe('Authentication Integration Tests', () => {
  let app: Express;
  let authModule: AuthModule;
  let testUsername: string;

  beforeAll(async () => {
    // Initialize database
    await DatabaseConfig.initialize();

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Initialize Auth Module
    const dataSource = DatabaseConfig.getDataSource();
    authModule = new AuthModule(dataSource);
    authModule.initialize(app);

    // Setup error handling
    app.use(ErrorHandlerMiddleware.notFound);
    app.use(ErrorHandlerMiddleware.handle);
  });

  afterAll(async () => {
    // Cleanup test user if exists
    if (testUsername) {
      const dataSource = DatabaseConfig.getDataSource();
      const userRepository = dataSource.getRepository(User);
      await userRepository.delete({ username: testUsername });
    }

    // Close database connection
    await DatabaseConfig.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid inputs', async () => {
      testUsername = `testuser${Date.now()}`;

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername,
          password: 'password123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(response.body.username).toBe(testUsername);
    });

    it('should reject registration with existing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername,
          password: 'password123',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username already exists');
    });

    it('should reject registration with short username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('username');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          password: '12345',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should reject registration with invalid username characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'invalid@user',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(response.body.username).toBe(testUsername);
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/validate', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token by logging in
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'password123',
        });

      validToken = response.body.token;
    });

    it('should validate a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
      expect(response.body.username).toBe(testUsername);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });

    it('should return appropriate status codes for errors', async () => {
      // Test 400 Bad Request
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab' })
        .expect(400);

      // Test 401 Unauthorized
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'wrong', password: 'wrong' })
        .expect(401);

      // Test 409 Conflict
      await request(app)
        .post('/api/auth/register')
        .send({ username: testUsername, password: 'password123' })
        .expect(409);
    });
  });
});
