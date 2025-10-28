# Friend Request UI - Hướng dẫn Sử dụng

## Tổng quan

Tài liệu này mô tả hệ thống UI Lời mời kết bạn cho Friend System. Hệ thống bao gồm ba component chính hoạt động cùng nhau để hiển thị và quản lý lời mời kết bạn.

## Các Component

### 1. FriendRequestUI.cs
Controller chính cho panel Lời mời kết bạn.

**Yêu cầu:** 2.4, 2.5, 4.2, 4.5

**Tính năng:**
- Tải và hiển thị lời mời kết bạn đang chờ
- Tự động làm mới mỗi 30 giây
- Xử lý chấp nhận/từ chối lời mời kết bạn
- Cập nhật số lượng lời mời theo thời gian thực
- Hiển thị trạng thái trống và loading
- Thông báo phản hồi cho người dùng

**Phương thức chính:**
- `LoadPendingRequests(string accountId)` - Tải lời mời đang chờ cho tài khoản
- `OnAcceptRequest(FriendRequest, FriendRequestItemUI)` - Xử lý chấp nhận lời mời
- `OnRejectRequest(FriendRequest, FriendRequestItemUI)` - Xử lý từ chối lời mời
- `GetPendingRequestCount()` - Trả về số lượng lời mời đang chờ

**Sự kiện:**
- `OnRequestCountChanged` - Kích hoạt khi số lượng lời mời thay đổi (dùng cho notification badge)

### 2. FriendRequestItemUI.cs
Component UI cho từng item lời mời kết bạn.

**Yêu cầu:** 2.4, 2.5, 4.2, 4.5

**Tính năng:**
- Hiển thị thông tin người gửi (tên, username, level, avatar)
- Hiển thị thời gian theo định dạng "time ago"
- Nút Chấp nhận và Từ chối
- Nút Xem hồ sơ
- Chỉ báo trạng thái xử lý

**Phương thức chính:**
- `Initialize(FriendRequest, InGameAccount, FriendRequestUI)` - Khởi tạo item
- `SetProcessing(bool)` - Hiển thị/ẩn trạng thái xử lý
- `GetRequestId()` - Trả về ID lời mời

### 3. FriendRequestNotificationBadge.cs
Badge thông báo hiển thị số lượng lời mời đang chờ.

**Yêu cầu:** 4.2

**Tính năng:**
- Hiển thị/ẩn dựa trên số lượng lời mời
- Hiển thị số lượng (hoặc "99+" nếu trên 99)
- Thay đổi màu dựa trên ngưỡng (mặc định: 5)
- Animation pulse khi cập nhật số lượng
- Cập nhật theo thời gian thực qua event subscription

**Phương thức chính:**
- `UpdateBadge(int count)` - Cập nhật hiển thị badge
- `SetFriendRequestUI(FriendRequestUI)` - Thiết lập reference UI
- `GetCurrentCount()` - Trả về số lượng hiện tại

## Thiết lập Unity

### Cấu trúc Prefab

#### FriendRequestPanel Prefab
```
FriendRequestPanel (Canvas/Panel)
├── Header
│   ├── TitleText (TextMeshProUGUI) - "Lời mời kết bạn (0)"
│   └── RefreshButton (Button)
├── ScrollView (ScrollRect)
│   └── Content (Transform) - Container cho các item lời mời
├── EmptyStatePanel (GameObject)
│   └── EmptyStateText (TextMeshProUGUI)
├── LoadingIndicator (GameObject)
└── NotificationPanel (GameObject)
    └── NotificationText (TextMeshProUGUI)
```

#### FriendRequestItem Prefab
```
FriendRequestItem (Panel)
├── AvatarImage (Image)
├── InfoContainer
│   ├── DisplayNameText (TextMeshProUGUI)
│   ├── UsernameText (TextMeshProUGUI)
│   ├── LevelText (TextMeshProUGUI)
│   └── TimeText (TextMeshProUGUI)
├── ButtonContainer
│   ├── AcceptButton (Button) - "Chấp nhận"
│   ├── RejectButton (Button) - "Từ chối"
│   └── ViewProfileButton (Button)
└── ProcessingIndicator (GameObject)
```

#### NotificationBadge Prefab
```
NotificationBadge (GameObject)
├── BadgeBackground (Image) - Hình tròn đỏ
└── CountText (TextMeshProUGUI) - Text màu trắng
```

### Component Assignment

1. **FriendRequestUI Component:**
   - Attach to FriendRequestPanel GameObject
   - Assign `friendRequestItemPrefab` to FriendRequestItem prefab
   - Assign `requestListContainer` to ScrollView/Content transform
   - Assign all UI references (buttons, texts, panels)
   - Set `refreshInterval` (default: 30 seconds)
   - Set `notificationDuration` (default: 3 seconds)

2. **FriendRequestItemUI Component:**
   - Attach to FriendRequestItem prefab
   - Assign all UI references (texts, buttons, images)

