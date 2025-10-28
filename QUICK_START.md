# Friend System - Quick Start Guide

Get the Friend System up and running in minutes!

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, but recommended)

### Option 1: Docker (Recommended)

```bash
# 1. Navigate to server directory
cd Server

# 2. Setup environment
npm run setup:env

# 3. Deploy everything
npm run deploy

# 4. Verify it's running
curl http://localhost:3000/health
```

**Done!** The system is now running at `http://localhost:3000`

### Option 2: Manual Setup

```bash
# 1. Navigate to server directory
cd Server

# 2. Install dependencies
npm install

# 3. Setup environment
npm run setup:env

# 4. Run migrations
npm run migration:run

# 5. Start the server
npm run dev
```

---

## 📚 Documentation

### For Developers
- **[API Documentation](Server/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](Server/DEPLOYMENT.md)** - Detailed deployment instructions
- **[Setup Guide](Server/SETUP.md)** - Development environment setup
- **[Migration Guide](Server/MIGRATION_GUIDE.md)** - Database migration instructions

### For End Users
- **[User Guide](USER_GUIDE.md)** - How to use the Friend System
- **[Unity Guide](Client/Assets/Scripts/FriendSystem/USER_GUIDE_UNITY.md)** - Unity client instructions

### For System Administrators
- **[Deployment Guide](Server/DEPLOYMENT.md)** - Production deployment
- **[Monitoring Guide](Server/src/utils/LOGGING_MONITORING_README.md)** - Logging and monitoring

---

## 🎯 Common Tasks

### Start Development Server
```bash
cd Server
npm run dev
```

### Run Tests
```bash
cd Server
npm test
```

### Deploy to Production
```bash
cd Server
npm run deploy
```

### Manage Database Migrations
```bash
cd Server
npm run migrate
```

### View Logs
```bash
# Docker
docker-compose logs -f app

# Local
tail -f Server/logs/combined.log
```

---

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=friend_system
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_key

# Rate Limiting
FRIEND_REQUEST_DAILY_LIMIT=10
```

See `.env.example` for all available options.

---

## 📖 API Endpoints

### Account Management
- `POST /api/accounts` - Create account
- `GET /api/accounts/:id` - Get account
- `PUT /api/accounts/:id` - Update account

### Friend Management
- `GET /api/friends/:accountId` - Get friend list
- `DELETE /api/friends/:friendId` - Remove friend
- `POST /api/friends/status` - Update online status

### Friend Requests
- `POST /api/friend-requests` - Send request
- `GET /api/friend-requests/:accountId/pending` - Get pending
- `POST /api/friend-requests/:id/accept` - Accept request

### Search
- `GET /api/search/username?q=query` - Search by username
- `GET /api/search/id/:accountId` - Search by ID

See [API Documentation](Server/API_DOCUMENTATION.md) for complete details.

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check logs
docker-compose logs app

# Verify database connection
npm run db:test

# Check environment variables
cat .env
```

### Database Connection Failed
```bash
# Test PostgreSQL
psql -h localhost -U postgres -d friend_system

# Check if PostgreSQL is running
docker-compose ps postgres
```

### Migration Errors
```bash
# Check migration status
npm run migration:show

# Revert and retry
npm run migration:revert
npm run migration:run
```

See [Deployment Guide](Server/DEPLOYMENT.md) for more troubleshooting.

---

## 🏗️ Project Structure

```
Friend-System/
├── Server/                          # Node.js backend
│   ├── src/
│   │   ├── controllers/            # API controllers
│   │   ├── services/               # Business logic
│   │   ├── entities/               # TypeORM entities
│   │   ├── middleware/             # Express middleware
│   │   ├── migrations/             # Database migrations
│   │   └── config/                 # Configuration
│   ├── scripts/                    # Deployment scripts
│   ├── Dockerfile                  # Docker configuration
│   ├── docker-compose.yml          # Service orchestration
│   └── API_DOCUMENTATION.md        # API docs
│
├── Client/                         # Unity client
│   └── Assets/Scripts/FriendSystem/
│       ├── Core/                   # Core functionality
│       ├── Managers/               # Manager classes
│       ├── Models/                 # Data models
│       └── UI/                     # UI components
│
└── Documentation/
    ├── USER_GUIDE.md              # User guide
    ├── DEPLOYMENT.md              # Deployment guide
    └── QUICK_START.md             # This file
```

---

## 🔐 Security

### Before Production

- [ ] Change default database password
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular backups
- [ ] Monitoring and alerts

See [Deployment Guide](Server/DEPLOYMENT.md) for security checklist.

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### View Metrics
```bash
# Application logs
docker-compose logs -f app

# Database performance
docker-compose exec postgres psql -U postgres -d friend_system
```

### Performance Monitoring
- Friend list load time: < 2 seconds
- Friend request processing: < 1 second
- Concurrent users: 1000+

---

## 🤝 Support

### Getting Help

1. **Documentation**: Check the relevant guide
2. **Logs**: Review application logs
3. **Issues**: Check for known issues
4. **Community**: Ask in forums or Discord

### Useful Links

- [API Documentation](Server/API_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Deployment Guide](Server/DEPLOYMENT.md)
- [Troubleshooting](Server/DEPLOYMENT.md#troubleshooting)

---

## 📝 Next Steps

### For Developers
1. Read the [API Documentation](Server/API_DOCUMENTATION.md)
2. Set up your development environment
3. Run the test suite
4. Start building features

### For Users
1. Read the [User Guide](USER_GUIDE.md)
2. Create your account
3. Add some friends
4. Explore the features

### For Administrators
1. Read the [Deployment Guide](Server/DEPLOYMENT.md)
2. Set up production environment
3. Configure monitoring
4. Set up backups

---

## 🎉 You're Ready!

The Friend System is now set up and ready to use. Enjoy connecting with friends!

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
