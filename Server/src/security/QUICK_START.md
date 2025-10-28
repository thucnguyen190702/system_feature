# Security Features - Hướng dẫn Khởi động Nhanh - Hướng dẫn Sử dụng

Khởi động security features trong 5 phút.

## 1. Thiết lập Môi trường (1 phút)

Thêm vào file `.env` của bạn:

```env
# Bắt buộc cho encryption
ENCRYPTION_SECRET=change_this_to_a_secure_random_string_at_least_32_characters_long

# Tùy chọn: Redis cho distributed rate limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# Bật HTTPS enforcement trong production
NODE_ENV=production
```

## 2. Chạy Database Migration (1 phút)

Tạo bảng blocked_accounts:

```bash
npm run migration:run
```

## 3. Áp dụng Middleware (2 phút)

Cập nhật `src/index.ts`:

```typescript
import express from 'express';
import { enforceHttps, securityHeaders } from './middleware/https';
import { generalRateLimiter } from './middleware/rateLimit';

const app = express();

// Áp dụng security middleware TRƯỚC routes
app.use(enforceHttps);           // Enforce HTTPS trong production
app.use(securityHeaders);         // Thêm security headers
app.use('/api', generalRateLimiter);  // Rate limit tất cả API routes

// ... routes của bạn ở đây
```

## 4. Thêm Block Routes (1 phút)

Thêm block management endpoints:

```typescript
import { Router } from 'express';
import { BlockController } from './controllers/BlockController';
import { authMiddleware } from './middleware/auth';

const router = Router();
const blockController = new BlockController();

// Block management routes
router.post('/api/blocks', 
    authMiddleware, 
    blockController.blockAccount.bind(blockController)
);

router.delete('/api/blocks/:blockedAccountId', 
    authMiddleware, 
    blockController.unblockAccount.bind(blockController)
);

router.get('/api/blocks', 
    authMiddleware, 
    blockController.getBlockedAccounts.bind(blockController)
);

router.get('/api/blocks/check/:accountId', 
    authMiddleware, 
    blockController.checkBlocked.bind(blockController)
);

export default router;
```

## 5. Apply Specific Rate Limiters (Optional)

Add rate limiters to specific endpoints:

```typescript
import { friendRequestRateLimiter, searchRateLimiter } from './middleware/rateLimit';

// Limit friend requests to 20 per day
router.post('/api/friend-requests', 
    authMiddleware, 
    friendRequestRateLimiter,  // Add this
    friendController.sendFriendRequest
);

// Limit searches to 30 per minute
router.get('/api/search/username', 
    authMiddleware, 
    searchRateLimiter,  // Add this
    searchController.searchByUsername
);
```

## That's It! 🎉

Your security features are now active:

- ✅ HTTPS enforced in production
- ✅ Security headers added to all responses
- ✅ Rate limiting active on all API routes
- ✅ Block list ready to use
- ✅ Encryption utilities available

## Quick Test

### Test Rate Limiting
```bash
# Send 101 requests quickly (should get rate limited)
for i in {1..101}; do
  curl http://localhost:3000/api/health
done
```

### Test Block Feature
```bash
# Block an account
curl -X POST http://localhost:3000/api/blocks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blockedAccountId":"account-to-block"}'

# Try to send friend request (should fail)
curl -X POST http://localhost:3000/api/friend-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toAccountId":"account-to-block"}'
```

### Test Encryption
```typescript
import { encrypt, decrypt } from './utils/encryption';

const sensitive = "user-email@example.com";
const encrypted = encrypt(sensitive);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
// Should match original
```

## Common Issues

### "ENCRYPTION_SECRET environment variable is not set"
- Add `ENCRYPTION_SECRET` to your `.env` file
- Make sure it's at least 32 characters long

### Rate limiting not working
- Check if Redis is running (optional but recommended)
- Verify middleware is applied before routes
- Check rate limit headers in response

### Block table doesn't exist
- Run migrations: `npm run migration:run`
- Check database connection

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Adjust rate limits based on your needs
- Set up monitoring for security events

## Need Help?

Check the logs for security events:
```bash
# View logs
tail -f logs/combined.log | grep -i "security\|rate\|block"
```
