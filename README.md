# Hệ thống Tính năng - Tổng quan

## Giới thiệu

Đây là dự án hệ thống tính năng tích hợp, bao gồm hệ thống bạn bè và các tính năng game khác được phát triển với Unity Client và Node.js Server.

## Cấu trúc Dự án

```
system_feature/
├── Client/                          # Unity Project
│   └── Assets/
│       └── Scripts/
│           └── FriendSystem/        # Hệ thống Bạn bè
├── Server/                          # Node.js Server
│   ├── src/                         # Mã nguồn server
│   ├── .env                         # Biến môi trường
│   └── package.json                 # Cấu hình Node.js
└── Documentation/                   # Tài liệu hướng dẫn
```

## Tính năng Chính

### Hệ thống Bạn bè
- Tìm kiếm và thêm bạn bè
- Quản lý danh sách bạn bè
- Gửi và nhận lời mời kết bạn
- Hiển thị trạng thái online/offline
- Chặn người dùng không mong muốn

### Hệ thống API
- RESTful API với Node.js
- Xác thực JWT
- Kết nối cơ sở dữ liệu PostgreSQL
- Logging và monitoring

## Hướng dẫn Nhanh

### Khởi động Server
```bash
cd Server
npm install
npm run dev
```

### Mở Unity Client
1. Mở project trong thư mục `Client/`
2. Cài đặt Newtonsoft.Json package
3. Cấu hình Server URL trong FriendSystemConfig

## Tài liệu Chi tiết

- **[Hướng dẫn Thiết lập](PROJECT_SETUP.md)** - Thiết lập đầy đủ dự án
- **[Hướng dẫn Nhanh](QUICK_START.md)** - Khởi động nhanh trong 5 phút
- **[Hướng dẫn Người dùng](USER_GUIDE.md)** - Cách sử dụng hệ thống
- **[API Documentation](Server/API_DOCUMENTATION.md)** - Tài liệu API chi tiết

## Yêu cầu Hệ thống

### Server
- Node.js 18+ LTS
- PostgreSQL 14+
- npm hoặc yarn

### Unity Client
- Unity 2021.3 LTS trở lên
- .NET Standard 2.1

## Liên hệ và Hỗ trợ

Để được hỗ trợ, vui lòng tham khảo:
- Tài liệu hướng dẫn trong thư mục Documentation
- File README.md trong từng module
- Hệ thống help trong game

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 28 tháng 10, 2025