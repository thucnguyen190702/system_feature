import request from 'supertest';
import express, { Express } from 'express';
import { DatabaseConfig } from '../shared/database/database.config';
import { AuthModule } from '../modules/auth/auth.module';
import { ErrorHandlerMiddleware } from '../shared/middleware/error-handler.middleware';
import { User } from '../modules/auth/entities/user.entity';

/**
 * End-to-End Integration Tests
 * Tests the complete authentication flow from client to server
 */
describe('End-to-End Integration Tests', () => {
  let app: Express;
  let authModule: AuthModule;
  let testUsers: string[] = [];

  beforeAll(async () => {
    // Initialize database
    await DatabaseConfig.initialize();

    // Setup Express app with CORS
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Initialize Auth Module
    const dataSource = DatabaseConfig.getDataSource();
    authModule = new AuthModule(dataSource);
    authModule.initialize(app);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Setup error handling
    app.use(ErrorHandlerMiddleware.notFound);
    app.use(ErrorHandlerMiddleware.handle);
  });

  afterAll(async () => {
    // Cleanup all test users
    if (testUsers.length > 0) {
      const dataSource = DatabaseConfig.getDataSource();
      const userRepository = dataSource.getRepository(User);
      await userRepository.delete({ username: { $in: testUsers } as any });
    }

    // Close database connection
    await DatabaseConfig.close();
  });

  describe('1. Health Check Endpoint', () => {
    it('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Full Registration Flow', () => {
    let registeredUsername: string;
    let registeredToken: string;
    let registeredUserId: string;

    it('should complete full registration flow with valid inputs', async () => {
      registeredUsername = `e2euser${Date.now()}`;
      testUsers.push(registeredUsername);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: registeredUsername,
          password: 'testpass123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(response.body.username).toBe(registeredUsername);

      registeredToken = response.body.token;
      registeredUserId = response.body.userId;
    });

    it('should validate the token received from registration', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${registeredToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(registeredUserId);
      expect(response.body.username).toBe(registeredUsername);
    });

    it('should prevent duplicate registration with same username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: registeredUsername,
          password: 'differentpass',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username already exists');
    });
  });

  describe('3. Full Login Flow', () => {
    let loginUsername: string;
    let loginPassword: string;
    let loginToken: string;
    let loginUserId: string;

    beforeAll(async () => {
      // Create a user for login tests
      loginUsername = `loginuser${Date.now()}`;
      loginPassword = 'loginpass123';
      testUsers.push(loginUsername);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: loginUsername,
          password: loginPassword,
        });

      expect(response.status).toBe(201);
    });

    it('should complete full login flow with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: loginUsername,
          password: loginPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(response.body.username).toBe(loginUsername);

      loginToken = response.body.token;
      loginUserId = response.body.userId;
    });

    it('should validate the token received from login', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(loginUserId);
      expect(response.body.username).toBe(loginUsername);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: loginUsername,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser999',
          password: 'anypassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('4. Token Validation Flow', () => {
    let validToken: string;
    let validUserId: string;
    let validUsername: string;

    beforeAll(async () => {
      // Create a user and get token
      validUsername = `tokenuser${Date.now()}`;
      testUsers.push(validUsername);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: validUsername,
          password: 'tokenpass123',
        });

      validToken = response.body.token;
      validUserId = response.body.userId;
    });

    it('should validate a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(validUserId);
      expect(response.body.username).toBe(validUsername);
    });

    it('should reject request without Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
    });

    it('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid authorization header format. Expected: Bearer <token>');
    });

    it('should reject request with malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with empty token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('5. Session Persistence Simulation', () => {
    let persistentUsername: string;
    let persistentPassword: string;
    let firstToken: string;
    let secondToken: string;

    it('should register a new user (initial session)', async () => {
      persistentUsername = `persistent${Date.now()}`;
      persistentPassword = 'persistpass123';
      testUsers.push(persistentUsername);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: persistentUsername,
          password: persistentPassword,
        })
        .expect(201);

      firstToken = response.body.token;
      expect(firstToken).toBeDefined();
    });

    it('should validate the stored token (simulating app restart)', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${firstToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.username).toBe(persistentUsername);
    });

    it('should login again after token validation (simulating re-login)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: persistentUsername,
          password: persistentPassword,
        })
        .expect(200);

      secondToken = response.body.token;
      expect(secondToken).toBeDefined();
    });

    it('should validate the new token after re-login', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.username).toBe(persistentUsername);
    });

    it('should still validate the old token (both tokens valid)', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${firstToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.username).toBe(persistentUsername);
    });
  });

  describe('6. Error Scenarios', () => {
    describe('6.1 Invalid Credentials', () => {
      it('should return generic error for invalid username', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'nonexistent',
            password: 'anypassword',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid credentials');
      });

      it('should return generic error for invalid password', async () => {
        const username = `erroruser${Date.now()}`;
        testUsers.push(username);

        // Register user
        await request(app)
          .post('/api/auth/register')
          .send({
            username: username,
            password: 'correctpass',
          });

        // Try to login with wrong password
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: username,
            password: 'wrongpass',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });

    describe('6.2 Network Errors (Simulated)', () => {
      it('should handle malformed JSON in request body', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .set('Content-Type', 'application/json')
          .send('{"username": "test", invalid json}')
          .expect(500); // Malformed JSON causes 500 error

        expect(response.body.success).toBe(false);
      });

      it('should handle missing Content-Type header', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send('username=test&password=test')
          .expect(400);

        // Should still process but fail validation
        expect(response.body.success).toBe(false);
      });
    });

    describe('6.3 Token Expiration', () => {
      it('should reject expired token', async () => {
        // Create a token that expires immediately using jwt directly
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
          { userId: 'test-id', username: 'testuser' },
          process.env.JWT_SECRET || 'dev-secret-key-change-in-production-12345',
          { expiresIn: '0s' }
        );

        // Wait a moment to ensure expiration
        await new Promise(resolve => setTimeout(resolve, 100));

        const response = await request(app)
          .get('/api/auth/validate')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('expired');
      });
    });

    describe('6.4 Validation Errors', () => {
      it('should reject username that is too short', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'ab',
            password: 'validpass123',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('username');
      });

      it('should reject username that is too long', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'a'.repeat(51),
            password: 'validpass123',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('username');
      });

      it('should reject username with invalid characters', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'invalid@user!',
            password: 'validpass123',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('alphanumeric');
      });

      it('should reject password that is too short', async () => {
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

      it('should reject missing username', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            password: 'validpass123',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should reject missing password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'validuser',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('7. Error Message Display', () => {
    it('should return user-friendly error for username conflict', async () => {
      const username = `conflict${Date.now()}`;
      testUsers.push(username);

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send({
          username: username,
          password: 'password123',
        })
        .expect(201);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: username,
          password: 'password123',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username already exists');
    });

    it('should return user-friendly error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return user-friendly error for missing authorization', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
    });

    it('should return user-friendly error for validation failures', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe('string');
    });

    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });

  describe('8. Complete User Journey', () => {
    it('should complete full user journey: register -> validate -> logout -> login -> validate', async () => {
      const username = `journey${Date.now()}`;
      const password = 'journeypass123';
      testUsers.push(username);

      // Step 1: Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({ username, password })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      const registerToken = registerResponse.body.token;
      const userId = registerResponse.body.userId;

      // Step 2: Validate token from registration
      const validateRegisterResponse = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${registerToken}`)
        .expect(200);

      expect(validateRegisterResponse.body.success).toBe(true);
      expect(validateRegisterResponse.body.userId).toBe(userId);

      // Step 3: Simulate logout (client clears token)
      // No server-side action needed

      // Step 4: Login again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username, password })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      const loginToken = loginResponse.body.token;

      // Step 5: Validate token from login
      const validateLoginResponse = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(validateLoginResponse.body.success).toBe(true);
      expect(validateLoginResponse.body.userId).toBe(userId);
      expect(validateLoginResponse.body.username).toBe(username);
    });
  });
});
