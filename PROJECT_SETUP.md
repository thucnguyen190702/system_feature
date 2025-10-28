# Friend System - Complete Project Setup

This guide covers the complete setup for both the Unity Client and Node.js Server.

## Project Structure

```
friend-system/
├── Client/                          # Unity Project
│   └── Assets/
│       └── Scripts/
│           └── FriendSystem/        # Friend System Scripts
│               ├── Config/          # Configuration
│               ├── Core/            # Core functionality
│               ├── Models/          # Data models
│               ├── README.md
│               └── SETUP.md         # Unity setup guide
├── Server/                          # Node.js Server
│   ├── src/
│   │   ├── config/                  # Server configuration
│   │   ├── entities/                # TypeORM entities
│   │   └── index.ts                 # Entry point
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── SETUP.md                     # Server setup guide
└── PROJECT_SETUP.md                 # This file
```

## Quick Start

### 1. Server Setup

```bash
# Navigate to server directory
cd Server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
createdb friend_system_db

# Start development server
npm run dev
```

Server will run on: http://localhost:3000

### 2. Unity Client Setup

1. Open the Unity project in `Client/` folder
2. Install Newtonsoft.Json package:
   - Window > Package Manager
   - Add package by name: `com.unity.nuget.newtonsoft-json`
3. Create FriendSystemConfig asset:
   - Right-click in Project > Create > Friend System > Config
   - Set Server URL to `http://localhost:3000`
4. Verify Project Settings:
   - Edit > Project Settings > Player
   - Api Compatibility Level: **.NET Standard 2.1**

## Detailed Setup Guides

- **Server Setup**: See `Server/SETUP.md`
- **Unity Client Setup**: See `Client/Assets/Scripts/FriendSystem/SETUP.md`

## Prerequisites

### Server
- Node.js 18+ LTS
- PostgreSQL 14+
- npm or yarn

### Unity Client
- Unity 2021.3 LTS or newer
- .NET Standard 2.1 support

## Environment Configuration

### Server (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=friend_system_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*
```

### Unity Client (FriendSystemConfig)

- **Server URL**: http://localhost:3000
- **Request Timeout**: 30 seconds
- **Max Friends**: 100

## Verification

### Test Server

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"Friend System API"}
```

### Test Unity Client

1. Create a test GameObject with this script:

```csharp
using UnityEngine;
using FriendSystem.Core;

public class TestConnection : MonoBehaviour
{
    async void Start()
    {
        var client = new ApiClient("http://localhost:3000", 30);
        try
        {
            var result = await client.GetAsync<object>("/health");
            Debug.Log("✅ Connected to server!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"❌ Connection failed: {e.Message}");
        }
    }
}
```

2. Enter Play mode and check Console

## Current Implementation Status

✅ **Task 1: Infrastructure Setup** (COMPLETED)
- Server project structure created
- TypeScript and TypeORM configured
- Database connection setup
- Environment variables configured
- Unity client structure created
- API client implemented
- Data models defined

⏳ **Next Tasks**:
- Task 2: Database Schema (migrations)
- Task 3: TypeORM Entities (already created, needs testing)
- Task 4+: Services, Controllers, Managers, UI

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.x
- **ORM**: TypeORM 0.3+
- **Database**: PostgreSQL 14+
- **Authentication**: JWT
- **Logging**: Winston

### Frontend
- **Engine**: Unity 2021.3 LTS+
- **Language**: C# (.NET Standard 2.1)
- **HTTP Client**: UnityWebRequest
- **JSON**: Newtonsoft.Json
- **Async**: Task-based async/await

## Development Workflow

1. **Start Server**: `cd Server && npm run dev`
2. **Open Unity**: Open `Client/` project
3. **Develop**: Make changes to server or client
4. **Test**: Use Unity Play mode or API testing tools
5. **Commit**: Commit changes to version control

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Verify PostgreSQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **Unity compilation errors**
   - Install Newtonsoft.Json package
   - Set Api Compatibility Level to .NET Standard 2.1
   - Restart Unity Editor

3. **CORS errors**
   - Set `CORS_ORIGIN=*` in server `.env`
   - Restart server

4. **Port already in use**
   - Change `PORT` in `.env`
   - Or stop the process using that port

## Support

For detailed setup instructions:
- Server: `Server/SETUP.md`
- Unity Client: `Client/Assets/Scripts/FriendSystem/SETUP.md`
- Server API: `Server/README.md`
- Client Usage: `Client/Assets/Scripts/FriendSystem/README.md`

## Next Steps

1. Complete Task 2: Implement Database Schema
2. Run migrations to create tables
3. Implement services and controllers
4. Build Unity managers and UI components
5. Integration testing

---

**Note**: This is Task 1 of the implementation plan. The infrastructure is now ready for subsequent tasks.
