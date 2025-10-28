# Friend System Managers

This folder contains manager classes that handle business logic and API interactions for the Friend System.

## AccountManager

Manages account-related operations including creation, retrieval, and updates.

### Features
- **CreateAccount**: Creates a new in-game account with a unique username
- **GetAccount**: Retrieves account information by account ID
- **UpdateAccount**: Updates account information (display name, avatar, level, status)

### Usage Example

```csharp
using FriendSystem.Managers;

// Create a new account
var account = await AccountManager.Instance.CreateAccount("player123");

// Get account information
var accountInfo = await AccountManager.Instance.GetAccount(accountId);

// Update account
var updateData = new AccountUpdateData
{
    displayName = "New Display Name",
    avatarUrl = "https://example.com/avatar.png",
    level = 5
};
var updatedAccount = await AccountManager.Instance.UpdateAccount(accountId, updateData);
```

### Requirements Covered
- 1.1: Unique account creation and retrieval
- 1.2: Unique ID assignment (handled by server)
- 1.3: Account information updates

### Dependencies
- ApiClient: For HTTP communication
- FriendSystemConfig: For server configuration
- InGameAccount model: Data structure for accounts
