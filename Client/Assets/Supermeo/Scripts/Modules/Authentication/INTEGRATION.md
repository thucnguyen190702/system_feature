# Unity Authentication Module - Integration Guide

Quick guide for integrating the Authentication module into your Unity game systems.

## Quick Start

### 1. Check Authentication Status

```csharp
using Authentication.Core;

if (AuthenticationManager.Instance.IsAuthenticated)
{
    string userId = AuthenticationManager.Instance.CurrentUserId;
    string username = AuthenticationManager.Instance.CurrentUsername;
    
    // User is logged in - proceed with game logic
}
else
{
    // User is not logged in - show login screen
}
```

### 2. Make Authenticated API Calls

```csharp
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using Authentication.Core;

public async Task<Response> CallProtectedEndpoint()
{
    // Check authentication
    if (!AuthenticationManager.Instance.IsAuthenticated)
    {
        throw new Exception("User not authenticated");
    }
    
    // Get token
    TokenStorage storage = new TokenStorage();
    string token = storage.GetToken();
    
    // Create request
    string url = "http://localhost:3000/api/your-endpoint";
    UnityWebRequest request = UnityWebRequest.Get(url);
    
    // Add Authorization header
    request.SetRequestHeader("Authorization", $"Bearer {token}");
    request.timeout = 10;
    
    // Send request
    var operation = request.SendWebRequest();
    while (!operation.isDone)
    {
        await Task.Yield();
    }
    
    // Handle response
    if (request.result == UnityWebRequest.Result.Success)
    {
        string json = request.downloadHandler.text;
        return JsonUtility.FromJson<Response>(json);
    }
    else if (request.responseCode == 401)
    {
        // Token expired - logout user
        AuthenticationManager.Instance.Logout();
        throw new Exception("Session expired");
    }
    else
    {
        throw new Exception($"Request failed: {request.error}");
    }
}
```

### 3. Listen to Authentication Events

```csharp
using Authentication.Core;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    private void OnEnable()
    {
        // Subscribe to auth state changes
        AuthenticationManager.Instance.OnAuthenticationChanged += HandleAuthChanged;
    }
    
    private void OnDisable()
    {
        // Always unsubscribe to prevent memory leaks
        if (AuthenticationManager.Instance != null)
        {
            AuthenticationManager.Instance.OnAuthenticationChanged -= HandleAuthChanged;
        }
    }
    
    private void HandleAuthChanged(bool isAuthenticated)
    {
        if (isAuthenticated)
        {
            Debug.Log("User logged in");
            LoadMainGame();
        }
        else
        {
            Debug.Log("User logged out");
            LoadLoginScreen();
        }
    }
}
```

## Creating a Reusable API Client

For cleaner code, create a reusable authenticated API client:

```csharp
using System;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using Authentication.Core;
using Newtonsoft.Json;

public class AuthenticatedAPIClient
{
    private readonly string serverUrl;
    private readonly TokenStorage tokenStorage;
    
    public AuthenticatedAPIClient(string serverUrl)
    {
        this.serverUrl = serverUrl;
        this.tokenStorage = new TokenStorage();
    }
    
    public async Task<TResponse> GetAsync<TResponse>(string endpoint)
    {
        return await SendRequestAsync<TResponse>(endpoint, "GET", null);
    }
    
    public async Task<TResponse> PostAsync<TResponse>(string endpoint, object body)
    {
        return await SendRequestAsync<TResponse>(endpoint, "POST", body);
    }
    
    private async Task<TResponse> SendRequestAsync<TResponse>(
        string endpoint, 
        string method, 
        object body)
    {
        if (!AuthenticationManager.Instance.IsAuthenticated)
        {
            throw new Exception("User is not authenticated");
        }
        
        string url = $"{serverUrl}{endpoint}";
        string token = tokenStorage.GetToken();
        
        UnityWebRequest request;
        
        if (method == "GET")
        {
            request = UnityWebRequest.Get(url);
        }
        else if (method == "POST")
        {
            string jsonBody = JsonConvert.SerializeObject(body);
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
            request = new UnityWebRequest(url, method);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
        }
        else
        {
            throw new NotSupportedException($"Method {method} not supported");
        }
        
        request.SetRequestHeader("Authorization", $"Bearer {token}");
        request.timeout = 10;
        
        var operation = request.SendWebRequest();
        while (!operation.isDone)
        {
            await Task.Yield();
        }
        
        if (request.result == UnityWebRequest.Result.Success)
        {
            string jsonResponse = request.downloadHandler.text;
            return JsonConvert.DeserializeObject<TResponse>(jsonResponse);
        }
        else if (request.responseCode == 401)
        {
            AuthenticationManager.Instance.Logout();
            throw new Exception("Session expired. Please login again.");
        }
        else
        {
            throw new Exception($"Request failed: {request.error}");
        }
    }
}
```

