# Search UI Implementation

## Overview

This document describes the Search UI implementation for the Friend System, which allows players to search for other accounts by username or ID and send friend requests.

## Components

### 1. SearchUI.cs
Main controller for the Search panel that handles:
- Search by username (Requirement 2.1)
- Search by ID (Requirement 2.2)
- Display search results with basic info (Requirements 2.3, 4.2, 4.5)
- Send friend requests from search results (Requirements 2.4, 4.2)
- Show notifications when requests are sent (Requirement 4.2)

### 2. SearchResultItemUI.cs
Individual search result item component that displays:
- Account display name, username, and level (Requirement 2.3)
- Avatar placeholder
- Send friend request button (Requirement 2.4)
- Already friend indicator
- Request sent indicator

## Features Implemented

### Search Functionality
- **Search by Username**: Users can search for accounts by entering a username
- **Search by ID**: Users can search for a specific account by entering their unique ID
- **Search Type Dropdown**: Toggle between username and ID search modes
- **Real-time Search**: Press Enter or click Search button to perform search

### Search Results Display
- **Basic Account Info**: Shows display name, username (@username), and level
- **Friend Status Indicators**: 
  - Shows "Already Friend" if the account is already in friend list
  - Shows "Request Sent" after sending a friend request
- **Send Request Button**: Visible only for non-friends who haven't received a request yet

### Notifications
- **Success Notification**: Shows when friend request is sent successfully
- **Error Messages**: Shows when search fails or request cannot be sent
- **Auto-hide**: Notifications automatically hide after 3 seconds

### UI States
- **Empty State**: Shows helpful message when no search has been performed or no results found
- **Loading State**: Shows loading indicator during search operations
- **Error State**: Shows error messages when operations fail

## Unity Setup Instructions

### 1. Create SearchPanel GameObject

1. In Unity Hierarchy, create a new UI Panel: `Right-click → UI → Panel`
2. Rename it to "SearchPanel"
3. Add the `SearchUI` component to this GameObject

### 2. Create SearchResultItem Prefab

1. Create a new UI Panel for the search result item
2. Add the following child objects:
   - TextMeshProUGUI for display name
   - TextMeshProUGUI for username
   - TextMeshProUGUI for level
   - Image for avatar
   - Button for "Send Request"
   - Button for "View Profile"
   - GameObject for "Already Friend" indicator
   - GameObject for "Request Sent" indicator
3. Add the `SearchResultItemUI` component
4. Assign all UI references in the Inspector
5. Save as a prefab in `Assets/Prefabs/FriendSystem/`

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
