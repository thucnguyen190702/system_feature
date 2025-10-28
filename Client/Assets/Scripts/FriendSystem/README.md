# Friend System - Unity Client

Unity C# client for the Friend System.

## Prerequisites

- Unity 2021.3 LTS or newer
- .NET Standard 2.1
- Newtonsoft.Json package

## Installation

1. Import Newtonsoft.Json package via Package Manager:
   - Open Package Manager (Window > Package Manager)
   - Add package from git URL: `com.unity.nuget.newtonsoft-json`

2. Configure the Friend System:
   - Create a FriendSystemConfig asset (Right-click > Create > Friend System > Config)
   - Set your server URL (default: http://localhost:3000)
   - Adjust other settings as needed

## Project Structure

```
Assets/Scripts/FriendSystem/
├── Config/              # Configuration
│   └── FriendSystemConfig.cs
├── Core/                # Core functionality
│   └── ApiClient.cs     # HTTP client
├── Models/              # Data models
│   ├── InGameAccount.cs
│   ├── FriendRequest.cs
│   └── ApiResponse.cs
├── Managers/            # Manager classes (to be added)
├── UI/                  # UI components (to be added)
└── README.md
```

## Usage

### Configuration

Create and configure a FriendSystemConfig ScriptableObject:

```csharp
// In Unity Editor:
// Right-click in Project > Create > Friend System > Config
// Set the Server URL to your backend server
```

### API Client

The ApiClient handles all HTTP communication with the server:

```csharp
using FriendSystem.Core;

var apiClient = new ApiClient("http://localhost:3000/api", timeout: 30);
apiClient.SetAuthToken("your-jwt-token");

// GET request
var account = await apiClient.GetAsync<InGameAccount>("/accounts/123");

// POST request
var response = await apiClient.PostAsync<ApiResponse>("/friend-requests", new { toAccountId = "456" });
```

## Next Steps

The following components will be implemented in subsequent tasks:
- AccountManager - Account management
- FriendManager - Friend list and requests
- SearchManager - User search
- UI Components - Friend list, search, and request panels

## Notes

- All async operations use Task-based async/await pattern
- JSON serialization is handled by Newtonsoft.Json
- Authentication tokens are managed by the ApiClient
- Error handling should be implemented in manager classes
