# Friend System Managers - Hướng dẫn Sử dụng

Thư mục này chứa các manager classes xử lý business logic và tương tác API cho Friend System.

## AccountManager

Quản lý các thao tác liên quan đến tài khoản bao gồm tạo, lấy thông tin và cập nhật.

### Tính năng
- **CreateAccount**: Tạo tài khoản trong game mới với username duy nhất
- **GetAccount**: Lấy thông tin tài khoản theo account ID
- **UpdateAccount**: Cập nhật thông tin tài khoản (tên hiển thị, avatar, level, trạng thái)

### Ví dụ Sử dụng

```csharp
using FriendSystem.Managers;

// Tạo tài khoản mới
var account = await AccountManager.Instance.CreateAccount("player123");

// Lấy thông tin tài khoản
var accountInfo = await AccountManager.Instance.GetAccount(accountId);

// Cập nhật tài khoản
var updateData = new AccountUpdateData
{
    displayName = "Tên hiển thị mới",
    avatarUrl = "https://example.com/avatar.png",
    level = 5
};
var updatedAccount = await AccountManager.Instance.UpdateAccount(accountId, updateData);
```

### Yêu cầu Được bao phủ
- 1.1: Tạo và lấy tài khoản duy nhất
- 1.2: Gán ID duy nhất (được xử lý bởi server)
- 1.3: Cập nhật thông tin tài khoản

### Dependencies
- ApiClient: Cho giao tiếp HTTP
- FriendSystemConfig: Cho cấu hình server
- InGameAccount model: Cấu trúc dữ liệu cho tài khoản
