# Friend System Server

Node.js TypeScript server for the Friend System with PostgreSQL database.

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE friend_system_db;
```

4. Run database migrations:
```bash
npm run migration:run
```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Project Structure

```
Server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Database connection
│   │   └── logger.ts    # Winston logger
│   ├── entities/        # TypeORM entities
│   │   ├── InGameAccount.ts
│   │   ├── FriendRequest.ts
│   │   └── FriendRelationship.ts
│   ├── services/        # Business logic (to be added)
│   ├── controllers/     # API controllers (to be added)
│   ├── middleware/      # Express middleware (to be added)
│   ├── routes/          # API routes (to be added)
│   ├── migrations/      # Database migrations (to be added)
│   └── index.ts         # Application entry point
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## API Endpoints

Health check:
- `GET /health` - Server health status

More endpoints will be added in subsequent tasks.

## Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

The database uses three main tables:
- `accounts` - User accounts
- `friend_requests` - Friend request records
- `friend_relationships` - Friend connections

Detailed schema will be created in the next task (Database Schema implementation).
