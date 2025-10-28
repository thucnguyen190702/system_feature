# Hệ thống Bạn bè Server - Hướng dẫn Thiết lập

## Bước 1: Cài đặt PostgreSQL

### Windows
1. Tải PostgreSQL từ https://www.postgresql.org/download/windows/
2. Chạy installer và làm theo hướng dẫn thiết lập
3. Nhớ mật khẩu postgres user
4. Port mặc định là 5432

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Bước 2: Tạo Database

Mở PostgreSQL command line (psql) hoặc sử dụng pgAdmin:

```sql
-- Kết nối với postgres user
CREATE DATABASE friend_system_db;

-- Xác minh database đã được tạo
\l
```

## Step 3: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=friend_system_db
```

3. Generate a secure JWT secret:
```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Update `JWT_SECRET` in `.env` with the generated value.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Database Connection

Before running migrations, verify your database connection:

```bash
npm run db:test
```

Expected output:
```
🔍 Testing database connection...
   Host: localhost
   Port: 5432
   Database: friend_system_db
   User: postgres
✅ Database connection successful!
✅ Database time: 2024-01-01 00:00:00.000000+00
✅ Connection closed successfully
```

## Step 6: Run Migrations

Run the database migrations to create all tables:

```bash
npm run migration:run
```

Expected output:
```
Migration CreateAccountsTable1700000001 has been executed successfully.
Migration CreateFriendRequestsTable1700000002 has been executed successfully.
Migration CreateFriendRelationshipsTable1700000003 has been executed successfully.
```

Verify the schema was created correctly:

```bash
npm run schema:verify
```

For detailed migration documentation, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## Step 7: Start Development Server

```bash
npm run dev
```

The server should start on http://localhost:3000

## Verify Installation

1. Check health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Friend System API"
}
```

2. Check database connection:
Look for this message in the console:
```
✅ Database connection established successfully
```

## Troubleshooting

### Database Connection Failed

**Error**: `ECONNREFUSED` or `password authentication failed`

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for postgresql service)
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check your `.env` credentials match your PostgreSQL setup

3. Verify the database exists:
   ```sql
   psql -U postgres -l
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change the PORT in `.env` to a different value (e.g., 3001)
2. Or stop the process using port 3000

### TypeScript Compilation Errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After successful setup:
1. Proceed to Task 2: Implement Database Schema
2. Run migrations to create tables
3. Test API endpoints as they are implemented

## Development Tips

- Use `npm run dev` for hot-reload during development
- Check `logs/combined.log` for application logs
- Check `logs/error.log` for error logs
- Use a tool like Postman or Insomnia to test API endpoints
