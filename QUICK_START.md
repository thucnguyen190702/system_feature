# Hệ thống Bạn bè - Hướng dẫn Khởi động Nhanh

Khởi động Hệ thống Bạn bè chỉ trong vài phút!

## 🚀 Khởi động Nhanh (5 Phút)

### Yêu cầu Tiên quyết
- Node.js 18+
- PostgreSQL 14+
- Docker (tùy chọn, nhưng được khuyến nghị)

### Tùy chọn 1: Docker (Khuyến nghị)

```bash
# 1. Chuyển đến thư mục server
cd Server

# 2. Thiết lập môi trường
npm run setup:env

# 3. Deploy tất cả
npm run deploy

# 4. Kiểm tra hoạt động
curl http://localhost:3000/health
```

**Hoàn thành!** Hệ thống hiện đang chạy tại `http://localhost:3000`

### Tùy chọn 2: Thiết lập Thủ công

```bash
# 1. Chuyển đến thư mục server
cd Server

# 2. Cài đặt dependencies
npm install

# 3. Thiết lập môi trường
npm run setup:env

# 4. Chạy migrations
npm run migration:run

# 5. Khởi động server
npm run dev
```

---

## 📚 Tài liệu

### Dành cho Developers
- **[Tài liệu API](Server/API_DOCUMENTATION.md)** - Tham khảo API đầy đủ
- **[Hướng dẫn Deployment](Server/DEPLOYMENT.md)** - Hướng dẫn deployment chi tiết
- **[Hướng dẫn Setup](Server/SETUP.md)** - Thiết lập môi trường phát triển
- **[Hướng dẫn Migration](Server/MIGRATION_GUIDE.md)** - Hướng dẫn database migration

### Dành cho Người dùng Cuối
- **[Hướng dẫn Người dùng](USER_GUIDE.md)** - Cách sử dụng Hệ thống Bạn bè
- **[Hướng dẫn Unity](Client/Assets/Scripts/FriendSystem/USER_GUIDE_UNITY.md)** - Hướng dẫn Unity client

### Dành cho Quản trị Hệ thống
- **[Hướng dẫn Deployment](Server/DEPLOYMENT.md)** - Production deployment
- **[Hướng dẫn Monitoring](Server/src/utils/LOGGING_MONITORING_README.md)** - Logging và monitoring

---

## 🎯 Các Tác vụ Thường dùng

### Khởi động Development Server
```bash
cd Server
npm run dev
```

### Chạy Tests
```bash
cd Server
npm test
```

### Deploy lên Production
```bash
cd Server
npm run deploy
```

### Quản lý Database Migrations
```bash
cd Server
npm run migrate
```

### Xem Logs
```bash
# Docker
docker-compose logs -f app

# Local
tail -f Server/logs/combined.log
```

---

## 🔧 Cấu hình

### Biến Môi trường

Các biến quan trọng trong `.env`:

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

Xem `.env.example` để biết tất cả các tùy chọn có sẵn.

---

## 📖 API Endpoints

### Quản lý Tài khoản
- `POST /api/accounts` - Tạo tài khoản
- `GET /api/accounts/:id` - Lấy thông tin tài khoản
- `PUT /api/accounts/:id` - Cập nhật tài khoản

### Quản lý Bạn bè
- `GET /api/friends/:accountId` - Lấy danh sách bạn bè
- `DELETE /api/friends/:friendId` - Xóa bạn bè
- `POST /api/friends/status` - Cập nhật trạng thái online

### Lời mời Kết bạn
- `POST /api/friend-requests` - Gửi lời mời
- `GET /api/friend-requests/:accountId/pending` - Lấy lời mời đang chờ
- `POST /api/friend-requests/:id/accept` - Chấp nhận lời mời

### Tìm kiếm
- `GET /api/search/username?q=query` - Tìm kiếm theo username
- `GET /api/search/id/:accountId` - Tìm kiếm theo ID

Xem [Tài liệu API](Server/API_DOCUMENTATION.md) để biết chi tiết đầy đủ.

---

## 🐛 Xử lý Sự cố

### Server Không Khởi động
```bash
# Kiểm tra logs
docker-compose logs app

# Kiểm tra kết nối database
npm run db:test

# Kiểm tra biến môi trường
cat .env
```

### Kết nối Database Thất bại
```bash
# Test PostgreSQL
psql -h localhost -U postgres -d friend_system

# Kiểm tra PostgreSQL có đang chạy không
docker-compose ps postgres
```

### Lỗi Migration
```bash
# Kiểm tra trạng thái migration
npm run migration:show

# Revert và thử lại
npm run migration:revert
npm run migration:run
```

Xem [Hướng dẫn Deployment](Server/DEPLOYMENT.md) để biết thêm cách xử lý sự cố.

---

## 🏗️ Cấu trúc Dự án

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
│       ├── Core/                   # Chức năng cốt lõi
│       ├── Managers/               # Manager classes
│       ├── Models/                 # Mô hình dữ liệu
│       └── UI/                     # UI components
│
└── Documentation/
    ├── USER_GUIDE.md              # Hướng dẫn người dùng
    ├── DEPLOYMENT.md              # Hướng dẫn deployment
    └── QUICK_START.md             # File này
```

---

## 🔐 Bảo mật

### Trước khi Production

- [ ] Thay đổi mật khẩu database mặc định
- [ ] Tạo JWT secret mạnh
- [ ] Bật HTTPS/SSL
- [ ] Cấu hình firewall
- [ ] Thiết lập rate limiting
- [ ] Bật security headers
- [ ] Backup định kỳ
- [ ] Monitoring và alerts

Xem [Hướng dẫn Deployment](Server/DEPLOYMENT.md) để biết checklist bảo mật.

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Xem Metrics
```bash
# Application logs
docker-compose logs -f app

# Database performance
docker-compose exec postgres psql -U postgres -d friend_system
```

### Performance Monitoring
- Thời gian load danh sách bạn bè: < 2 giây
- Xử lý lời mời kết bạn: < 1 giây
- Người dùng đồng thời: 1000+

---

## 🤝 Hỗ trợ

### Nhận Trợ giúp

1. **Tài liệu**: Kiểm tra hướng dẫn liên quan
2. **Logs**: Xem lại application logs
3. **Issues**: Kiểm tra các vấn đề đã biết
4. **Cộng đồng**: Hỏi trong forums hoặc Discord

### Liên kết Hữu ích

- [Tài liệu API](Server/API_DOCUMENTATION.md)
- [Hướng dẫn Người dùng](USER_GUIDE.md)
- [Hướng dẫn Deployment](Server/DEPLOYMENT.md)
- [Xử lý Sự cố](Server/DEPLOYMENT.md#troubleshooting)

---

## 📝 Các Bước Tiếp theo

### Dành cho Developers
1. Đọc [Tài liệu API](Server/API_DOCUMENTATION.md)
2. Thiết lập môi trường phát triển
3. Chạy test suite
4. Bắt đầu xây dựng tính năng

### Dành cho Người dùng
1. Đọc [Hướng dẫn Người dùng](USER_GUIDE.md)
2. Tạo tài khoản của bạn
3. Thêm một số bạn bè
4. Khám phá các tính năng

### Dành cho Quản trị viên
1. Đọc [Hướng dẫn Deployment](Server/DEPLOYMENT.md)
2. Thiết lập môi trường production
3. Cấu hình monitoring
4. Thiết lập backups

---

## 🎉 Bạn đã Sẵn sàng!

Hệ thống Bạn bè hiện đã được thiết lập và sẵn sàng sử dụng. Hãy tận hưởng việc kết nối với bạn bè!

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 28 tháng 10, 2025
