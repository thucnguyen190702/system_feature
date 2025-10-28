# Friend System UI Components - Hướng dẫn Sử dụng

Thư mục này chứa các script UI cho Friend System. Các prefab cần được tạo trong Unity Editor.

## Hướng dẫn Thiết lập Prefab

### FriendListPanel Prefab

Tạo một UI panel dựa trên Canvas với cấu trúc sau:

```
FriendListPanel (Canvas/Panel)
├── Header
│   ├── TitleText (TextMeshProUGUI) - "Danh sách bạn bè"
│   ├── FriendCountText (TextMeshProUGUI) - "Bạn bè: 0/100"
│   └── RefreshButton (Button)
├── SearchBar
│   └── SearchInputField (TMP_InputField) - Placeholder: "Tìm kiếm bạn bè..."
├── SortDropdown (TMP_Dropdown)
│   └── Options: "Tên", "Cấp độ", "Trạng thái Online"
├── FriendListScrollView (ScrollRect)
│   └── Viewport
│       └── Content (Vertical Layout Group)
│           └── [FriendItem prefabs will be instantiated here]
├── LoadingIndicator (Panel)
│   └── LoadingText (TextMeshProUGUI) - "Đang tải..."
└── EmptyStatePanel (Panel)
    ├── EmptyIcon (Image)
    └── EmptyStateText (TextMeshProUGUI) - "Chưa có bạn bè nào"
```

**Cài đặt FriendListUI Component:**
- Gắn script `FriendListUI.cs` vào root FriendListPanel
- Gán tất cả UI references trong Inspector:
  - Friend Item Prefab: Reference đến FriendItem prefab
  - Friend List Container: Object Content bên trong ScrollView
  - Scroll Rect: ScrollRect component
  - Search Input Field: TMP_InputField component
  - Sort Dropdown: TMP_Dropdown component
  - Friend Count Text: TextMeshProUGUI component
  - Refresh Button: Button component
  - Loading Indicator: Loading panel GameObject
  - Empty State Panel: Empty state panel GameObject
  - Empty State Text: TextMeshProUGUI component
- Đặt Max Friends: 100 (mặc định)

### FriendItem Prefab

Tạo UI element cho các friend items riêng lẻ:

```
FriendItem (Panel với Horizontal Layout Group)
├── AvatarSection
│   ├── AvatarImage (Image) - Circular mask
│   └── OnlineIndicator (Image) - Chấm xanh nhỏ
│   └── OfflineIndicator (Image) - Chấm xám nhỏ
├── InfoSection (Vertical Layout Group)
│   ├── DisplayNameText (TextMeshProUGUI) - Bold, font lớn hơn
│   ├── UsernameText (TextMeshProUGUI) - Nhỏ hơn, màu xám
│   └── LevelText (TextMeshProUGUI) - "Lv.X"
└── ActionsSection
    ├── ProfileButton (Button) - Icon hoặc "Xem"
    └── RemoveFriendButton (Button) - Icon hoặc "Xóa"
```

**Cài đặt FriendItemUI Component:**
- Gắn script `FriendItemUI.cs` vào root FriendItem
- Gán tất cả UI references trong Inspector:
  - Display Name Text: TextMeshProUGUI component
  - Level Text: TextMeshProUGUI component
  - Username Text: TextMeshProUGUI component
  - Avatar Image: Image component
  - Online Indicator: GameObject với green indicator
  - Offline Indicator: GameObject với gray indicator
  - Profile Button: Button component
  - Remove Friend Button: Button component
  - Background Image: Image component (tùy chọn)
- Đặt Màu sắc:
  - Online Color: Xanh (0, 255, 0)
  - Offline Color: Xám (128, 128, 128)

## Khuyến nghị Layout

### FriendListPanel
- Kích thước khuyến nghị: 400x600 pixels
- Anchor: Center hoặc stretch để fit màn hình
- Background: Panel tối bán trong suốt

### FriendItem
- Kích thước khuyến nghị: 380x80 pixels
- Layout: Horizontal với padding (10px)
- Spacing giữa các elements: 10px
- Background: Panel sáng với hover effect

### Cài đặt ScrollView
- Chỉ vertical scrolling
- Content: Vertical Layout Group
  - Child Alignment: Upper Center
  - Spacing: 5px
  - Padding: 10px tất cả các bên
- Scroll Sensitivity: 20

## Ví dụ Sử dụng

```csharp
// Trong game code của bạn
FriendListUI friendListUI = FindObjectOfType<FriendListUI>();
string currentAccountId = "your-account-id";
friendListUI.LoadFriendList(currentAccountId);
```

## Yêu cầu Được bao phủ

- **Yêu cầu 3.1**: Hiển thị friend list với tên, avatar, trạng thái online/offline và level
- **Yêu cầu 3.2**: Chức năng tìm kiếm trong friend list
- **Yêu cầu 3.3**: Sắp xếp theo tên, level, hoặc trạng thái online
- **Yêu cầu 3.4**: Chức năng xóa bạn bè
- **Yêu cầu 3.5**: Hiển thị số lượng và giới hạn bạn bè
- **Yêu cầu 4.1**: Giao diện thân thiện với người dùng
- **Yêu cầu 4.2**: Thông báo và hành động rõ ràng
- **Yêu cầu 4.3**: Hành động trực tiếp từ friend list
- **Yêu cầu 4.4**: Xem profile chi tiết (click handler)
- **Yêu cầu 4.5**: Icons và màu sắc nhất quán

## Ghi chú

- Các prefabs nên được lưu trong thư mục `Client/Assets/Prefabs/FriendSystem/`
- TextMeshPro được yêu cầu cho text components
- Cân nhắc thêm animations cho transitions mượt mà
- Hệ thống avatar loading cần được triển khai riêng
- Confirmation dialogs nên được triển khai trong task tương lai
