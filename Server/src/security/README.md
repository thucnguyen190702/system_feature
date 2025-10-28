# Tài liệu Security Features - Hướng dẫn Sử dụng

Tài liệu này mô tả các security features được triển khai trong Friend System server.

## Tổng quan

Triển khai security bao gồm ba lĩnh vực chính:
1. **Data Encryption** - Bảo vệ sensitive data at rest và in transit
2. **Rate Limiting** - Ngăn chặn spam và abuse
3. **Block List** - Cho phép users chặn các tương tác không mong muốn

## 1. Data Encryption (Yêu cầu: 5.1, 5.4)

### Encryption Utility (`utils/encryption.ts`)

Cung cấp AES-256-GCM encryption cho sensitive data với các tính năng sau:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 với 100,000 iterations
- **Authentication**: Built-in authentication tags ngăn chặn tampering
- **Random IVs**: Mỗi encryption sử dụng unique initialization vector

#### Ví dụ Sử dụng

```typescript
import { encrypt, decrypt } from '../utils/encryption';

// Encrypt sensitive data
const encrypted = encrypt('sensitive-data');
// Trả về: "salt:iv:authTag:encryptedData" (tất cả base64 encoded)

// Decrypt data
const decrypted = decrypt(encrypted);
// Trả về: "sensitive-data"
```

#### Cấu hình

Thêm vào `.env`:
```
ENCRYPTION_SECRET=your_encryption_secret_key_here_change_in_production_min_32_chars
```

**Quan trọng**: Encryption secret phải có ít nhất 32 ký tự và nên được giữ an toàn.

### HTTPS Enforcement (`middleware/https.ts`)

Đảm bảo tất cả API calls sử dụng HTTPS trong production:

```typescript
import { enforceHttps, securityHeaders } from '../middleware/https';

// Áp dụng cho tất cả routes
app.use(enforceHttps);
app.use(securityHeaders);
```

**Security Headers Được thêm**:
- `X-Frame-Options: DENY` - Ngăn chặn clickjacking
- `X-Content-Type-Options: nosniff` - Ngăn chặn MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Bật XSS protection
- `Strict-Transport-Security` - Buộc HTTPS (chỉ production)
- `Content-Security-Policy` - Hạn chế resource loading

## 2. Rate Limiting (Yêu cầu: 5.2)

### Rate Limiter Middleware (`middleware/rateLimit.ts`)

Triển khai flexible rate limiting với Redis support và in-memory fallback.

#### Available Rate Limiters

1. **Friend Request Rate Limiter**
   - Limit: 20 requests per day per account
   - Prevents spam friend requests
   ```typescript
   import { friendRequestRateLimiter } from '../middleware/rateLimit';
   router.post('/friend-requests', friendRequestRateLimiter, controller.sendFriendRequest);
   ```

2. **General API Rate Limiter**
   - Limit: 100 requests per 15 minutes per account/IP
   - Protects against general API abuse
   ```typescript
   import { generalRateLimiter } from '../middleware/rateLimit';
   app.use('/api', generalRateLimiter);
   ```

3. **Authentication Rate Limiter**
   - Limit: 5 requests per 15 minutes per IP
   - Prevents brute force attacks
   ```typescript
   import { authRateLimiter } from '../middleware/rateLimit';
   router.post('/auth/login', authRateLimiter, controller.login);
   ```

4. **Search Rate Limiter**
   - Limit: 30 searches per minute per account
   - Prevents search abuse
   ```typescript
   import { searchRateLimiter } from '../middleware/rateLimit';
   router.get('/search', searchRateLimiter, controller.search);
   ```

#### Custom Rate Limiter

Create custom rate limiters for specific needs:

```typescript
import { createRateLimiter } from '../middleware/rateLimit';

const customLimiter = createRateLimiter({
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 10,
    message: 'Custom rate limit exceeded',
    keyGenerator: (req) => `custom:${req.user?.accountId}`
});
```

#### Rate Limit Headers

All rate-limited responses include headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - When the limit resets (ISO timestamp)

#### Storage

- **Primary**: Redis (distributed, recommended for production)
- **Fallback**: In-memory store (single server only)

## 3. Block List (Requirements: 5.3)

### Database Schema

**Table**: `blocked_accounts`

| Column | Type | Description |
|--------|------|-------------|
| block_id | VARCHAR(36) | Primary key (UUID) |
| blocker_account_id | VARCHAR(36) | Account doing the blocking |
| blocked_account_id | VARCHAR(36) | Account being blocked |
| reason | VARCHAR(255) | Optional reason for block |
| created_at | TIMESTAMP | When block was created |

**Indexes**:
- Unique constraint on (blocker_account_id, blocked_account_id)
- Index on blocker_account_id
- Index on blocked_account_id

### Block Service (`services/BlockService.ts`)

Manages block operations:

