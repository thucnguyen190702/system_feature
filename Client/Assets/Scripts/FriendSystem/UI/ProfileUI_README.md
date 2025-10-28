# ProfileUI Implementation

## Overview
ProfileUI is a Unity UI component that displays detailed account information and provides friend management actions. It allows users to view profiles, send friend requests, and remove friends.

## Requirements Addressed
- **2.3**: Display basic account information (name, avatar, level)
- **3.1, 3.3**: Show online status and last seen information
- **2.4**: Send friend requests from profile view
- **3.4**: Remove friends from profile view
- **4.4, 4.5**: User-friendly profile interface

## Features

### Profile Display
- **Display Name**: Shows the account's display name prominently
- **Username**: Shows the @username handle
- **Level**: Displays the account level
- **Avatar**: Placeholder for avatar image (requires sprite loading system)
- **Online Status**: Visual indicator (green/gray) and text showing online/offline status
- **Last Seen**: Shows when the user was last online with human-readable format:
  - "Vừa mới offline" (just went offline)
  - "Offline X phút trước" (offline X minutes ago)
  - "Offline X giờ trước" (offline X hours ago)
  - "Offline X ngày trước" (offline X days ago)
  - "Offline dd/MM/yyyy" (for older dates)

### Friend Management Actions
- **Send Friend Request**: Button appears when viewing a non-friend profile
- **Remove Friend**: Button appears when viewing a friend's profile
- **Smart Button States**: Automatically hides action buttons when viewing own profile

### User Experience
- **Loading Indicator**: Shows during async operations
- **Notifications**: Displays success/error messages with auto-hide
- **Confirmation**: Prompts before removing friends (placeholder implementation)
- **Close Button**: Easy dismissal of profile panel

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
