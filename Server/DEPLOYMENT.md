# Hướng dẫn Deployment Hệ thống Bạn bè - Hướng dẫn Sử dụng

Hướng dẫn này cung cấp các bước chi tiết để deploy Friend System server trong các môi trường khác nhau.

## Mục lục

1. [Yêu cầu Tiên quyết](#yêu-cầu-tiên-quyết)
2. [Thiết lập Môi trường](#thiết-lập-môi-trường)
3. [Local Development Deployment](#local-development-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Migrations](#database-migrations)
7. [Monitoring và Bảo trì](#monitoring-và-bảo-trì)
8. [Xử lý Sự cố](#xử-lý-sự-cố)

---

## Yêu cầu Tiên quyết

### Phần mềm Cần thiết

- **Node.js**: Phiên bản 18 trở lên
- **npm**: Phiên bản 8 trở lên
- **PostgreSQL**: Phiên bản 14 trở lên
- **Docker** (tùy chọn): Phiên bản 20.10 trở lên
- **Docker Compose** (tùy chọn): Phiên bản 2.0 trở lên
- **Redis** (tùy chọn): Phiên bản 7 trở lên (cho caching)

### Yêu cầu Hệ thống

**Tối thiểu**:
- CPU: 2 cores
- RAM: 2 GB
- Storage: 10 GB

**Khuyến nghị**:
- CPU: 4 cores
- RAM: 4 GB
- Storage: 20 GB
- SSD cho database

---

## Environment Setup

### 1. Clone the Repository

```bash
cd Server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

#### Option A: Automated Setup (Recommended)

```bash
npm run setup:env
```

This interactive script will:
- Create `.env` file from `.env.example`
- Generate a secure JWT secret
- Prompt for database configuration
- Optionally configure Redis

#### Option B: Manual Setup

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=friend_system
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000
FRIEND_REQUEST_DAILY_LIMIT=10
```

**Important**: Always generate a strong JWT secret for production:

```bash
openssl rand -base64 32
```

---

## Local Development Deployment

### 1. Setup Database

Ensure PostgreSQL is running and create the database:

```bash
psql -U postgres
CREATE DATABASE friend_system;
\q
```

### 2. Run Migrations

```bash
npm run migration:run
```

### 3. Verify Schema

```bash
npm run verify:schema
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 5. Verify Installation

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T10:00:00.000Z"
}
```

---

## Docker Deployment

Docker deployment is the recommended method for production environments.

### 1. Prerequisites

Ensure Docker and Docker Compose are installed:

```bash
docker --version
docker-compose --version
```

### 2. Configure Environment

Create and configure `.env` file (see [Environment Setup](#environment-setup))

### 3. Build and Start Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Node.js application

### 4. Run Migrations

```bash
docker-compose exec app npm run migration:run
```

### 5. Verify Deployment

```bash
docker-compose ps
curl http://localhost:3000/health
```

### 6. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 7. Stop Services

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

---

## Production Deployment

### Automated Deployment Script

Use the provided deployment script for streamlined deployment:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script will:
1. Validate environment configuration
2. Build Docker images
3. Stop existing containers
4. Start new containers
5. Run database migrations
6. Verify schema
7. Perform health checks

### Manual Production Deployment

#### 1. Build Application

```bash
npm run build
```

#### 2. Set Production Environment

```bash
export NODE_ENV=production
```

#### 3. Run Migrations

```bash
npm run migration:run
```

#### 4. Start Application

Using PM2 (recommended):

```bash
npm install -g pm2
pm2 start dist/index.js --name friend-system
pm2 save
pm2 startup
```

Or using systemd:

Create `/etc/systemd/system/friend-system.service`:

```ini
[Unit]
Description=Friend System Server
After=network.target postgresql.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/friend-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable friend-system
sudo systemctl start friend-system
sudo systemctl status friend-system
```

### Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/friend-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/friend-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL/TLS Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Migrations

### Running Migrations

```bash
# Run all pending migrations
npm run migration:run

# Using Docker
docker-compose exec app npm run migration:run
```

### Reverting Migrations

```bash
# Revert last migration
npm run migration:revert

# Using Docker
docker-compose exec app npm run migration:revert
```

### Checking Migration Status

```bash
npm run migration:show
```

### Creating New Migrations

```bash
npm run migration:generate -- -n MigrationName
```

### Interactive Migration Manager

```bash
chmod +x scripts/migrate.sh
./scripts/migrate.sh
```

---

## Monitoring and Maintenance

### Health Checks

The application provides a health endpoint:

```bash
curl http://localhost:3000/health
```

### Logs

Logs are stored in the `logs/` directory:

- `combined.log`: All logs
- `error.log`: Error logs only

View logs in real-time:

```bash
tail -f logs/combined.log
```

### Database Backup

#### Manual Backup

```bash
pg_dump -U postgres friend_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres friend_system | gzip > $BACKUP_DIR/friend_system_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab for daily backups:

```bash
0 2 * * * /path/to/scripts/backup.sh
```

### Database Restore

```bash
psql -U postgres friend_system < backup_file.sql
```

### Performance Monitoring

Monitor application metrics:

```bash
# Using PM2
pm2 monit

# Using Docker
docker stats friend-system-app
```

### Database Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting

### Application Won't Start

**Check logs**:
```bash
docker-compose logs app
# or
tail -f logs/error.log
```

**Common issues**:
- Database connection failed: Verify database credentials in `.env`
- Port already in use: Change `PORT` in `.env` or stop conflicting service
- Missing environment variables: Ensure all required variables are set

### Database Connection Issues

**Test connection**:
```bash
psql -h localhost -U postgres -d friend_system
```

**Check PostgreSQL status**:
```bash
sudo systemctl status postgresql
# or
docker-compose ps postgres
```

### Migration Failures

**Check migration status**:
```bash
npm run migration:show
```

**Revert and retry**:
```bash
npm run migration:revert
npm run migration:run
```

**Manual fix**:
```bash
psql -U postgres friend_system
# Manually fix schema issues
```

### Performance Issues

**Check resource usage**:
```bash
docker stats
# or
top
htop
```

**Optimize database**:
```sql
VACUUM ANALYZE;
REINDEX DATABASE friend_system;
```

**Check slow queries**:
```bash
# Enable slow query logging in PostgreSQL
# Edit postgresql.conf:
log_min_duration_statement = 1000  # Log queries > 1 second
```

### Redis Connection Issues

**Test Redis connection**:
```bash
redis-cli ping
# Expected: PONG
```

**Check Redis status**:
```bash
docker-compose ps redis
# or
sudo systemctl status redis
```

### High Memory Usage

**Check Node.js memory**:
```bash
pm2 info friend-system
```

**Increase memory limit**:
```bash
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

---

## Security Checklist

Before deploying to production:

- [ ] Change default database password
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Review and restrict CORS settings

---

## Scaling Considerations

### Horizontal Scaling

Use a load balancer (e.g., Nginx, HAProxy) to distribute traffic across multiple application instances:

```bash
docker-compose up --scale app=3
```

### Database Scaling

- Enable connection pooling (already configured)
- Set up read replicas for read-heavy workloads
- Consider database sharding for very large datasets

### Caching

Redis is already integrated for caching friend lists. Ensure Redis is enabled in production for optimal performance.

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Consult the [API Documentation](./API_DOCUMENTATION.md)
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
