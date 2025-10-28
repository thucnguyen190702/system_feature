# Friend System Unity Client - Setup Guide

## Prerequisites

- Unity 2021.3 LTS or newer
- .NET Standard 2.1 support

## Step 1: Import Newtonsoft.Json

The Friend System uses Newtonsoft.Json for JSON serialization.

### Option A: Via Package Manager (Recommended)

1. Open Unity Package Manager (Window > Package Manager)
2. Click the "+" button in the top-left
3. Select "Add package by name..."
4. Enter: `com.unity.nuget.newtonsoft-json`
5. Click "Add"

### Option B: Via manifest.json

1. Open `Packages/manifest.json` in your project
2. Add this line to the dependencies:
```json
{
  "dependencies": {
    "com.unity.nuget.newtonsoft-json": "3.2.1",
    ...
  }
}
```
3. Save and return to Unity (it will auto-import)

## Step 2: Verify Scripts

All Friend System scripts should be in:
```
Assets/Scripts/FriendSystem/
├── Config/
│   └── FriendSystemConfig.cs
├── Core/
│   └── ApiClient.cs
├── Models/
│   ├── InGameAccount.cs
│   ├── FriendRequest.cs
│   └── ApiResponse.cs
└── README.md
```

Unity should automatically compile these scripts. Check the Console for any errors.

## Step 3: Create Configuration Asset

1. In Unity Project window, right-click in a folder (e.g., `Assets/Resources/`)
2. Select: Create > Friend System > Config
3. Name it: `FriendSystemConfig`
4. Select the asset and configure in Inspector:
   - **Server URL**: `http://localhost:3000` (or your server URL)
   - **Request Timeout**: `30` seconds
   - **Max Friends**: `100`
   - Other settings as needed

## Step 4: Test API Client

Create a test script to verify the setup:

```csharp
using UnityEngine;
using FriendSystem.Core;
using FriendSystem.Config;

public class FriendSystemTest : MonoBehaviour
{
    [SerializeField] private FriendSystemConfig config;
    
    async void Start()
    {
        var apiClient = new ApiClient(config.ServerUrl + "/api", config.RequestTimeout);
        
        try
        {
            // Test health endpoint
            var response = await apiClient.GetAsync<object>("/health");
            Debug.Log("✅ Server connection successful!");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"❌ Server connection failed: {e.Message}");
        }
    }
}
```

1. Create an empty GameObject in your scene
2. Add the `FriendSystemTest` component
3. Assign the `FriendSystemConfig` asset
4. Make sure your server is running
5. Enter Play mode and check the Console

## Step 5: Project Settings

Ensure your project supports async/await:

1. Go to Edit > Project Settings > Player
2. Under "Other Settings" > "Configuration"
3. Set "Api Compatibility Level" to: **.NET Standard 2.1**
4. Set "Scripting Backend" to: **Mono** or **IL2CPP** (both work)

## Troubleshooting

### Newtonsoft.Json Not Found

**Error**: `The type or namespace name 'Newtonsoft' could not be found`

**Solution**:
1. Verify the package is installed (Window > Package Manager)
2. Try reimporting: Right-click package > Reimport
3. Restart Unity Editor

### Async/Await Not Working

**Error**: `'Task' does not contain a definition for 'Yield'`

**Solution**:
1. Check Api Compatibility Level is .NET Standard 2.1
2. Ensure you're using Unity 2021.3 or newer

### Cannot Connect to Server

**Error**: `API Error: Cannot connect to destination host`

**Solution**:
1. Verify the server is running (`npm run dev` in Server folder)
2. Check the Server URL in FriendSystemConfig
3. Test the server directly: Open `http://localhost:3000/health` in a browser
4. Check firewall settings

### CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
This shouldn't happen with UnityWebRequest, but if it does:
1. Verify server CORS settings in `Server/.env`
2. Set `CORS_ORIGIN=*` for development

## Next Steps

After successful setup:
1. The infrastructure is ready for Task 2 (Database Schema)
2. Manager classes will be implemented in subsequent tasks
3. UI components will be added later

## Development Tips

- Use `Debug.Log()` to trace API calls during development
- Test API endpoints with the server running locally first
- Create a dedicated test scene for Friend System features
- Keep the FriendSystemConfig asset in a Resources folder for easy access