3. **FriendRequestNotificationBadge Component:**
   - Attach to NotificationBadge GameObject
   - Assign `badgeObject` to the badge container
   - Assign `countText` to the count text component
   - Assign `badgeBackground` to the background image
   - Assign `friendRequestUI` reference
   - Configure colors and animation settings

## Usage Example

```csharp
using FriendSystem.UI;
using UnityEngine;

public class FriendSystemManager : MonoBehaviour
{
    [SerializeField] private FriendRequestUI friendRequestUI;
    [SerializeField] private FriendRequestNotificationBadge notificationBadge;
    
    private string currentAccountId = "account-123";
    
    void Start()
    {
        // Load pending requests
        friendRequestUI.LoadPendingRequests(currentAccountId);
        
        // Badge will automatically update via event subscription
    }
    
    void OnEnable()
    {
        // Subscribe to count changes if needed
        friendRequestUI.OnRequestCountChanged += OnRequestCountChanged;
    }
    
    void OnDisable()
    {
        friendRequestUI.OnRequestCountChanged -= OnRequestCountChanged;
    }
    
    private void OnRequestCountChanged(int count)
    {
        Debug.Log($"Pending requests: {count}");
    }
}
```

## Integration with Other Systems

### With FriendManager
The UI uses `FriendManager.Instance` to:
- Get pending requests: `GetPendingRequests(accountId)`
- Accept requests: `AcceptFriendRequest(requestId)`
- Reject requests: (TODO - needs server endpoint)

### With AccountManager
The UI uses `AccountManager.Instance` to:
- Get sender account info: `GetAccount(accountId)`

### With Other UI Panels
- Can be integrated with FriendListUI to refresh friend list after accepting
- Can be integrated with SearchUI for consistent styling
- Notification badge can be placed on any UI element (tab button, menu item, etc.)

## Auto-Refresh Behavior

The FriendRequestUI automatically refreshes pending requests every 30 seconds (configurable via `refreshInterval`). This ensures users see new requests without manual refresh.

To disable auto-refresh, set `refreshInterval` to a very high value or modify the `Update()` method.

## Notification System

The UI includes a built-in notification system that shows temporary messages for:
- Successfully accepting a request
- Successfully rejecting a request
- Error messages

Notifications auto-hide after 3 seconds (configurable via `notificationDuration`).

## Time Display

Request timestamps are displayed in a user-friendly "time ago" format:
- "Vừa xong" - Just now (< 1 minute)
- "X phút trước" - X minutes ago
- "X giờ trước" - X hours ago
- "X ngày trước" - X days ago
- "dd/MM/yyyy" - Full date (> 7 days)

## Styling Recommendations

### Colors
- Accept Button: Green (#4CAF50)
- Reject Button: Red (#F44336)
- Badge Background: Red (#FF0000) or Orange (#FF4D00) for high count
- Badge Text: White (#FFFFFF)

### Fonts
- Display Name: Bold, 16-18pt
- Username: Regular, 12-14pt, Gray
- Level: Regular, 12pt
- Time: Italic, 10-12pt, Light Gray

### Layout
- Item Height: 80-100px
- Spacing: 8-10px between items
- Padding: 12-16px inside items
- Badge Size: 20-24px diameter

## Known Limitations

1. **Reject Endpoint:** The reject functionality is implemented on the client but requires a server endpoint to be fully functional. Currently, it only removes the request from the UI.

2. **Avatar Loading:** Avatar images are not loaded from URLs yet. This requires implementing a sprite loading system.

3. **Profile View:** The "View Profile" functionality is a placeholder and will be implemented in Task 17.

## Testing Checklist

- [ ] Pending requests load correctly
- [ ] Accept button works and updates UI
- [ ] Reject button works and updates UI
- [ ] Notification badge shows correct count
- [ ] Badge animates on count change
- [ ] Badge hides when count is 0
- [ ] Auto-refresh works every 30 seconds
- [ ] Empty state shows when no requests
- [ ] Loading indicator shows during API calls
- [ ] Notifications appear and auto-hide
- [ ] Time display formats correctly
- [ ] Multiple requests display correctly
- [ ] UI handles errors gracefully

## Future Enhancements

1. Add reject endpoint on server
2. Implement avatar loading from URLs
3. Add profile view functionality (Task 17)
4. Add sound effects for notifications
5. Add haptic feedback on mobile
6. Add swipe gestures for accept/reject
7. Add batch operations (accept/reject all)
8. Add request filtering/sorting
9. Add request expiration display
10. Add mutual friends count display

## Requirements Coverage

This implementation satisfies the following requirements:

- **2.4:** Friend request notification and display
- **2.5:** Accept/reject friend request functionality
- **4.1:** User-friendly UI design (will be completed with prefabs)
- **4.2:** Clear notifications and real-time updates
- **4.5:** Consistent icons and colors

## Related Files

- `FriendManager.cs` - Backend integration
- `AccountManager.cs` - Account data retrieval
- `FriendRequest.cs` - Data model
- `InGameAccount.cs` - Account data model
- `ApiResponse.cs` - API response model
