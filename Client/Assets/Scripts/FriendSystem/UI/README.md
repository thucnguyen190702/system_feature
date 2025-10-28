# Friend System UI Components

This folder contains the UI scripts for the Friend System. The prefabs need to be created in the Unity Editor.

## Prefab Setup Instructions

### FriendListPanel Prefab

Create a new Canvas-based UI panel with the following hierarchy:

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

**FriendListUI Component Settings:**
- Attach `FriendListUI.cs` script to the root FriendListPanel
- Assign all UI references in the Inspector:
  - Friend Item Prefab: Reference to FriendItem prefab
  - Friend List Container: Content object inside ScrollView
  - Scroll Rect: ScrollRect component
  - Search Input Field: TMP_InputField component
  - Sort Dropdown: TMP_Dropdown component
  - Friend Count Text: TextMeshProUGUI component
  - Refresh Button: Button component
  - Loading Indicator: Loading panel GameObject
  - Empty State Panel: Empty state panel GameObject
  - Empty State Text: TextMeshProUGUI component
- Set Max Friends: 100 (default)

### FriendItem Prefab

Create a UI element for individual friend items:

```
FriendItem (Panel with Horizontal Layout Group)
├── AvatarSection
│   ├── AvatarImage (Image) - Circular mask
│   └── OnlineIndicator (Image) - Small green dot
│   └── OfflineIndicator (Image) - Small gray dot
├── InfoSection (Vertical Layout Group)
│   ├── DisplayNameText (TextMeshProUGUI) - Bold, larger font
│   ├── UsernameText (TextMeshProUGUI) - Smaller, gray
│   └── LevelText (TextMeshProUGUI) - "Lv.X"
└── ActionsSection
    ├── ProfileButton (Button) - Icon or "Xem"
    └── RemoveFriendButton (Button) - Icon or "Xóa"
```

**FriendItemUI Component Settings:**
- Attach `FriendItemUI.cs` script to the root FriendItem
- Assign all UI references in the Inspector:
  - Display Name Text: TextMeshProUGUI component
  - Level Text: TextMeshProUGUI component
  - Username Text: TextMeshProUGUI component
  - Avatar Image: Image component
  - Online Indicator: GameObject with green indicator
  - Offline Indicator: GameObject with gray indicator
  - Profile Button: Button component
  - Remove Friend Button: Button component
  - Background Image: Image component (optional)
- Set Colors:
  - Online Color: Green (0, 255, 0)
  - Offline Color: Gray (128, 128, 128)

## Layout Recommendations

### FriendListPanel
- Recommended size: 400x600 pixels
- Anchor: Center or stretch to fit screen
- Background: Semi-transparent dark panel

### FriendItem
- Recommended size: 380x80 pixels
- Layout: Horizontal with padding (10px)
- Spacing between elements: 10px
- Background: Light panel with hover effect

### ScrollView Settings
- Vertical scrolling only
- Content: Vertical Layout Group
  - Child Alignment: Upper Center
  - Spacing: 5px
  - Padding: 10px all sides
- Scroll Sensitivity: 20

## Usage Example

```csharp
// In your game code
FriendListUI friendListUI = FindObjectOfType<FriendListUI>();
string currentAccountId = "your-account-id";
friendListUI.LoadFriendList(currentAccountId);
```

## Requirements Covered

- **Requirement 3.1**: Display friend list with name, avatar, online/offline status, and level
- **Requirement 3.2**: Search functionality within friend list
- **Requirement 3.3**: Sort by name, level, or online status
- **Requirement 3.4**: Remove friend functionality
- **Requirement 3.5**: Display friend count and limit
- **Requirement 4.1**: User-friendly interface
- **Requirement 4.2**: Clear notifications and actions
- **Requirement 4.3**: Direct actions from friend list
- **Requirement 4.4**: Detailed profile view (click handler)
- **Requirement 4.5**: Consistent icons and colors

## Notes

- The prefabs should be saved in `Client/Assets/Prefabs/FriendSystem/` folder
- TextMeshPro is required for text components
- Consider adding animations for smooth transitions
- The avatar loading system needs to be implemented separately
- Confirmation dialogs should be implemented in a future task
