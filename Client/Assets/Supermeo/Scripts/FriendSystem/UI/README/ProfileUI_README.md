# Profile UI - Hướng dẫn Sử dụng

## Tổng quan
ProfileUI là component Unity UI hiển thị thông tin tài khoản chi tiết và cung cấp các thao tác quản lý bạn bè. Cho phép người dùng xem hồ sơ, gửi lời mời kết bạn và xóa bạn bè.

## Yêu cầu được đáp ứng
- **2.3**: Hiển thị thông tin tài khoản cơ bản (tên, avatar, level)
- **3.1, 3.3**: Hiển thị trạng thái online và thông tin lần cuối online
- **2.4**: Gửi lời mời kết bạn từ trang hồ sơ
- **3.4**: Xóa bạn bè từ trang hồ sơ
- **4.4, 4.5**: Giao diện hồ sơ thân thiện với người dùng

## Tính năng

### Hiển thị Hồ sơ
- **Tên hiển thị**: Hiển thị tên hiển thị của tài khoản một cách nổi bật
- **Username**: Hiển thị @username handle
- **Level**: Hiển thị level tài khoản
- **Avatar**: Placeholder cho ảnh avatar (cần hệ thống tải sprite)
- **Trạng thái Online**: Chỉ báo trực quan (xanh/xám) và text hiển thị trạng thái online/offline
- **Lần cuối online**: Hiển thị lần cuối người dùng online với định dạng dễ đọc:
  - "Vừa mới offline" (vừa offline)
  - "Offline X phút trước" (offline X phút trước)
  - "Offline X giờ trước" (offline X giờ trước)
  - "Offline X ngày trước" (offline X ngày trước)
  - "Offline dd/MM/yyyy" (cho ngày cũ hơn)

### Thao tác Quản lý Bạn bè
- **Gửi lời mời kết bạn**: Nút xuất hiện khi xem hồ sơ người không phải bạn bè
- **Xóa bạn bè**: Nút xuất hiện khi xem hồ sơ bạn bè
- **Trạng thái nút thông minh**: Tự động ẩn nút thao tác khi xem hồ sơ của chính mình

### Trải nghiệm Người dùng
- **Chỉ báo Loading**: Hiển thị trong các thao tác async
- **Thông báo**: Hiển thị thông báo thành công/lỗi với tự động ẩn
- **Xác nhận**: Nhắc nhở trước khi xóa bạn bè (triển khai placeholder)
- **Nút Đóng**: Dễ dàng đóng panel hồ sơ

## Component Structure

### Serialized Fields

#### UI References
```csharp
[SerializeField] private GameObject profilePanel;
[SerializeField] private TextMeshProUGUI displayNameText;
[SerializeField] private TextMeshProUGUI usernameText;
[SerializeField] private TextMeshProUGUI levelText;
[SerializeField] private Image avatarImage;
[SerializeField] private GameObject onlineStatusIndicator;
[SerializeField] private TextMeshProUGUI onlineStatusText;
[SerializeField] private TextMeshProUGUI lastSeenText;
[SerializeField] private Button sendFriendRequestButton;
[SerializeField] private Button removeFriendButton;
[SerializeField] private Button closeButton;
[SerializeField] private GameObject loadingIndicator;
[SerializeField] private GameObject notificationPanel;
[SerializeField] private TextMeshProUGUI notificationText;
```

#### Settings
```csharp
[SerializeField] private Color onlineColor = Color.green;
[SerializeField] private Color offlineColor = Color.gray;
[SerializeField] private float notificationDuration = 3f;
```

## Public Methods

### SetCurrentAccount(string accountId)
Sets the current logged-in account ID. This is used to determine friend status and hide action buttons when viewing own profile.

```csharp
profileUI.SetCurrentAccount(currentAccountId);
```

### ShowProfile(InGameAccount account)
Displays the profile for the specified account. Automatically checks friend status and updates the UI accordingly.

```csharp
profileUI.ShowProfile(accountData);
```

### HideProfile()
Hides the profile panel and resets internal state.

```csharp
profileUI.HideProfile();
```

