# Hệ thống Bạn bè Unity Client - Hướng dẫn Thiết lập

## Yêu cầu Tiên quyết

- Unity 2021.3 LTS trở lên
- Hỗ trợ .NET Standard 2.1

## Bước 1: Import Newtonsoft.Json

Hệ thống Bạn bè sử dụng Newtonsoft.Json cho JSON serialization.

### Tùy chọn A: Qua Package Manager (Khuyến nghị)

1. Mở Unity Package Manager (Window > Package Manager)
2. Nhấp nút "+" ở góc trên-trái
3. Chọn "Add package by name..."
4. Nhập: `com.unity.nuget.newtonsoft-json`
5. Nhấp "Add"

### Tùy chọn B: Qua manifest.json

1. Mở `Packages/manifest.json` trong dự án của bạn
2. Thêm dòng này vào dependencies:
```json
{
  "dependencies": {
    "com.unity.nuget.newtonsoft-json": "3.2.1",
    ...
  }
}
```
3. Lưu và quay lại Unity (sẽ tự động import)

## Bước 2: Xác minh Scripts

Tất cả Friend System scripts nên ở trong:
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

Unity sẽ tự động compile các scripts này. Kiểm tra Console để tìm lỗi.

## Bước 3: Tạo Configuration Asset

1. Trong Unity Project window, right-click trong một folder (ví dụ: `Assets/Resources/`)
2. Chọn: Create > Friend System > Config
3. Đặt tên: `FriendSystemConfig`
4. Chọn asset và cấu hình trong Inspector:
   - **Server URL**: `http://localhost:3000` (hoặc server URL của bạn)
   - **Request Timeout**: `30` giây
   - **Max Friends**: `100`
   - Các cài đặt khác theo nhu cầu

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
