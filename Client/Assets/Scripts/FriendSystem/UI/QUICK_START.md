# Friend List UI - Quick Start Guide

## For Developers

### Basic Usage

```csharp
using FriendSystem.UI;
using FriendSystem.Managers;

// Get reference to FriendListUI (attach to Canvas in scene)
FriendListUI friendListUI = FindObjectOfType<FriendListUI>();

// Load friend list for current account
string accountId = AccountManager.Instance.GetCurrentAccountId();
friendListUI.LoadFriendList(accountId);
```

### Opening the Friend List Panel

```csharp
// Show the friend list panel
GameObject friendListPanel = GameObject.Find("FriendListPanel");
friendListPanel.SetActive(true);

// Load the friend list
FriendListUI friendListUI = friendListPanel.GetComponent<FriendListUI>();
friendListUI.LoadFriendList(currentAccountId);
```

### Refreshing the Friend List

```csharp
// The UI has a built-in refresh button
// Or you can call it programmatically:
friendListUI.LoadFriendList(currentAccountId);
```

## For Unity Editor Setup

### Step 1: Create FriendListPanel Prefab

1. Right-click in Hierarchy → UI → Panel
2. Rename to "FriendListPanel"
3. Add `FriendListUI` component
4. Create child objects as per README.md hierarchy
5. Assign all references in Inspector
6. Save as prefab in `Assets/Prefabs/FriendSystem/`

### Step 2: Create FriendItem Prefab

1. Right-click in Hierarchy → UI → Panel
2. Rename to "FriendItem"
3. Add `FriendItemUI` component
4. Create child objects as per README.md hierarchy
5. Assign all references in Inspector
6. Save as prefab in `Assets/Prefabs/FriendSystem/`

### Step 3: Link Prefabs

1. Select FriendListPanel in scene
2. In FriendListUI component, drag FriendItem prefab to "Friend Item Prefab" field
3. Assign all other UI references

### Step 4: Test

1. Enter Play mode
2. Call `LoadFriendList()` with a valid account ID
3. Verify friend list displays correctly

## Common Issues

### "FriendSystemConfig not found"
- Create FriendSystemConfig asset in Resources folder
- See `Client/Assets/Scripts/FriendSystem/Config/` for details

### "NullReferenceException" on UI elements
- Ensure all UI references are assigned in Inspector
- Check that prefab is properly configured

### Friends not displaying
- Verify account ID is valid
- Check server is running and accessible
- Check auth token is set in FriendManager

### Search not working
- Ensure TMP_InputField is assigned
- Check that onValueChanged listener is set up

## Features Overview

| Feature | Description | Requirement |
|---------|-------------|-------------|
| Display Friends | Shows all friends with details | 3.1 |
| Search | Filter by name/username | 3.2 |
| Sort | By name, level, or online status | 3.3 |
| Remove Friend | Delete friend from list | 3.4 |
| Friend Count | Shows current/max friends | 3.5 |
| Online Status | Green/gray indicator | 3.1, 3.3 |
| Profile View | Click to view profile | 4.3, 4.4 |
| Refresh | Reload friend list | 4.2 |

## API Integration

The UI automatically integrates with:
- `FriendManager.GetFriendList()`
- `FriendManager.GetFriendsOnlineStatus()`
- `FriendManager.RemoveFriend()`

Ensure FriendManager is initialized before using the UI.

## Customization

### Change Max Friends Limit
```csharp
// In Inspector or code
friendListUI.maxFriends = 200;
```

### Customize Colors
```csharp
// In FriendItemUI Inspector
onlineColor = new Color(0, 1, 0); // Green
offlineColor = new Color(0.5f, 0.5f, 0.5f); // Gray
```

### Add Custom Sorting
Edit `FriendListUI.cs` and add new case to `ApplySorting()` method.

## Next Steps

1. ✅ Friend List UI implemented
2. ⏳ Create prefabs in Unity Editor
3. ⏳ Implement Profile UI (Task 17)
4. ⏳ Add confirmation dialogs
5. ⏳ Implement avatar loading
6. ⏳ Add animations

## Support

For detailed setup instructions, see `README.md`
For implementation details, see `IMPLEMENTATION_SUMMARY.md`
