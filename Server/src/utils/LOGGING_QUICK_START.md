# Logging và Monitoring - Hướng dẫn Khởi động Nhanh - Hướng dẫn Sử dụng

## 🚀 Bắt đầu trong 2 Phút

### 1. Import Logger và Metrics

```typescript
import { logger } from '../config/logger';
import { metrics, MetricNames } from '../utils/metrics';
```

### 2. Thêm Logging vào Service của bạn

```typescript
export class MyService {
    async myMethod(userId: string): Promise<void> {
        logger.info('Bắt đầu thao tác', { userId });
        
        try {
            // Business logic của bạn ở đây
            
            logger.info('Thao tác hoàn thành', { userId });
        } catch (error) {
            logger.error('Thao tác thất bại', {
                error: error instanceof Error ? error.message : 'Lỗi không xác định',
                stack: error instanceof Error ? error.stack : undefined,
                userId
            });
            throw error;
        }
    }
}
```

### 3. Theo dõi Metrics

```typescript
// Tăng counter
metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);

// Ghi lại timing
const startTime = Date.now();
// ... thực hiện công việc ...
const duration = Date.now() - startTime;
metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, duration);

// Ghi lại gauge (giá trị hiện tại)
metrics.recordGauge(MetricNames.ACCOUNTS_ONLINE, 150);
```

## 📊 Xem Logs và Metrics

### Xem Logs
```bash
# Tất cả logs
tail -f logs/combined.log

# Chỉ errors
tail -f logs/error.log
```

### Xem Metrics
```bash
# Qua API
curl http://localhost:3000/metrics

# Hoặc mở trong browser
http://localhost:3000/metrics
```

## 🎯 Common Patterns

### Pattern 1: Service Method with Logging
```typescript
async createAccount(username: string): Promise<InGameAccount> {
    logger.info('Creating account', { username });
    
    try {
        const account = await this.repository.save(newAccount);
        
        metrics.incrementCounter(MetricNames.ACCOUNTS_CREATED);
        logger.info('Account created', { accountId: account.accountId, username });
        
        return account;
    } catch (error) {
        logger.error('Failed to create account', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            username
        });
        metrics.incrementCounter(MetricNames.ERRORS_TOTAL);
        throw error;
    }
}
```

### Pattern 2: Controller with Error Handling
```typescript
async handleRequest(req: Request, res: Response): Promise<void> {
    try {
        const result = await this.service.doSomething(req.body);
        res.json(result);
    } catch (error) {
        // Error is automatically logged by errorLogger middleware
        res.status(500).json({ error: error.message });
    }
}
```

### Pattern 3: Timing Operations
```typescript
async expensiveOperation(): Promise<void> {
    const startTime = Date.now();
    
    try {
        // Do work
        await this.doWork();
        
        const duration = Date.now() - startTime;
        metrics.recordHistogram(MetricNames.DB_QUERY_TIME, duration);
        logger.debug('Operation completed', { duration: `${duration}ms` });
    } catch (error) {
        logger.error('Operation failed', { error: error.message });
        throw error;
    }
}
```

## 📝 Log Levels

Use appropriate log levels:

- **debug**: Detailed information for debugging
- **info**: General information about operations
- **warn**: Warning messages for potential issues
- **error**: Error messages with stack traces

```typescript
logger.debug('Cache hit', { key: 'user:123' });
logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });
logger.error('Database connection failed', { error: err.message });
```

## 🎨 Best Practices

1. **Always include context**: Add relevant IDs and data
   ```typescript
   logger.info('Friend request sent', { fromAccountId, toAccountId, requestId });
   ```

2. **Log at entry and exit**: Log when operations start and complete
   ```typescript
   logger.info('Starting friend request');
   // ... work ...
   logger.info('Friend request completed');
   ```

3. **Track business metrics**: Increment counters for important events
   ```typescript
   metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);
   ```

4. **Use try-catch**: Always catch and log errors
   ```typescript
   try {
       // work
   } catch (error) {
       logger.error('Failed', { error: error.message, stack: error.stack });
       throw error;
   }
   ```

5. **Don't log sensitive data**: Never log passwords, tokens, etc.
   ```typescript
   // ❌ Bad
   logger.info('User login', { password: user.password });
   
   // ✅ Good
   logger.info('User login', { userId: user.id, username: user.username });
   ```

## 🔍 Debugging Tips

### Find errors in logs
```bash
grep "error" logs/combined.log
```

### Find specific user activity
```bash
grep "userId.*123" logs/combined.log
```

### Monitor real-time logs
```bash
tail -f logs/combined.log | grep "error"
```

### Check metrics
```bash
curl http://localhost:3000/metrics | jq '.metrics.counters'
```

## 📦 What's Already Set Up

✅ Winston logger configured
✅ Request logging middleware active
✅ Error logging middleware active
✅ Metrics collection system active
✅ `/metrics` endpoint available
✅ Log files auto-rotate
✅ Console logging in development

## 🎯 You're Ready!

Just import and use:
```typescript
import { logger } from '../config/logger';
import { metrics, MetricNames } from '../utils/metrics';

logger.info('Hello from my service!');
metrics.incrementCounter(MetricNames.API_REQUESTS_TOTAL);
```

That's it! 🎉
