# Search UI - Hướng dẫn Sử dụng

## Tổng quan

Tài liệu này mô tả việc triển khai Search UI cho Friend System, cho phép người chơi tìm kiếm các tài khoản khác theo username hoặc ID và gửi lời mời kết bạn.

## Các Component

### 1. SearchUI.cs
Controller chính cho Search panel xử lý:
- Tìm kiếm theo username (Yêu cầu 2.1)
- Tìm kiếm theo ID (Yêu cầu 2.2)
- Hiển thị kết quả tìm kiếm với thông tin cơ bản (Yêu cầu 2.3, 4.2, 4.5)
- Gửi lời mời kết bạn từ kết quả tìm kiếm (Yêu cầu 2.4, 4.2)
- Hiển thị thông báo khi lời mời được gửi (Yêu cầu 4.2)

### 2. SearchResultItemUI.cs
Component item kết quả tìm kiếm riêng lẻ hiển thị:
- Tên hiển thị, username và level của tài khoản (Yêu cầu 2.3)
- Avatar placeholder
- Nút gửi lời mời kết bạn (Yêu cầu 2.4)
- Chỉ báo đã là bạn bè
- Chỉ báo đã gửi lời mời

## Tính năng Đã triển khai

### Chức năng Tìm kiếm
- **Tìm kiếm theo Username**: Người dùng có thể tìm kiếm tài khoản bằng cách nhập username
- **Tìm kiếm theo ID**: Người dùng có thể tìm kiếm tài khoản cụ thể bằng cách nhập ID duy nhất
- **Dropdown Loại Tìm kiếm**: Chuyển đổi giữa chế độ tìm kiếm username và ID
- **Tìm kiếm Thời gian thực**: Nhấn Enter hoặc nhấp nút Search để thực hiện tìm kiếm

### Hiển thị Kết quả Tìm kiếm
- **Thông tin Tài khoản Cơ bản**: Hiển thị tên hiển thị, username (@username) và level
- **Chỉ báo Trạng thái Bạn bè**: 
  - Hiển thị "Đã là bạn bè" nếu tài khoản đã có trong danh sách bạn bè
  - Hiển thị "Đã gửi lời mời" sau khi gửi lời mời kết bạn
- **Nút Gửi Lời mời**: Chỉ hiển thị cho những người chưa là bạn bè và chưa nhận lời mời

### Thông báo
- **Thông báo Thành công**: Hiển thị khi lời mời kết bạn được gửi thành công
- **Thông báo Lỗi**: Hiển thị khi tìm kiếm thất bại hoặc không thể gửi lời mời
- **Tự động ẩn**: Thông báo tự động ẩn sau 3 giây

### Trạng thái UI
- **Trạng thái Rỗng**: Hiển thị thông báo hữu ích khi chưa thực hiện tìm kiếm hoặc không tìm thấy kết quả
- **Trạng thái Loading**: Hiển thị chỉ báo loading trong quá trình tìm kiếm
- **Trạng thái Lỗi**: Hiển thị thông báo lỗi khi các thao tác thất bại

## Hướng dẫn Thiết lập Unity

### 1. Tạo SearchPanel GameObject

1. Trong Unity Hierarchy, tạo UI Panel mới: `Right-click → UI → Panel`
2. Đổi tên thành "SearchPanel"
3. Thêm component `SearchUI` vào GameObject này

### 2. Tạo SearchResultItem Prefab

1. Tạo UI Panel mới cho search result item
2. Thêm các child objects sau:
   - TextMeshProUGUI cho tên hiển thị
   - TextMeshProUGUI cho username
   - TextMeshProUGUI cho level
   - Image cho avatar
   - Button cho "Gửi lời mời"
   - Button cho "Xem hồ sơ"
   - GameObject cho chỉ báo "Đã là bạn bè"
   - GameObject cho chỉ báo "Đã gửi lời mời"
3. Thêm component `SearchResultItemUI`
4. Gán tất cả UI references trong Inspector
5. Lưu thành prefab trong `Assets/Prefabs/FriendSystem/`

