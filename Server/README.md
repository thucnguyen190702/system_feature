# Authentication Server

Node.js TypeScript server for game authentication system.

## Project Structure

```
server/
├── src/
│   ├── modules/
│   │   └── auth/                    # Authentication module
│   │       ├── auth.module.ts       # Module entry point
│   │       ├── auth.controller.ts   # HTTP endpoints
│   │       ├── auth.service.ts      # Business logic
│   │       ├── auth.repository.ts   # Data access
│   │       ├── entities/
│   │       │   └── user.entity.ts   # TypeORM entity
│   │       ├── dto/                 # Data transfer objects
│   │       │   ├── register.dto.ts
│   │       │   ├── login.dto.ts
│   │       │   └── auth-response.dto.ts
│   │       ├── middleware/
│   │       │   └── auth.middleware.ts
│   │       └── types/
│   │           └── jwt-payload.ts
│   ├── shared/
│   │   ├── database/
│   │   │   └── database.config.ts   # PostgreSQL config
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   └── password.util.ts
│   │   └── types/
│   │       └── express.d.ts
│   ├── config/
│   │   └── environment.ts           # Environment variables
│   └── app.ts                       # Application entry
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure database settings in `.env`

4. Build the project:
```bash
npm run build
```

5. Run database migrations:
```bash
npm run migration:run
```

6. Run development server:
```bash
npm run dev
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run production server
- `npm run dev` - Run development server with ts-node

### Migration Scripts

- `npm run migration:run` - Run all pending migrations
- `npm run migration:revert` - Revert the last executed migration
- `npm run migration:show` - Show all migrations and their status
- `npm run migration:generate -- src/migrations/MigrationName` - Generate a new migration based on entity changes
- `npm run migration:create -- src/migrations/MigrationName` - Create a blank migration file

### Database Migrations

The project uses TypeORM migrations for database schema management. The initial migration creates the `users` table with:

- **Authentication fields**: id, username, passwordHash
- **Profile fields**: displayName, avatarUrl, level
- **Status fields**: onlineStatus, lastOnlineAt
- **Privacy settings**: privacySettings (JSONB)
- **Timestamps**: createdAt, updatedAt

**Indexes:**
- `idx_users_username` - For fast username lookups during login
- `idx_users_online_status` - For querying online users efficiently

**Constraints:**
- `chk_username_length` - Ensures username is between 3-50 characters
- `chk_valid_online_status` - Ensures onlineStatus is one of: 'online', 'offline', 'away', 'busy'

To run migrations in production:
```bash
npm run build
npm run migration:run
```

## Dependencies

- **express** - Web framework
- **typeorm** - ORM for PostgreSQL
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT token generation/validation
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

## Integration with Other Modules

### Using Authentication Middleware

To protect your endpoints with authentication, import and apply the `AuthMiddleware`:

```typescript
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

// Protected endpoint - requires authentication
router.get('/api/your-endpoint', 
  AuthMiddleware.authenticate,
  async (req, res) => {
    // Access authenticated user data
    const userId = req.user.userId;
    const username = req.user.username;
    
    // Your logic here
    res.json({ success: true, userId, username });
  }
);
```

### Accessing Authenticated User Data

After authentication middleware validates the token, user information is available in `req.user`:

```typescript
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;    // UUID of authenticated user
    username: string;  // Username of authenticated user
  };
}
```

### Example: Creating a Protected Module

```typescript
// your-module.controller.ts
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';

export class YourController {
  private router: Router;
  
  constructor() {
    this.router = Router();
    this.registerRoutes();
  }
  
  private registerRoutes(): void {
    // Apply middleware to protect routes
    this.router.get('/api/your-data', 
      AuthMiddleware.authenticate,
      this.getData.bind(this)
    );
  }
  
  private async getData(req: Request, res: Response): Promise<void> {
    const userId = req.user.userId;
    // Fetch user-specific data
    res.json({ success: true, data: {} });
  }
  
  getRouter(): Router {
    return this.router;
  }
}
```

For complete integration examples and best practices, see:
- [Integration Guide](../.kiro/specs/authentication-system/INTEGRATION_GUIDE.md)
- [Quick Reference](../.kiro/specs/authentication-system/QUICK_INTEGRATION_REFERENCE.md)
- [Example Modules](../.kiro/specs/authentication-system/examples/)
