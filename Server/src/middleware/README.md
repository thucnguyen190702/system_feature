# Authentication Middleware - Hướng dẫn Sử dụng

Thư mục này chứa authentication middleware cho Friend System API.

## Tổng quan

Hệ thống xác thực sử dụng JWT (JSON Web Tokens) để xác thực an toàn. Tokens có hiệu lực 7 ngày theo mặc định.

## Files

- `auth.ts` - Triển khai authentication middleware
- `index.ts` - Exports để import dễ dàng

## Usage

### Generating Tokens

```typescript
import { generateToken } from '../utils/jwt';

// Generate token for a user
const token = generateToken('account-123', 'username');
```

### Protecting Routes

```typescript
import express from 'express';
import { authMiddleware } from './middleware';

const app = express();

// Protected route - requires authentication
app.get('/api/friends/:accountId', authMiddleware, (req, res) => {
    // Access authenticated user via req.user
    const { accountId } = req.user!;
    // ... handle request
});
```

### Optional Authentication

```typescript
import { optionalAuthMiddleware } from './middleware';

// Route that works with or without authentication
app.get('/api/search/username', optionalAuthMiddleware, (req, res) => {
    // req.user will be present if token was provided and valid
    if (req.user) {
        // User is authenticated
    } else {
        // User is not authenticated
    }
});
```

### Client-Side Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Example with fetch:

```javascript
fetch('http://localhost:3000/api/friends/account-123', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

## Error Responses

The middleware returns the following error responses:

### 401 Unauthorized

**No authorization header:**
```json
{
    "success": false,
    "error": "No authorization header provided"
}
```

**Invalid header format:**
```json
{
    "success": false,
    "error": "Invalid authorization header format. Expected: Bearer <token>"
}
```

**No token provided:**
```json
{
    "success": false,
    "error": "No token provided"
}
```

**Token expired:**
```json
{
    "success": false,
    "error": "Token has expired"
}
```

**Invalid token:**
```json
{
    "success": false,
    "error": "Invalid token"
}
```

## Environment Variables

Configure JWT settings in `.env`:

```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
```

**Important:** Always use a strong, unique JWT_SECRET in production!

## Security Best Practices

1. **Never expose JWT_SECRET** - Keep it secure and never commit it to version control
2. **Use HTTPS** - Always use HTTPS in production to prevent token interception
3. **Token expiration** - Tokens expire after 7 days by default
4. **Refresh tokens** - Consider implementing refresh tokens for better security
5. **Token storage** - Store tokens securely on the client (avoid localStorage for sensitive apps)

## Testing

You can test the authentication with curl:

```bash
# Get a token (from login endpoint)
TOKEN="your-jwt-token-here"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/friends/account-123
```

## TypeScript Types

The middleware extends the Express Request type to include user information:

```typescript
interface Request {
    user?: {
        accountId: string;
        username?: string;
    }
}
```

Access the authenticated user in your route handlers:

```typescript
app.get('/protected', authMiddleware, (req, res) => {
    const accountId = req.user!.accountId;
    const username = req.user?.username;
});
```
