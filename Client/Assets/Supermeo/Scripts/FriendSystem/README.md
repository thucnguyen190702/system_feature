# Hệ thống Bạn bè - Unity Client - Hướng dẫn Sử dụng

Unity C# client cho Hệ thống Bạn bè.

## Yêu cầu Tiên quyết

- Unity 2021.3 LTS trở lên
- .NET Standard 2.1
- Newtonsoft.Json package

## Cài đặt

1. Import Newtonsoft.Json package qua Package Manager:
   - Mở Package Manager (Window > Package Manager)
   - Add package từ git URL: `com.unity.nuget.newtonsoft-json`

2. Cấu hình Friend System:
   - Tạo FriendSystemConfig asset (Right-click > Create > Friend System > Config)
   - Đặt server URL của bạn (mặc định: http://localhost:3000)
   - Điều chỉnh các cài đặt khác theo nhu cầu

## Cấu trúc Dự án

```
Assets/Scripts/FriendSystem/
├── Config/              # Cấu hình
│   └── FriendSystemConfig.cs
├── Core/                # Chức năng cốt lõi
│   └── ApiClient.cs     # HTTP client
├── Models/              # Mô hình dữ liệu
│   ├── InGameAccount.cs
│   ├── FriendRequest.cs
│   └── ApiResponse.cs
├── Managers/            # Manager classes (sẽ được thêm)
├── UI/                  # UI components (sẽ được thêm)
└── README.md
```

## Sử dụng

### Cấu hình

Tạo và cấu hình FriendSystemConfig ScriptableObject:

```csharp
// Trong Unity Editor:
// Right-click trong Project > Create > Friend System > Config
// Đặt Server URL thành backend server của bạn
```

### API Client

ApiClient xử lý tất cả giao tiếp HTTP với server:

```csharp
using FriendSystem.Core;

var apiClient = new ApiClient("http://localhost:3000/api", timeout: 30);
apiClient.SetAuthToken("your-jwt-token");

// GET request
var account = await apiClient.GetAsync<InGameAccount>("/accounts/123");

// POST request
var response = await apiClient.PostAsync<ApiResponse>("/friend-requests", new { toAccountId = "456" });
```

## Các Bước Tiếp theo

Các component sau sẽ được triển khai trong các task tiếp theo:
- AccountManager - Quản lý tài khoản
- FriendManager - Danh sách bạn bè và lời mời
- SearchManager - Tìm kiếm người dùng
- UI Components - Danh sách bạn bè, tìm kiếm, và panel lời mời

## Ghi chú

- Tất cả async operations sử dụng Task-based async/await pattern
- JSON serialization được xử lý bởi Newtonsoft.Json
- Authentication tokens được quản lý bởi ApiClient
- Error handling nên được triển khai trong manager classes