### 3. Configure SearchPanel

Assign the following in the SearchUI Inspector:

**UI References:**
- Search Input Field (TMP_InputField)
- Search Button
- Search Type Dropdown (Username/ID)
- Search Result Item Prefab
- Search Results Container (Transform - parent for result items)
- Scroll Rect
- Loading Indicator (GameObject)
- Empty State Panel (GameObject)
- Empty State Text (TextMeshProUGUI)
- Error Panel (GameObject)
- Error Text (TextMeshProUGUI)
- Notification Panel (GameObject)
- Notification Text (TextMeshProUGUI)

**Settings:**
- Notification Duration: 3 seconds (default)

### 4. Setup Layout

Recommended layout structure:
```
SearchPanel
├── Header
│   ├── Title Text
│   └── Close Button
├── Search Controls
│   ├── Search Type Dropdown
│   └── Search Input Field
│   └── Search Button
├── Results Area
│   ├── Scroll View
│   │   └── Content (searchResultsContainer)
│   ├── Loading Indicator
│   └── Empty State Panel
├── Notification Panel
└── Error Panel
```

## Usage Example

```csharp
// Get reference to SearchUI
SearchUI searchUI = GetComponent<SearchUI>();

// Set current account (required for friend status checking)
searchUI.SetCurrentAccount("current-account-id");

// The UI handles all search operations automatically through button clicks
// Users can:
// 1. Select search type (Username or ID)
// 2. Enter search text
// 3. Click Search or press Enter
// 4. Click "Send Request" on any result
```

## API Integration

The SearchUI integrates with:

### SearchManager
- `SearchByUsername(string username)`: Search for accounts by username
- `SearchById(string accountId)`: Search for account by ID

### FriendManager
- `SendFriendRequest(string toAccountId)`: Send friend request to searched account
- `GetFriendList(string accountId)`: Get current friend list to check if already friends

## Requirements Coverage

### Requirement 2.1: Search by Username
✅ Implemented in `SearchUI.PerformSearch()` with SearchType.Username

### Requirement 2.2: Search by ID
✅ Implemented in `SearchUI.PerformSearch()` with SearchType.AccountId

### Requirement 2.3: Display Basic Info
✅ Implemented in `SearchResultItemUI.UpdateDisplay()` - shows name, avatar, level

### Requirement 2.4: Send Friend Request
✅ Implemented in `SearchUI.OnSendFriendRequest()` and `SearchResultItemUI.OnSendRequestButtonClicked()`

### Requirement 4.1: User-Friendly Interface
✅ Clear search controls, intuitive layout, helpful empty states

### Requirement 4.2: Clear Notifications
✅ Success and error notifications with auto-hide functionality

### Requirement 4.5: Consistent UI
✅ Follows same patterns as FriendListUI with consistent styling

## Error Handling

The implementation handles the following error scenarios:
- Empty search input
- Search API failures
- Friend request send failures
- Network errors

All errors are displayed to the user with clear Vietnamese messages.

## Future Enhancements

Potential improvements for future tasks:
- Avatar loading from URLs
- Profile view integration (Task 17)
- Search history
- Recent searches
- Advanced filters (level range, online status)
- Pagination for large result sets
- Debounced search (search as you type)

## Testing Checklist

- [ ] Search by username returns correct results
- [ ] Search by ID returns correct account
- [ ] Empty search shows error message
- [ ] Search results display correctly
- [ ] Send friend request button works
- [ ] Already friend indicator shows for existing friends
- [ ] Request sent indicator shows after sending
- [ ] Notifications appear and auto-hide
- [ ] Loading indicator shows during operations
- [ ] Empty state shows when no results
- [ ] Error messages display correctly
- [ ] Search type dropdown changes placeholder text

## Notes

- The SearchUI automatically filters out the current user from search results
- Friend status is checked against the current friend list loaded on initialization
- All text is in Vietnamese as per project requirements
- The implementation follows the same patterns as FriendListUI for consistency
