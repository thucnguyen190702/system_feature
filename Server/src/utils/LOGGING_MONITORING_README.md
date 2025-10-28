# Hệ thống Logging và Monitoring - Hướng dẫn Sử dụng

## Tổng quan

Friend System server bao gồm khả năng logging và monitoring toàn diện sử dụng Winston cho logging và hệ thống thu thập metrics tùy chỉnh.

## Các Component

### 1. Winston Logger (`config/logger.ts`)

Logger được cấu hình với:
- **Log Levels**: debug, info, warn, error
- **File Transports**:
  - `logs/error.log` - Chỉ error logs
  - `logs/combined.log` - Tất cả logs
- **Console Transport**: Chỉ trong development mode
- **Log Rotation**: Tối đa 5MB file size, giữ lại 5 files
- **Format**: JSON với timestamps và stack traces

### 2. Request Logger (`middleware/requestLogger.ts`)

Logs tất cả incoming API requests với:
- HTTP method
- URL
- IP address
- User agent
- Response status code
- Response time

### 3. Error Logger (`middleware/errorLogger.ts`)

Logs tất cả errors với:
- Error name, message và stack trace
- Request context (method, URL, headers, body)
- IP address và user agent
- Timestamp

### 4. Metrics Collector (`utils/metrics.ts`)

Theo dõi system metrics bao gồm:
- **Counters**: Giá trị tăng dần (ví dụ: tổng requests)
- **Gauges**: Giá trị hiện tại (ví dụ: active connections)
- **Histograms**: Phân phối giá trị (ví dụ: response times)

#### Available Metrics

**API Metrics:**
- `api_requests_total` - Total API requests
- `api_requests_success` - Successful requests (2xx-3xx)
- `api_requests_error` - Failed requests (4xx-5xx)
- `api_response_time_ms` - Response time histogram

**Friend System Metrics:**
- `friend_requests_sent` - Friend requests sent
- `friend_requests_accepted` - Friend requests accepted
- `friend_requests_rejected` - Friend requests rejected
- `friends_added` - Friends added
- `friends_removed` - Friends removed

**Account Metrics:**
- `accounts_created` - Accounts created
- `accounts_updated` - Accounts updated
- `accounts_online` - Currently online accounts

**Database Metrics:**
- `db_queries_total` - Total database queries
- `db_query_time_ms` - Query time histogram

**Cache Metrics:**
- `cache_hits` - Cache hits
- `cache_misses` - Cache misses

**Error Metrics:**
- `errors_total` - Total errors
- `errors_by_type` - Errors by type

## Usage

### Logging

```typescript
import { logger } from './config/logger';

// Info logging
logger.info('User logged in', { userId: '123', username: 'john' });

// Error logging
logger.error('Database connection failed', { error: err.message });

// Debug logging
logger.debug('Cache hit', { key: 'user:123' });

// Warning logging
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });
```

### Metrics

```typescript
import { metrics, MetricNames } from './utils/metrics';

// Increment counter
metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);

// Record gauge
metrics.recordGauge(MetricNames.ACCOUNTS_ONLINE, 150);

// Record histogram value
metrics.recordHistogram(MetricNames.DB_QUERY_TIME, 45);

// Get metrics
const totalRequests = metrics.getCounter(MetricNames.API_REQUESTS_TOTAL);
const responseTimeStats = metrics.getHistogramStats(MetricNames.API_RESPONSE_TIME);
```

### Viewing Metrics

Access the metrics endpoint:
```
GET http://localhost:3000/metrics
```

Response:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metrics": {
    "counters": {
      "api_requests_total": 1250,
      "api_requests_success": 1180,
      "api_requests_error": 70
    },
    "gauges": {
      "accounts_online": 150
    },
    "histograms": {
      "api_response_time_ms": {
        "count": 1250,
        "min": 5,
        "max": 450,
        "avg": 85.5
      }
    }
  }
}
```

## Integration in Services

### Example: Friend Service

```typescript
import { logger } from '../config/logger';
import { metrics, MetricNames } from '../utils/metrics';

export class FriendService {
    async sendFriendRequest(fromAccountId: string, toAccountId: string): Promise<FriendRequest> {
        try {
            logger.info('Sending friend request', { fromAccountId, toAccountId });
            
            // Business logic...
            const request = await this.friendRequestRepository.save(newRequest);
            
            // Track metric
            metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);
            
            logger.info('Friend request sent successfully', { requestId: request.requestId });
            return request;
        } catch (error) {
            logger.error('Failed to send friend request', {
                error: error.message,
                stack: error.stack,
                fromAccountId,
                toAccountId
            });
            
            metrics.incrementCounter(MetricNames.ERRORS_TOTAL);
            throw error;
        }
    }
}
```

## Log Files

Logs are stored in the `logs/` directory:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

**Note**: The `logs/` directory is created automatically when the server starts.

## Production Considerations

### Log Rotation
- Logs automatically rotate when they reach 5MB
- Maximum of 5 log files are retained
- Older logs are automatically deleted

### Metrics Summary
- In production, metrics summary is logged every 5 minutes
- Helps track system health over time

### Performance
- Logging is asynchronous and non-blocking
- Minimal performance impact on API requests
- Metrics collection uses in-memory storage

## Environment Variables

```env
NODE_ENV=production          # Set to 'production' for production logging
LOG_LEVEL=info              # Optional: Override log level (debug, info, warn, error)
```

## Monitoring Best Practices

1. **Log Important Events**: Log user actions, errors, and system events
2. **Include Context**: Always include relevant IDs and data
3. **Track Metrics**: Increment counters for business events
4. **Monitor Response Times**: Use histograms for timing data
5. **Review Logs Regularly**: Check error logs daily
6. **Set Up Alerts**: Monitor metrics for anomalies

## Future Enhancements

- Integration with external monitoring services (Datadog, New Relic)
- Prometheus metrics export
- Real-time log streaming
- Custom dashboards
- Alert notifications

## Troubleshooting

### Logs Not Appearing
- Check that `logs/` directory exists and is writable
- Verify `NODE_ENV` is set correctly
- Check log level configuration

### High Log Volume
- Increase log rotation size
- Adjust log level to 'info' or 'warn' in production
- Filter out noisy log entries

### Metrics Not Updating
- Verify middleware is properly registered
- Check that services are calling metrics methods
- Access `/metrics` endpoint to view current values
