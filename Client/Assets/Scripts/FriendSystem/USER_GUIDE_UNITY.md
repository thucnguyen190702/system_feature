# Friend System - Unity Client User Guide

This guide explains how to use the Friend System features in the Unity game client.

## Table of Contents

1. [UI Overview](#ui-overview)
2. [Adding Friends](#adding-friends)
3. [Managing Friend List](#managing-friend-list)
4. [Friend Requests](#friend-requests)
5. [Viewing Profiles](#viewing-profiles)
6. [Common Tasks](#common-tasks)

---

## UI Overview

### Main Friend System UI Components

The Friend System consists of several UI panels:

1. **Friend List Panel**: Shows all your friends
2. **Search Panel**: Find new players to add
3. **Friend Request Panel**: Manage incoming requests
4. **Profile Panel**: View player details
5. **Error Popup**: Displays error messages

### Accessing the Friend System

- **Main Menu**: Click the "Friends" button
- **In-Game**: Press the Friends icon in the top menu
- **After Match**: Click "Add Friend" button

---

## Adding Friends

### Step 1: Open Search Panel

1. Click the **"Add Friend"** or **"+"** button
2. The Search Panel opens

### Step 2: Search for Players

**Search by Username**:
1. Select the **"Username"** tab
2. Type at least 2 characters
3. Click **"Search"** or press Enter
4. Results appear below

**Search by ID**:
1. Select the **"ID"** tab
2. Enter the complete Account ID
3. Click **"Search"**
4. The player's profile appears

### Step 3: Send Friend Request

1. Find the player in search results
2. Click the **"Add Friend"** button next to their name
3. A confirmation message appears
4. The request is sent!

**Success Message**: "Friend request sent successfully!"

---

## Managing Friend List

### Opening Your Friend List

1. Click the **"Friends"** icon on the main screen
2. Your friend list opens showing all friends

### Friend List Features

#### Viewing Friends

Each friend entry shows:
- **Avatar**: Profile picture
- **Display Name**: Their name
- **Level**: Current game level
- **Online Status**: 
  - 🟢 Green = Online
  - ⚫ Gray = Offline
- **Last Seen**: When they were last online (if offline)

#### Sorting Friends

Click the **"Sort"** dropdown to organize by:
- **Name (A-Z)**: Alphabetical order
- **Level**: Highest level first
- **Online**: Online friends appear first
- **Recent**: Recently added friends first

#### Searching in Friend List

1. Use the search box at the top
2. Type any part of a friend's name
3. The list filters automatically
4. Clear the search to see all friends again

#### Friend Count

At the bottom of the list:
- **Current**: Number of friends you have
- **Maximum**: Your friend list limit

Example: "Friends: 25/100"

### Interacting with Friends

Click on any friend to:
- **View Profile**: See detailed information
- **Remove Friend**: Delete from your list
- **Send Message**: (if messaging is enabled)

---

## Friend Requests

### Notification Badge

The Friend Request icon shows a **red badge** with the number of pending requests.

Example: 🔔 **3** = You have 3 pending requests

### Viewing Requests

1. Click the **Friend Request** icon (bell icon)
2. The Friend Request Panel opens
3. See all incoming requests

### Request Information

Each request shows:
- **Sender's Avatar**
- **Display Name**
- **Username**
- **Level**
- **Time Sent**: How long ago the request was sent

### Accepting Requests

1. Review the request details
2. Click the **"Accept"** button (✓ icon)
3. Confirmation: "Friend request accepted!"
4. The player is added to your friend list
5. The request disappears from the list

### Declining Requests

1. Find the request you want to decline
2. Click the **"Decline"** button (✗ icon)
3. The request is removed
4. No notification is sent to the sender

### Auto-Refresh

The request list updates automatically when:
- New requests arrive
- You accept/decline a request
- Requests are cancelled by the sender

---

## Viewing Profiles

### Opening a Profile

**From Friend List**:
1. Click on any friend
2. Their profile opens

**From Search Results**:
1. Search for a player
2. Click on their name or "View Profile"

**From Friend Request**:
1. Open Friend Requests
2. Click on the sender's name

### Profile Information

The profile shows:
- **Avatar**: Large profile picture
- **Display Name**: Their visible name
- **Username**: Their login name
- **Account ID**: Unique identifier
- **Level**: Current game level
- **Status**: Online/Offline
- **Last Seen**: When they were last online

### Profile Actions

Depending on your relationship:

**If Not Friends**:
- **"Add Friend"** button: Send friend request

**If Already Friends**:
- **"Remove Friend"** button: Delete from friend list
- **"View Stats"** button: See game statistics (if available)

**Any Player**:
- **"Block User"** button: Block this player
- **"Close"** button: Return to previous screen

---

## Common Tasks

### Task: Find and Add a Specific Friend

1. Get their **Account ID** or **Username**
2. Click **"Add Friend"** (+)
3. Choose search method (ID or Username)
4. Enter their information
5. Click **"Search"**
6. Click **"Add Friend"** on their profile
7. Wait for them to accept

**Time**: ~30 seconds

---

### Task: Accept All Friend Requests

1. Click the **Friend Request** icon (🔔)
2. Review each request
3. Click **"Accept"** (✓) for each one
4. Requests disappear as you accept them
5. Check your friend list to see new friends

**Time**: ~10 seconds per request

---

### Task: Remove an Inactive Friend

1. Open **Friend List**
2. Sort by **"Online"** to see offline friends
3. Click on the friend to remove
4. Click **"Remove Friend"**
5. Confirm the action
6. They're removed from your list

**Time**: ~15 seconds

---

### Task: Check Which Friends Are Online

1. Open **Friend List**
2. Sort by **"Online"**
3. Online friends appear at the top with 🟢
4. Offline friends appear below with ⚫

**Time**: ~5 seconds

---

### Task: Find a Friend in a Large List

1. Open **Friend List**
2. Click the **search box** at the top
3. Type part of their name
4. The list filters to matching names
5. Click on your friend

**Time**: ~10 seconds

---

## UI Tips and Tricks

### Quick Actions

- **Double-click** a friend to open their profile quickly
- **Right-click** (if supported) for context menu
- **Escape key** closes the current panel

### Visual Indicators

- **Green dot** (🟢): Friend is online now
- **Gray dot** (⚫): Friend is offline
- **Red badge**: Number of pending requests
- **Yellow highlight**: New friend added recently

### Performance Tips

- The friend list caches data for faster loading
- Pull down to refresh the list manually
- Online status updates every 30 seconds automatically

### Keyboard Navigation

If keyboard controls are enabled:
- **Tab**: Move between UI elements
- **Enter**: Confirm action
- **Escape**: Close panel
- **Arrow Keys**: Navigate lists

---

## Error Messages

### Common Errors and Solutions

#### "Failed to send friend request"

**Causes**:
- Daily limit reached (10 requests/day)
- Already friends with this player
- Player has blocked you
- Network connection issue

**Solution**: Wait 24 hours or check your connection

---

#### "Failed to load friend list"

**Causes**:
- No internet connection
- Server is down
- Authentication expired

**Solution**: 
1. Check internet connection
2. Close and reopen the panel
3. Restart the game if needed

---

#### "Account not found"

**Causes**:
- Wrong Account ID
- Username doesn't exist
- Typo in search

**Solution**: Double-check the ID/username and try again

---

#### "Friend list is full"

**Causes**:
- You've reached the maximum friend limit

**Solution**: Remove some inactive friends to make space

---

## Troubleshooting

### Friend List Not Updating

1. Close the Friend List panel
2. Wait 5 seconds
3. Reopen the panel
4. If still not working, restart the game

### Search Not Working

1. Ensure you typed at least 2 characters
2. Check your internet connection
3. Try searching by ID instead
4. Restart the game

### Cannot Accept Friend Request

1. Check if your friend list is full
2. Ensure you have internet connection
3. Try declining and asking them to resend
4. Restart the game

### Profile Won't Load

1. Close the profile panel
2. Try opening it again
3. Check internet connection
4. Restart the game if needed

---

## Best Practices

### For Better Experience

✅ **Do**:
- Keep your friend list organized
- Accept requests promptly
- Remove inactive friends periodically
- Use search to find friends quickly
- Check online status before inviting to games

❌ **Don't**:
- Send spam friend requests
- Accept requests from unknown players
- Share your Account ID publicly
- Keep your friend list at maximum capacity

---

## Quick Reference Card

### Button Icons

| Icon | Meaning |
|------|---------|
| + | Add Friend |
| 🔔 | Friend Requests |
| 👥 | Friend List |
| 🟢 | Online |
| ⚫ | Offline |
| ✓ | Accept |
| ✗ | Decline |
| 🗑️ | Remove |
| 🔍 | Search |

### Panel Shortcuts

| Panel | Access |
|-------|--------|
| Friend List | Click Friends icon |
| Search | Click + icon |
| Requests | Click 🔔 icon |
| Profile | Click on any player |

---

## Getting Help

If you need assistance:

1. **In-Game Help**: Press F1 or click Help button
2. **Error Messages**: Read the error popup carefully
3. **Restart**: Many issues resolve with a game restart
4. **Support**: Use the in-game support feature
5. **Documentation**: Check the full User Guide

---

## Updates and Changes

The Friend System may receive updates. Check the patch notes for:
- New features
- UI improvements
- Bug fixes
- Changed limits or restrictions

---

**Version**: 1.0.0  
**Platform**: Unity Client  
**Last Updated**: October 28, 2025

For the complete user guide, see [USER_GUIDE.md](../../../../../USER_GUIDE.md)