```typescript
import { BlockService } from '../services/BlockService';

const blockService = new BlockService();

// Block an account
await blockService.blockAccount(blockerAccountId, blockedAccountId, 'Spam');

// Unblock an account
await blockService.unblockAccount(blockerAccountId, blockedAccountId);

// Check if blocked
const isBlocked = await blockService.isBlocked(blockerAccountId, blockedAccountId);

// Check bidirectional (either has blocked the other)
const isBlockedBoth = await blockService.isBlockedBidirectional(accountId1, accountId2);

// Get blocked accounts list
const blockedAccounts = await blockService.getBlockedAccounts(blockerAccountId);
```

### Block Controller (`controllers/BlockController.ts`)

REST API endpoints for block operations:

#### Block an Account
```
POST /api/blocks
Authorization: Bearer <token>
Body: {
  "blockedAccountId": "uuid",
  "reason": "optional reason"
}
```

#### Unblock an Account
```
DELETE /api/blocks/:blockedAccountId
Authorization: Bearer <token>
```

#### Get Blocked Accounts
```
GET /api/blocks
Authorization: Bearer <token>
```

#### Check Block Status
```
GET /api/blocks/check/:accountId
Authorization: Bearer <token>
```

### Integration with Friend System

The block list is automatically enforced in friend operations:

- **Friend Requests**: Cannot send friend requests to blocked accounts
- **Bidirectional Check**: Prevents requests if either party has blocked the other
- **Error Message**: Generic message to prevent information disclosure

```typescript
// In FriendService.sendFriendRequest()
const isBlocked = await this.blockService.isBlockedBidirectional(fromAccountId, toAccountId);
if (isBlocked) {
    throw new Error('Cannot send friend request to this account');
}
```

## Setup Instructions

### 1. Environment Variables

Update your `.env` file:

```env
# Encryption
ENCRYPTION_SECRET=your_encryption_secret_key_here_change_in_production_min_32_chars

# Redis (for rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
NODE_ENV=production  # Enable HTTPS enforcement
```

### 2. Run Migrations

Create the blocked_accounts table:

```bash
npm run migration:run
```

### 3. Apply Middleware

Update `src/index.ts`:

```typescript
import { enforceHttps, securityHeaders } from './middleware/https';
import { generalRateLimiter } from './middleware/rateLimit';

// Apply security middleware
app.use(enforceHttps);
app.use(securityHeaders);
app.use('/api', generalRateLimiter);
```

### 4. Add Block Routes

Create routes for block operations:

```typescript
import { BlockController } from './controllers/BlockController';
import { authMiddleware } from './middleware/auth';

const blockController = new BlockController();

router.post('/api/blocks', authMiddleware, blockController.blockAccount.bind(blockController));
router.delete('/api/blocks/:blockedAccountId', authMiddleware, blockController.unblockAccount.bind(blockController));
router.get('/api/blocks', authMiddleware, blockController.getBlockedAccounts.bind(blockController));
router.get('/api/blocks/check/:accountId', authMiddleware, blockController.checkBlocked.bind(blockController));
```

## Security Best Practices

### 1. Encryption
- ✅ Use strong encryption secrets (min 32 characters)
- ✅ Rotate encryption keys periodically
- ✅ Never commit secrets to version control
- ✅ Use environment variables for configuration

### 2. Rate Limiting
- ✅ Use Redis in production for distributed rate limiting
- ✅ Monitor rate limit violations
- ✅ Adjust limits based on usage patterns
- ✅ Implement exponential backoff for repeated violations

### 3. Block List
- ✅ Use generic error messages to prevent information disclosure
- ✅ Implement bidirectional checks
- ✅ Log block/unblock actions for audit
- ✅ Consider cascade deletes when accounts are deleted

### 4. HTTPS
- ✅ Always use HTTPS in production
- ✅ Use valid SSL certificates
- ✅ Enable HSTS headers
- ✅ Redirect HTTP to HTTPS

## Testing

### Test Encryption
```typescript
import { encrypt, decrypt } from '../utils/encryption';

const original = 'test-data';
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.assert(original === decrypted, 'Encryption/decryption failed');
```

### Test Rate Limiting
```bash
# Send multiple requests to test rate limiting
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/friend-requests \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"toAccountId":"test-id"}'
done
```

### Test Block List
```bash
# Block an account
curl -X POST http://localhost:3000/api/blocks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"blockedAccountId":"test-id","reason":"Test"}'

# Try to send friend request (should fail)
curl -X POST http://localhost:3000/api/friend-requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"toAccountId":"test-id"}'
```

## Monitoring

### Metrics to Track
- Rate limit violations per endpoint
- Number of blocked accounts
- Encryption/decryption errors
- HTTPS enforcement violations

### Logging
All security events are logged using Winston:
- Rate limit exceeded
- Block/unblock actions
- Encryption errors
- HTTPS violations

## Troubleshooting

### Rate Limiting Not Working
1. Check Redis connection
2. Verify middleware is applied
3. Check rate limit headers in response

### Encryption Errors
1. Verify ENCRYPTION_SECRET is set
2. Check secret length (min 32 chars)
3. Ensure encrypted data format is correct

### Block List Issues
1. Run migrations to create table
2. Check foreign key constraints
3. Verify BlockedAccount entity is registered

## References

- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
