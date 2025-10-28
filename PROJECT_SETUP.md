# Hệ thống Bạn bè - Hướng dẫn Thiết lập Dự án Hoàn chỉnh

Hướng dẫn này bao gồm thiết lập đầy đủ cho cả Unity Client và Node.js Server.

## Cấu trúc Dự án

```
friend-system/
├── Client/                          # Unity Project
│   └── Assets/
│       └── Scripts/
│           └── FriendSystem/        # Scripts Hệ thống Bạn bè
│               ├── Config/          # Cấu hình
│               ├── Core/            # Chức năng cốt lõi
│               ├── Models/          # Mô hình dữ liệu
│               ├── README.md
│               └── SETUP.md         # Hướng dẫn thiết lập Unity
├── Server/                          # Node.js Server
│   ├── src/
│   │   ├── config/                  # Cấu hình server
│   │   ├── entities/                # TypeORM entities
│   │   └── index.ts                 # Entry point
│   ├── .env                         # Biến môi trường
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── SETUP.md                     # Hướng dẫn thiết lập server
└── PROJECT_SETUP.md                 # File này
```

## Khởi động Nhanh

### 1. Thiết lập Server

```bash
# Chuyển đến thư mục server
cd Server

# Cài đặt dependencies
npm install

# Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Tạo PostgreSQL database
createdb friend_system_db

# Khởi động development server
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

### 2. Thiết lập Unity Client

1. Mở Unity project trong thư mục `Client/`
2. Cài đặt Newtonsoft.Json package:
   - Window > Package Manager
   - Add package by name: `com.unity.nuget.newtonsoft-json`
3. Tạo FriendSystemConfig asset:
   - Right-click trong Project > Create > Friend System > Config
   - Đặt Server URL thành `http://localhost:3000`
4. Kiểm tra Project Settings:
   - Edit > Project Settings > Player
   - Api Compatibility Level: **.NET Standard 2.1**

## Hướng dẫn Thiết lập Chi tiết

- **Thiết lập Server**: Xem `Server/SETUP.md`
- **Thiết lập Unity Client**: Xem `Client/Assets/Scripts/FriendSystem/SETUP.md`

## Yêu cầu Tiên quyết

### Server
- Node.js 18+ LTS
- PostgreSQL 14+
- npm hoặc yarn

### Unity Client
- Unity 2021.3 LTS trở lên
- Hỗ trợ .NET Standard 2.1

## Cấu hình Môi trường

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
- **Request Timeout**: 30 giây
- **Max Friends**: 100

## Kiểm tra Hoạt động

### Test Server

```bash
# Kiểm tra sức khỏe server
curl http://localhost:3000/health

# Phản hồi mong đợi:
# {"status":"ok","timestamp":"...","service":"Friend System API"}
```

### Test Unity Client

1. Tạo một test GameObject với script này:

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
            Debug.Log("✅ Kết nối server thành công!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"❌ Kết nối thất bại: {e.Message}");
        }
    }
}
```

2. Vào Play mode và kiểm tra Console

## Trạng thái Triển khai Hiện tại

✅ **Task 1: Thiết lập Hạ tầng** (HOÀN THÀNH)
- Cấu trúc dự án server đã tạo
- TypeScript và TypeORM đã cấu hình
- Thiết lập kết nối database
- Biến môi trường đã cấu hình
- Cấu trúc Unity client đã tạo
- API client đã triển khai
- Mô hình dữ liệu đã định nghĩa

⏳ **Các Task Tiếp theo**:
- Task 2: Database Schema (migrations)
- Task 3: TypeORM Entities (đã tạo, cần test)
- Task 4+: Services, Controllers, Managers, UI

## Công nghệ Sử dụng

### Backend
- **Runtime**: Node.js 18+
- **Ngôn ngữ**: TypeScript 5.0+
- **Framework**: Express.js 4.x
- **ORM**: TypeORM 0.3+
- **Database**: PostgreSQL 14+
- **Xác thực**: JWT
- **Logging**: Winston

### Frontend
- **Engine**: Unity 2021.3 LTS+
- **Ngôn ngữ**: C# (.NET Standard 2.1)
- **HTTP Client**: UnityWebRequest
- **JSON**: Newtonsoft.Json
- **Async**: Task-based async/await

## Quy trình Phát triển

1. **Khởi động Server**: `cd Server && npm run dev`
2. **Mở Unity**: Mở project `Client/`
3. **Phát triển**: Thực hiện thay đổi trên server hoặc client
4. **Test**: Sử dụng Unity Play mode hoặc API testing tools
5. **Commit**: Commit thay đổi vào version control

## Xử lý Sự cố

### Các Vấn đề Thường gặp

1. **Kết nối database thất bại**
   - Kiểm tra PostgreSQL đang chạy
   - Kiểm tra thông tin đăng nhập trong `.env`
   - Đảm bảo database tồn tại

2. **Lỗi compilation Unity**
   - Cài đặt Newtonsoft.Json package
   - Đặt Api Compatibility Level thành .NET Standard 2.1
   - Khởi động lại Unity Editor

3. **Lỗi CORS**
   - Đặt `CORS_ORIGIN=*` trong server `.env`
   - Khởi động lại server

4. **Port đã được sử dụng**
   - Thay đổi `PORT` trong `.env`
   - Hoặc dừng process đang sử dụng port đó

## Hỗ trợ

Để có hướng dẫn thiết lập chi tiết:
- Server: `Server/SETUP.md`
- Unity Client: `Client/Assets/Scripts/FriendSystem/SETUP.md`
- Server API: `Server/README.md`
- Client Usage: `Client/Assets/Scripts/FriendSystem/README.md`

## Các Bước Tiếp theo

1. Hoàn thành Task 2: Triển khai Database Schema
2. Chạy migrations để tạo tables
3. Triển khai services và controllers
4. Xây dựng Unity managers và UI components
5. Integration testing

---

**Lưu ý**: Đây là Task 1 của kế hoạch triển khai. Hạ tầng hiện đã sẵn sàng cho các task tiếp theo.