## Integration with Other Components

### SearchUI Integration
SearchUI can open profiles from search results:

```csharp
public void OnViewProfile(InGameAccount account)
{
    if (profileUI != null)
    {
        profileUI.SetCurrentAccount(currentAccountId);
        profileUI.ShowProfile(account);
    }
}
```

### FriendListUI Integration
FriendListUI can open profiles when clicking on friends:

```csharp
public void OnFriendProfileClicked(InGameAccount friend)
{
    if (profileUI != null)
    {
        profileUI.SetCurrentAccount(currentAccountId);
        profileUI.ShowProfile(friend);
    }
}
```

## Usage Example

```csharp
// In your main UI controller
public class MainUIController : MonoBehaviour
{
    [SerializeField] private ProfileUI profileUI;
    [SerializeField] private SearchUI searchUI;
    [SerializeField] private FriendListUI friendListUI;
    
    private string currentAccountId;
    
    private void Start()
    {
        // Set current account for all UI components
        profileUI.SetCurrentAccount(currentAccountId);
        searchUI.SetCurrentAccount(currentAccountId);
        friendListUI.LoadFriendList(currentAccountId);
    }
    
    // Profile can be opened from anywhere
    public void OpenProfile(InGameAccount account)
    {
        profileUI.ShowProfile(account);
    }
}
```

## Unity Setup

### Prefab Structure
```
ProfilePanel (GameObject)
├── Background (Image)
├── Header
│   ├── CloseButton (Button)
│   └── TitleText (TextMeshProUGUI)
├── Content
│   ├── AvatarImage (Image)
│   ├── DisplayNameText (TextMeshProUGUI)
│   ├── UsernameText (TextMeshProUGUI)
│   ├── LevelText (TextMeshProUGUI)
│   ├── OnlineStatusIndicator (Image)
│   ├── OnlineStatusText (TextMeshProUGUI)
│   └── LastSeenText (TextMeshProUGUI)
├── Actions
│   ├── SendFriendRequestButton (Button)
│   └── RemoveFriendButton (Button)
├── LoadingIndicator (GameObject)
└── NotificationPanel (GameObject)
    └── NotificationText (TextMeshProUGUI)
```

### Inspector Setup
1. Create a Canvas GameObject for the profile panel
2. Add the ProfileUI component to the root panel
3. Assign all UI references in the Inspector
4. Set colors for online/offline indicators
5. Configure notification duration (default: 3 seconds)
6. Link ProfileUI reference in SearchUI and FriendListUI

## Dependencies
- **FriendManager**: For friend operations (send request, remove friend, check status)
- **InGameAccount**: Data model for account information
- **TextMeshPro**: For text rendering
- **Unity UI**: For buttons, images, and layout

## Future Enhancements
1. **Avatar Loading**: Implement sprite loading from URL
2. **Confirmation Dialog**: Create proper confirmation UI for remove friend action
3. **Profile Stats**: Add more detailed statistics (games played, achievements, etc.)
4. **Profile Actions**: Add more actions (block user, report, etc.)
5. **Animation**: Add smooth transitions when opening/closing profile
6. **Caching**: Cache profile data to reduce API calls

## Error Handling
- Gracefully handles null account data
- Logs errors when friend status check fails
- Shows user-friendly error messages for failed operations
- Prevents actions when profile data is invalid

## Performance Considerations
- Async operations prevent UI blocking
- Friend status is checked only when profile is opened
- Notifications auto-hide to prevent UI clutter
- Proper cleanup in OnDestroy to prevent memory leaks

## Testing Checklist
- [ ] Profile displays correctly for friends
- [ ] Profile displays correctly for non-friends
- [ ] Profile displays correctly for own account (no action buttons)
- [ ] Online status indicator shows correct color
- [ ] Last seen text formats correctly for different time ranges
- [ ] Send friend request button works and shows notification
- [ ] Remove friend button works and shows notification
- [ ] Close button hides the profile
- [ ] Loading indicator shows during operations
- [ ] Notifications auto-hide after duration
- [ ] Integration with SearchUI works
- [ ] Integration with FriendListUI works
