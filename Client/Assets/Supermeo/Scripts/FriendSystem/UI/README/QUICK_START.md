# Friend List UI - Hướng dẫn Khởi động Nhanh - Hướng dẫn Sử dụng

## Dành cho Developers

### Sử dụng Cơ bản

```csharp
using FriendSystem.UI;
using FriendSystem.Managers;

// Lấy reference đến FriendListUI (attach vào Canvas trong scene)
FriendListUI friendListUI = FindObjectOfType<FriendListUI>();

// Load friend list cho tài khoản hiện tại
string accountId = AccountManager.Instance.GetCurrentAccountId();
friendListUI.LoadFriendList(accountId);
```

### Mở Friend List Panel

```csharp
// Hiển thị friend list panel
GameObject friendListPanel = GameObject.Find("FriendListPanel");
friendListPanel.SetActive(true);

// Load friend list
FriendListUI friendListUI = friendListPanel.GetComponent<FriendListUI>();
friendListUI.LoadFriendList(currentAccountId);
```

### Làm mới Friend List

```csharp
// UI có nút refresh tích hợp sẵn
// Hoặc bạn có thể gọi programmatically:
friendListUI.LoadFriendList(currentAccountId);
```

## Dành cho Unity Editor Setup

### Bước 1: Tạo FriendListPanel Prefab

1. Right-click trong Hierarchy → UI → Panel
2. Đổi tên thành "FriendListPanel"
3. Thêm component `FriendListUI`
4. Tạo child objects theo hierarchy trong README.md
5. Gán tất cả references trong Inspector
6. Lưu thành prefab trong `Assets/Prefabs/FriendSystem/`

### Bước 2: Tạo FriendItem Prefab

1. Right-click trong Hierarchy → UI → Panel
2. Đổi tên thành "FriendItem"
3. Thêm component `FriendItemUI`
4. Tạo child objects theo hierarchy trong README.md
5. Gán tất cả references trong Inspector
6. Lưu thành prefab trong `Assets/Prefabs/FriendSystem/`

### Bước 3: Liên kết Prefabs

1. Chọn FriendListPanel trong scene
2. Trong FriendListUI component, kéo FriendItem prefab vào field "Friend Item Prefab"
3. Gán tất cả UI references khác

### Bước 4: Test

1. Vào Play mode
2. Gọi `LoadFriendList()` với account ID hợp lệ
3. Xác minh friend list hiển thị đúng

## Vấn đề Thường gặp

### "FriendSystemConfig not found"
- Tạo FriendSystemConfig asset trong thư mục Resources
- Xem `Client/Assets/Scripts/FriendSystem/Config/` để biết chi tiết

### "NullReferenceException" trên UI elements
- Đảm bảo tất cả UI references được gán trong Inspector
- Kiểm tra prefab được cấu hình đúng

### Friends không hiển thị
- Xác minh account ID hợp lệ
- Kiểm tra server đang chạy và có thể truy cập
- Kiểm tra auth token được set trong FriendManager

### Search không hoạt động
- Đảm bảo TMP_InputField được gán
- Kiểm tra onValueChanged listener được thiết lập

## Tổng quan Tính năng

| Tính năng | Mô tả | Yêu cầu |
|-----------|-------|---------|
| Hiển thị Bạn bè | Hiển thị tất cả bạn bè với chi tiết | 3.1 |
| Tìm kiếm | Lọc theo tên/username | 3.2 |
| Sắp xếp | Theo tên, level, hoặc trạng thái online | 3.3 |
| Xóa Bạn bè | Xóa bạn bè khỏi danh sách | 3.4 |
| Số lượng Bạn bè | Hiển thị hiện tại/tối đa bạn bè | 3.5 |
| Trạng thái Online | Chỉ báo xanh/xám | 3.1, 3.3 |
| Xem Profile | Nhấp để xem profile | 4.3, 4.4 |
| Làm mới | Tải lại friend list | 4.2 |

## Tích hợp API

UI tự động tích hợp với:
- `FriendManager.GetFriendList()`
- `FriendManager.GetFriendsOnlineStatus()`
- `FriendManager.RemoveFriend()`

Đảm bảo FriendManager được khởi tạo trước khi sử dụng UI.

## Tùy chỉnh

### Thay đổi Giới hạn Max Friends
```csharp
// Trong Inspector hoặc code
friendListUI.maxFriends = 200;
```

### Tùy chỉnh Màu sắc
```csharp
// Trong FriendItemUI Inspector
onlineColor = new Color(0, 1, 0); // Xanh
offlineColor = new Color(0.5f, 0.5f, 0.5f); // Xám
```

### Thêm Custom Sorting
Chỉnh sửa `FriendListUI.cs` và thêm case mới vào method `ApplySorting()`.

## Các Bước Tiếp theo

1. ✅ Friend List UI đã triển khai
2. ⏳ Tạo prefabs trong Unity Editor
3. ⏳ Triển khai Profile UI (Task 17)
4. ⏳ Thêm confirmation dialogs
5. ⏳ Triển khai avatar loading
6. ⏳ Thêm animations

## Hỗ trợ

Để biết hướng dẫn thiết lập chi tiết, xem `README.md`
Để biết chi tiết triển khai, xem `IMPLEMENTATION_SUMMARY.md`
