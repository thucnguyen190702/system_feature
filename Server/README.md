# Hệ thống Bạn bè Server - Hướng dẫn Sử dụng

Node.js TypeScript server cho Hệ thống Bạn bè với cơ sở dữ liệu PostgreSQL.

## Yêu cầu Tiên quyết

- Node.js 18+ LTS
- PostgreSQL 14+
- npm hoặc yarn

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình biến môi trường:
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
```

3. Tạo PostgreSQL database:
```sql
CREATE DATABASE friend_system_db;
```

4. Chạy database migrations:
```bash
npm run migration:run
```

## Phát triển

Khởi động development server:
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## Build

Build cho production:
```bash
npm run build
```

## Scripts

- `npm run dev` - Khởi động development server với hot reload
- `npm run build` - Build TypeScript thành JavaScript
- `npm start` - Khởi động production server
- `npm run migration:generate` - Tạo migration mới
- `npm run migration:run` - Chạy các migration đang chờ
- `npm run migration:revert` - Hoàn tác migration cuối cùng

## Cấu trúc Dự án

```
Server/
├── src/
│   ├── config/          # File cấu hình
│   │   ├── database.ts  # Kết nối database
│   │   └── logger.ts    # Winston logger
│   ├── entities/        # TypeORM entities
│   │   ├── InGameAccount.ts
│   │   ├── FriendRequest.ts
│   │   └── FriendRelationship.ts
│   ├── services/        # Business logic (sẽ được thêm)
│   ├── controllers/     # API controllers (sẽ được thêm)
│   ├── middleware/      # Express middleware (sẽ được thêm)
│   ├── routes/          # API routes (sẽ được thêm)
│   ├── migrations/      # Database migrations (sẽ được thêm)
│   └── index.ts         # Entry point ứng dụng
├── logs/                # Application logs
├── .env                 # Biến môi trường
├── .env.example         # Template biến môi trường
├── package.json         # Dependencies
└── tsconfig.json        # Cấu hình TypeScript
```

## API Endpoints

Health check:
- `GET /health` - Trạng thái sức khỏe server

Thêm endpoints sẽ được thêm trong các task tiếp theo.

## Biến Môi trường

Xem `.env.example` để biết tất cả các tùy chọn cấu hình có sẵn.

## Database Schema

Database sử dụng ba bảng chính:
- `accounts` - Tài khoản người dùng
- `friend_requests` - Bản ghi lời mời kết bạn
- `friend_relationships` - Kết nối bạn bè

Schema chi tiết sẽ được tạo trong task tiếp theo (triển khai Database Schema).