**Usage:**
```csharp
public class MyManager : MonoBehaviour
{
    private AuthenticatedAPIClient apiClient;
    
    private void Start()
    {
        apiClient = new AuthenticatedAPIClient("http://localhost:3000");
    }
    
    public async void LoadData()
    {
        try
        {
            var response = await apiClient.GetAsync<DataResponse>("/api/my-data");
            Debug.Log($"Loaded data: {response.data}");
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load data: {ex.Message}");
        }
    }
}
```

## Best Practices

### 1. Always Check Authentication
```csharp
// ✓ Good
if (AuthenticationManager.Instance.IsAuthenticated)
{
    MakeAPICall();
}

// ✗ Bad - may fail if user not authenticated
MakeAPICall();
```

### 2. Handle Token Expiration
```csharp
try
{
    await apiClient.GetAsync<Response>("/api/endpoint");
}
catch (Exception ex)
{
    if (ex.Message.Contains("Session expired"))
    {
        ShowReLoginDialog();
    }
}
```

### 3. Subscribe/Unsubscribe Properly
```csharp
// ✓ Good - prevents memory leaks
private void OnEnable()
{
    AuthenticationManager.Instance.OnAuthenticationChanged += Handler;
}

private void OnDisable()
{
    if (AuthenticationManager.Instance != null)
    {
        AuthenticationManager.Instance.OnAuthenticationChanged -= Handler;
    }
}

// ✗ Bad - memory leak
private void Start()
{
    AuthenticationManager.Instance.OnAuthenticationChanged += Handler;
    // Never unsubscribes!
}
```

### 4. Use Async/Await
```csharp
// ✓ Good - non-blocking
public async void LoadData()
{
    var data = await FetchDataAsync();
}

// ✗ Bad - blocks Unity main thread
public void LoadData()
{
    var data = FetchDataAsync().Result;
}
```

### 5. Cache Data When Appropriate
```csharp
private List<Friend> cachedFriends;
private DateTime lastFetch;

public async Task<List<Friend>> GetFriends(bool forceRefresh = false)
{
    if (!forceRefresh && 
        cachedFriends != null && 
        (DateTime.Now - lastFetch).TotalMinutes < 5)
    {
        return cachedFriends;
    }
    
    cachedFriends = await FetchFriendsFromServer();
    lastFetch = DateTime.Now;
    return cachedFriends;
}
```

## Common Issues

### "User is not authenticated"
- Check: `AuthenticationManager.Instance.IsAuthenticated`
- Verify token exists: `new TokenStorage().HasToken()`
- User may need to login

### "Authorization header missing"
- Ensure you're adding the header:
  ```csharp
  request.SetRequestHeader("Authorization", $"Bearer {token}");
  ```

### "Session expired"
- Token expired (24 hours default)
- Logout user and prompt re-login

### Network errors
- Verify server is running
- Check server URL in AuthConfig
- Test with curl/Postman first

## Complete Examples

See the [examples folder](../../../../../.kiro/specs/authentication-system/examples/) for complete, working examples:
- `client-example-module.cs` - Full Unity module with authenticated API calls
- `server-example-module.ts` - Corresponding server module

## Additional Resources

- [Integration Guide](../../../../../.kiro/specs/authentication-system/INTEGRATION_GUIDE.md) - Comprehensive guide
- [Quick Reference](../../../../../.kiro/specs/authentication-system/QUICK_INTEGRATION_REFERENCE.md) - Quick reference
- [Design Document](../../../../../.kiro/specs/authentication-system/design.md) - System architecture
- [Scene Setup Guide](./SCENE_SETUP_GUIDE.md) - Setting up authentication scene

---

**Need Help?** Check the integration guide or review the example modules.
