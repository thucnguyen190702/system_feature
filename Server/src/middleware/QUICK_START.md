# Authentication Middleware - Hướng dẫn Khởi động Nhanh - Hướng dẫn Sử dụng

## 🚀 Thiết lập Nhanh

### 1. Cấu hình Môi trường

Thêm vào file `.env` của bạn:
```env
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### 2. Import Middleware

```typescript
import { authMiddleware } from './middleware';
import { generateToken } from './utils';
```

### 3. Generate Token (Login)

```typescript
// After successful login/authentication
const token = generateToken(accountId, username);

res.json({
    success: true,
    token,
    accountId
});
```

### 4. Protect Routes

```typescript
import express from 'express';
import { authMiddleware } from './middleware';

const app = express();

// Protected route
app.get('/api/friends/:accountId', authMiddleware, (req, res) => {
    const { accountId } = req.user!;
    // Your logic here
});
```

### 5. Client-Side Usage

```typescript
// Unity C# example
using UnityEngine.Networking;

UnityWebRequest request = UnityWebRequest.Get(url);
request.SetRequestHeader("Authorization", $"Bearer {token}");
await request.SendWebRequest();
```

```javascript
// JavaScript/TypeScript example
fetch('/api/friends/account-123', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## 📋 Common Patterns

### Pattern 1: User Registration/Login
```typescript
router.post('/register', async (req, res) => {
    // Create account
    const account = await accountService.createAccount(username);
    
    // Generate token
    const token = generateToken(account.accountId, account.username);
    
    res.json({ success: true, token, account });
});
```

### Pattern 2: Protected Resource Access
```typescript
router.get('/profile', authMiddleware, async (req, res) => {
    const { accountId } = req.user!;
    const profile = await accountService.getAccount(accountId);
    res.json({ success: true, profile });
});
```

### Pattern 3: Owner-Only Access
```typescript
router.put('/accounts/:accountId', authMiddleware, async (req, res) => {
    const { accountId } = req.params;
    const authenticatedId = req.user!.accountId;
    
    if (accountId !== authenticatedId) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update account
});
```

## ⚠️ Common Errors

### Error: "No authorization header provided"
**Solution:** Include Authorization header in request
```typescript
headers: { 'Authorization': `Bearer ${token}` }
```

### Error: "Token has expired"
**Solution:** Generate a new token (implement refresh token or re-login)

### Error: "Invalid token"
**Solution:** Verify token was generated correctly and not corrupted

## 🔒 Security Checklist

- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Never commit JWT_SECRET to version control
- ✅ Use HTTPS in production
- ✅ Set appropriate token expiration
- ✅ Validate user permissions in route handlers
- ✅ Store tokens securely on client side

## 🧪 Testing

### Test Token Generation
```typescript
import { generateToken, verifyToken } from './utils';

const token = generateToken('test-account-123');
const decoded = verifyToken(token);
console.log(decoded); // { accountId: 'test-account-123' }
```

### Test with curl
```bash
# Get token
TOKEN="your-jwt-token"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/friends/account-123
```

## 📚 Additional Resources

- Full documentation: `README.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Code examples: `../examples/auth-example.ts`
- JWT.io: https://jwt.io (for debugging tokens)

## 🆘 Troubleshooting

**Problem:** TypeScript error "Property 'user' does not exist on type 'Request'"

**Solution:** The middleware extends Express Request type. Make sure to import from the middleware file.

**Problem:** Token works in Postman but not in Unity

**Solution:** Check Authorization header format: `Bearer <token>` (note the space)

**Problem:** Token expires too quickly

**Solution:** Adjust JWT_EXPIRES_IN in .env (e.g., '30d' for 30 days)
