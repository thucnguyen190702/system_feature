# Authentication System Integration Guide

This guide provides comprehensive instructions for integrating the Authentication System into your game modules, both on the server (Node.js/TypeScript) and client (Unity/C#).

## Table of Contents

1. [Server Integration](#server-integration)
   - [Using Auth Middleware](#using-auth-middleware)
   - [Accessing Authenticated User Data](#accessing-authenticated-user-data)
   - [Creating Protected Endpoints](#creating-protected-endpoints)
   - [Error Handling](#error-handling)
2. [Client Integration](#client-integration)
   - [Using AuthenticationManager](#using-authenticationmanager)
   - [Checking Authentication Status](#checking-authentication-status)
   - [Making Authenticated API Calls](#making-authenticated-api-calls)
   - [Listening to Auth Events](#listening-to-auth-events)
3. [Environment Configuration](#environment-configuration)
   - [Development Setup](#development-setup)
   - [Production Setup](#production-setup)
4. [Code Examples](#code-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Server Integration

### Using Auth Middleware

The authentication system provides middleware to protect your API endpoints. The middleware validates JWT tokens and attaches user information to the request object.

#### Import the Middleware

```typescript
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';
```

#### Apply to Routes

**Single Route Protection:**
```typescript
import { Router } from 'express';
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';

const router = Router();

// Protected endpoint - requires authentication
router.get('/api/profile', AuthMiddleware.authenticate, async (req, res) => {
  // Access authenticated user data from req.user
  const userId = req.user.userId;
  const username = req.user.username;
  
  res.json({
    success: true,
    userId,
    username
  });
});

// Public endpoint - no authentication required
router.get('/api/public-data', async (req, res) => {
  res.json({ message: 'This is public data' });
});
```

**Multiple Routes Protection:**
```typescript
const router = Router();

// Apply middleware to all routes in this router
router.use(AuthMiddleware.authenticate);

// All routes below are now protected
router.get('/api/friends', getFriendsHandler);
router.post('/api/friends/request', sendFriendRequestHandler);
router.get('/api/leaderboard', getLeaderboardHandler);
```

**Mixed Public and Protected Routes:**
```typescript
const router = Router();

// Public routes
router.get('/api/game-info', getGameInfoHandler);
router.get('/api/news', getNewsHandler);

// Protected routes group
const protectedRouter = Router();
protectedRouter.use(AuthMiddleware.authenticate);
protectedRouter.get('/api/user/stats', getUserStatsHandler);
protectedRouter.post('/api/user/settings', updateSettingsHandler);

// Mount protected router
router.use(protectedRouter);
```

### Accessing Authenticated User Data

Once the middleware validates the token, user information is attached to `req.user`:

```typescript
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;    // UUID of the authenticated user
    username: string;  // Username of the authenticated user
  };
}
```

**Example Usage:**
```typescript
router.post('/api/friends/request', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const senderId = req.user.userId;      // User making the request
    const senderUsername = req.user.username;
    const { targetUserId } = req.body;
    
    // Use authenticated user data in your business logic
    const friendRequest = await friendService.sendRequest(senderId, targetUserId);
    
    res.json({
      success: true,
      message: `Friend request sent from ${senderUsername}`,
      data: friendRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
});
```

### Creating Protected Endpoints

#### Step-by-Step Guide

1. **Create Your Module Structure:**
```
src/modules/friends/
├── friends.module.ts
├── friends.controller.ts
├── friends.service.ts
├── friends.repository.ts
└── dto/
    └── send-request.dto.ts
```

2. **Import Auth Middleware in Controller:**
```typescript
// friends.controller.ts
import { Router } from 'express';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
import { FriendsService } from './friends.service';

export class FriendsController {
  private router: Router;
  
  constructor(private friendsService: FriendsService) {
    this.router = Router();
    this.registerRoutes();
  }
  
  private registerRoutes(): void {
    // All routes use authentication middleware
    this.router.get('/api/friends', 
      AuthMiddleware.authenticate, 
      this.getFriends.bind(this)
    );
    
    this.router.post('/api/friends/request', 
      AuthMiddleware.authenticate, 
      this.sendRequest.bind(this)
    );
  }
  
  private async getFriends(req: Request, res: Response): Promise<void> {
    const userId = req.user.userId;
    const friends = await this.friendsService.getFriends(userId);
    res.json({ success: true, data: friends });
  }
  
  private async sendRequest(req: Request, res: Response): Promise<void> {
    const senderId = req.user.userId;
    const { targetUserId } = req.body;
    const result = await this.friendsService.sendRequest(senderId, targetUserId);
    res.json({ success: true, data: result });
  }
  
  getRouter(): Router {
    return this.router;
  }
}
```

3. **Register Module in Main App:**
```typescript
// app.ts
import express from 'express';
import { AuthModule } from './modules/auth/auth.module';
import { FriendsModule } from './modules/friends/friends.module';

const app = express();

// Initialize auth module first
const authModule = new AuthModule();
authModule.initialize(app);

// Initialize other modules
const friendsModule = new FriendsModule();
friendsModule.initialize(app);

export default app;
```

### Error Handling

The middleware automatically handles authentication errors:

**Automatic Error Responses:**

| Error Condition | Status Code | Response |
|----------------|-------------|----------|
| Missing Authorization header | 401 | `{ success: false, message: "Authorization header missing" }` |
| Invalid header format | 401 | `{ success: false, message: "Invalid authorization header format..." }` |
| Invalid/expired token | 401 | `{ success: false, message: "Token verification failed" }` |

**Custom Error Handling:**
```typescript
router.get('/api/protected', AuthMiddleware.authenticate, async (req, res) => {
  try {
    // Your business logic
    const data = await someService.getData(req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    // Handle your specific errors
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: 'Resource not found' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});
```

---

## Client Integration

### Using AuthenticationManager

The `AuthenticationManager` is a singleton that manages authentication state throughout your Unity application.

#### Accessing the Manager

```csharp
using Authentication.Core;

// Access the singleton instance
if (AuthenticationManager.Instance != null)
{
    // Use the manager
}
```

### Checking Authentication Status

**Basic Status Check:**
```csharp
using Authentication.Core;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    private void Start()
    {
        if (AuthenticationManager.Instance.IsAuthenticated)
        {
            Debug.Log("User is logged in");
            LoadMainGame();
        }
        else
        {
            Debug.Log("User is not logged in");
            LoadLoginScene();
        }
    }
}
```

**Accessing User Information:**
```csharp
public class PlayerProfile : MonoBehaviour
{
    private void DisplayUserInfo()
    {
        if (AuthenticationManager.Instance.IsAuthenticated)
        {
            string userId = AuthenticationManager.Instance.CurrentUserId;
            string username = AuthenticationManager.Instance.CurrentUsername;
            
            Debug.Log($"User ID: {userId}");
            Debug.Log($"Username: {username}");
            
            // Use this data in your UI or game logic
            usernameText.text = username;
        }
    }
}
```

### Making Authenticated API Calls

When making API calls to protected endpoints, you need to include the authentication token.

#### Option 1: Using UnityWebRequest Directly

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using Authentication.Core;

public class FriendsAPI : MonoBehaviour
{
    private string serverUrl = "http://localhost:3000";
    
    public IEnumerator GetFriendsList()
    {
        // Check authentication
        if (!AuthenticationManager.Instance.IsAuthenticated)
        {
            Debug.LogError("User is not authenticated");
            yield break;
        }
        
        // Get token from storage
        TokenStorage tokenStorage = new TokenStorage();
        string token = tokenStorage.GetToken();
        
        // Create request
        string url = $"{serverUrl}/api/friends";
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            // Add Authorization header
            request.SetRequestHeader("Authorization", $"Bearer {token}");
            request.timeout = 10;
            
            // Send request
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                Debug.Log($"Friends: {jsonResponse}");
                // Parse and use response
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
            }
        }
    }
}
```

#### Option 2: Creating a Reusable API Client

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
    
    /// <summary>
    /// Send authenticated GET request
    /// </summary>
    public async Task<TResponse> GetAsync<TResponse>(string endpoint)
    {
        return await SendRequestAsync<TResponse>(endpoint, "GET", null);
    }
    
    /// <summary>
    /// Send authenticated POST request
    /// </summary>
    public async Task<TResponse> PostAsync<TResponse>(string endpoint, object body)
    {
        return await SendRequestAsync<TResponse>(endpoint, "POST", body);
    }
    
    /// <summary>
    /// Send authenticated request with automatic token handling
    /// </summary>
    private async Task<TResponse> SendRequestAsync<TResponse>(
        string endpoint, 
        string method, 
        object body)
    {
        // Check authentication
        if (!AuthenticationManager.Instance.IsAuthenticated)
        {
            throw new Exception("User is not authenticated");
        }
        
        string url = $"{serverUrl}{endpoint}";
        string token = tokenStorage.GetToken();
        
        UnityWebRequest request;
        
        // Create request based on method
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
        
        // Add Authorization header
        request.SetRequestHeader("Authorization", $"Bearer {token}");
        request.timeout = 10;
        
        // Send request
        var operation = request.SendWebRequest();
        
        // Wait for completion
        while (!operation.isDone)
        {
            await Task.Yield();
        }
        
        // Handle response
        if (request.result == UnityWebRequest.Result.Success)
        {
            string jsonResponse = request.downloadHandler.text;
            return JsonConvert.DeserializeObject<TResponse>(jsonResponse);
        }
        else if (request.responseCode == 401)
        {
            // Token expired or invalid - logout user
            Debug.LogWarning("Authentication token expired");
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

**Usage Example:**
```csharp
public class FriendsManager : MonoBehaviour
{
    private AuthenticatedAPIClient apiClient;
    
    private void Start()
    {
        apiClient = new AuthenticatedAPIClient("http://localhost:3000");
    }
    
    public async void LoadFriends()
    {
        try
        {
            var response = await apiClient.GetAsync<FriendsResponse>("/api/friends");
            
            if (response.success)
            {
                Debug.Log($"Loaded {response.data.Count} friends");
                DisplayFriends(response.data);
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load friends: {ex.Message}");
        }
    }
    
    public async void SendFriendRequest(string targetUserId)
    {
        try
        {
            var requestBody = new { targetUserId };
            var response = await apiClient.PostAsync<FriendRequestResponse>(
                "/api/friends/request", 
                requestBody
            );
            
            if (response.success)
            {
                Debug.Log("Friend request sent successfully");
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to send friend request: {ex.Message}");
        }
    }
}
```

### Listening to Auth Events

The `AuthenticationManager` provides events to notify your code when authentication state changes.

```csharp
using Authentication.Core;
using UnityEngine;
using UnityEngine.SceneManagement;

public class AuthStateHandler : MonoBehaviour
{
    private void OnEnable()
    {
        // Subscribe to authentication state changes
        if (AuthenticationManager.Instance != null)
        {
            AuthenticationManager.Instance.OnAuthenticationChanged += HandleAuthenticationChanged;
        }
    }
    
    private void OnDisable()
    {
        // Unsubscribe to prevent memory leaks
        if (AuthenticationManager.Instance != null)
        {
            AuthenticationManager.Instance.OnAuthenticationChanged -= HandleAuthenticationChanged;
        }
    }
    
    private void HandleAuthenticationChanged(bool isAuthenticated)
    {
        if (isAuthenticated)
        {
            Debug.Log("User logged in");
            OnUserLoggedIn();
        }
        else
        {
            Debug.Log("User logged out");
            OnUserLoggedOut();
        }
    }
    
    private void OnUserLoggedIn()
    {
        // Load main game scene
        SceneManager.LoadScene("MainGame");
        
        // Initialize user-specific systems
        InitializePlayerData();
        ConnectToGameServer();
    }
    
    private void OnUserLoggedOut()
    {
        // Return to login scene
        SceneManager.LoadScene("Authentication");
        
        // Clean up user-specific data
        CleanupPlayerData();
        DisconnectFromGameServer();
    }
    
    private void InitializePlayerData()
    {
        // Load player profile, friends, etc.
    }
    
    private void CleanupPlayerData()
    {
        // Clear cached data
    }
    
    private void ConnectToGameServer()
    {
        // Establish game server connection
    }
    
    private void DisconnectFromGameServer()
    {
        // Close game server connection
    }
}
```

---

## Environment Configuration

### Development Setup

#### Server Configuration

1. **Copy environment template:**
```bash
cd Server
cp .env.example .env
```

2. **Configure `.env` for development:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=game_dev_db

# JWT Configuration
JWT_SECRET=dev-secret-key-change-me
JWT_EXPIRES_IN=24h
```

3. **Start development server:**
```bash
npm install
npm run dev
```

#### Client Configuration

1. **Create AuthConfig asset:**
   - In Unity: `Assets/Resources/AuthConfig.asset`
   - Right-click in Project → Create → Authentication → Config

2. **Configure for development:**
   - Server URL: `http://localhost:3000`
   - Register Endpoint: `/api/auth/register`
   - Login Endpoint: `/api/auth/login`
   - Validate Endpoint: `/api/auth/validate`
   - Request Timeout: `10` seconds

3. **Development testing:**
   - Ensure server is running on `localhost:3000`
   - Test in Unity Editor Play Mode
   - Check Console for detailed logs

### Production Setup

#### Server Configuration

1. **Set production environment variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (use production database)
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=strong_production_password
DB_DATABASE=game_prod_db

# JWT Configuration (use strong secret)
JWT_SECRET=your-very-strong-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
```

2. **Security considerations:**
   - Use environment variables, never commit secrets
   - Use strong JWT secret (minimum 32 characters)
   - Enable HTTPS/SSL for all connections
   - Configure CORS for your domain only
   - Use connection pooling for database
   - Enable rate limiting
   - Set up monitoring and logging

3. **Build and deploy:**
```bash
npm run build
npm run migration:run
npm start
```

#### Client Configuration

1. **Create production AuthConfig:**
   - Duplicate `AuthConfig.asset` → `AuthConfig_Production.asset`
   - Configure production server URL: `https://api.yourgame.com`
   - Keep same endpoint paths
   - Adjust timeout if needed for slower connections

2. **Build configuration:**
   - Use build scripts to swap config based on build target
   - Example build script:
   ```csharp
   #if UNITY_EDITOR
   using UnityEditor;
   using UnityEditor.Build;
   using UnityEditor.Build.Reporting;
   
   public class AuthConfigBuildProcessor : IPreprocessBuildWithReport
   {
       public int callbackOrder => 0;
       
       public void OnPreprocessBuild(BuildReport report)
       {
           // Load production config
           var prodConfig = AssetDatabase.LoadAssetAtPath<AuthenticationConfig>(
               "Assets/Resources/AuthConfig_Production.asset"
           );
           
           // Copy to runtime config
           AssetDatabase.CopyAsset(
               "Assets/Resources/AuthConfig_Production.asset",
               "Assets/Resources/AuthConfig.asset"
           );
           
           AssetDatabase.SaveAssets();
       }
   }
   #endif
   ```

3. **Production checklist:**
   - ✓ Use HTTPS URLs only
   - ✓ Disable debug logging
   - ✓ Test token expiration handling
   - ✓ Test network error scenarios
   - ✓ Verify auto-login works correctly
   - ✓ Test on target platforms (iOS, Android, etc.)

---

## Code Examples

### Complete Friend System Integration

#### Server Side

**friends.service.ts:**
```typescript
import { AuthRepository } from '../auth/auth.repository';

export class FriendsService {
  constructor(
    private authRepository: AuthRepository,
    private friendsRepository: FriendsRepository
  ) {}
  
  async sendFriendRequest(senderId: string, targetUserId: string): Promise<FriendRequest> {
    // Verify both users exist using auth repository
    const sender = await this.authRepository.findById(senderId);
    const target = await this.authRepository.findById(targetUserId);
    
    if (!sender || !target) {
      throw new Error('User not found');
    }
    
    // Check privacy settings
    if (!target.privacySettings.allowFriendRequests) {
      throw new Error('User is not accepting friend requests');
    }
    
    // Create friend request
    return await this.friendsRepository.createRequest(senderId, targetUserId);
  }
}
```

**friends.controller.ts:**
```typescript
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
import { FriendsService } from './friends.service';

export class FriendsController {
  private router: Router;
  
  constructor(private friendsService: FriendsService) {
    this.router = Router();
    this.registerRoutes();
  }
  
  private registerRoutes(): void {
    this.router.post('/api/friends/request', 
      AuthMiddleware.authenticate, 
      this.sendRequest.bind(this)
    );
    
    this.router.get('/api/friends', 
      AuthMiddleware.authenticate, 
      this.getFriends.bind(this)
    );
  }
  
  private async sendRequest(req: Request, res: Response): Promise<void> {
    try {
      const senderId = req.user.userId;
      const { targetUserId } = req.body;
      
      const request = await this.friendsService.sendFriendRequest(senderId, targetUserId);
      
      res.json({
        success: true,
        message: 'Friend request sent',
        data: request
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  private async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const friends = await this.friendsService.getFriends(userId);
      
      res.json({
        success: true,
        data: friends
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to load friends'
      });
    }
  }
  
  getRouter(): Router {
    return this.router;
  }
}
```

#### Client Side

**FriendsManager.cs:**
```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using Authentication.Core;

namespace Friends
{
    [Serializable]
    public class Friend
    {
        public string userId;
        public string username;
        public string displayName;
        public int level;
        public string onlineStatus;
    }
    
    [Serializable]
    public class FriendsResponse
    {
        public bool success;
        public List<Friend> data;
    }
    
    [Serializable]
    public class FriendRequestResponse
    {
        public bool success;
        public string message;
    }
    
    public class FriendsManager : MonoBehaviour
    {
        private AuthenticatedAPIClient apiClient;
        private List<Friend> friendsList = new List<Friend>();
        
        public event Action<List<Friend>> OnFriendsLoaded;
        public event Action<string> OnFriendRequestSent;
        public event Action<string> OnError;
        
        private void Start()
        {
            // Check authentication before initializing
            if (!AuthenticationManager.Instance.IsAuthenticated)
            {
                Debug.LogError("FriendsManager: User is not authenticated");
                return;
            }
            
            // Initialize API client
            var config = Resources.Load<AuthenticationConfig>("AuthConfig");
            apiClient = new AuthenticatedAPIClient(config.serverUrl);
            
            // Load friends list
            LoadFriendsAsync();
        }
        
        public async void LoadFriendsAsync()
        {
            try
            {
                var response = await apiClient.GetAsync<FriendsResponse>("/api/friends");
                
                if (response.success)
                {
                    friendsList = response.data;
                    OnFriendsLoaded?.Invoke(friendsList);
                    Debug.Log($"Loaded {friendsList.Count} friends");
                }
                else
                {
                    OnError?.Invoke("Failed to load friends");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"FriendsManager: {ex.Message}");
                OnError?.Invoke(ex.Message);
            }
        }
        
        public async void SendFriendRequestAsync(string targetUserId)
        {
            try
            {
                var requestBody = new { targetUserId };
                var response = await apiClient.PostAsync<FriendRequestResponse>(
                    "/api/friends/request",
                    requestBody
                );
                
                if (response.success)
                {
                    OnFriendRequestSent?.Invoke(response.message);
                    Debug.Log("Friend request sent successfully");
                }
                else
                {
                    OnError?.Invoke(response.message);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"FriendsManager: {ex.Message}");
                OnError?.Invoke(ex.Message);
            }
        }
        
        public List<Friend> GetFriends()
        {
            return new List<Friend>(friendsList);
        }
    }
}
```

---

## Best Practices

### Server Best Practices

1. **Always Validate User Ownership:**
   ```typescript
   // BAD: Trust client-provided userId
   router.post('/api/user/update', async (req, res) => {
     const { userId, data } = req.body;  // ❌ Client can fake userId
     await updateUser(userId, data);
   });
   
   // GOOD: Use authenticated userId from token
   router.post('/api/user/update', AuthMiddleware.authenticate, async (req, res) => {
     const userId = req.user.userId;  // ✓ Verified from JWT
     const { data } = req.body;
     await updateUser(userId, data);
   });
   ```

2. **Implement Rate Limiting:**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   router.use('/api/', apiLimiter);
   ```

3. **Log Security Events:**
   ```typescript
   router.post('/api/sensitive-action', AuthMiddleware.authenticate, async (req, res) => {
     logger.info('Sensitive action performed', {
       userId: req.user.userId,
       username: req.user.username,
       action: 'sensitive-action',
       timestamp: new Date().toISOString()
     });
     
     // Perform action
   });
   ```

4. **Handle Token Expiration Gracefully:**
   ```typescript
   // In your error handler middleware
   app.use((err, req, res, next) => {
     if (err.name === 'TokenExpiredError') {
       res.status(401).json({
         success: false,
         message: 'Token expired',
         code: 'TOKEN_EXPIRED'
       });
     } else {
       next(err);
     }
   });
   ```

5. **Use TypeScript Types:**
   ```typescript
   // Define request type with user
   interface AuthenticatedRequest extends Request {
     user: {
       userId: string;
       username: string;
     };
   }
   
   // Use in handlers
   router.get('/api/profile', 
     AuthMiddleware.authenticate, 
     async (req: AuthenticatedRequest, res: Response) => {
       const userId = req.user.userId;  // Type-safe
     }
   );
   ```

### Client Best Practices

1. **Always Check Authentication Before API Calls:**
   ```csharp
   public async void LoadData()
   {
       if (!AuthenticationManager.Instance.IsAuthenticated)
       {
           Debug.LogWarning("User not authenticated");
           ShowLoginPrompt();
           return;
       }
       
       // Proceed with API call
   }
   ```

2. **Handle Token Expiration:**
   ```csharp
   private async Task<T> MakeAuthenticatedRequest<T>(string endpoint)
   {
       try
       {
           return await apiClient.GetAsync<T>(endpoint);
       }
       catch (Exception ex)
       {
           if (ex.Message.Contains("Session expired"))
           {
               // Show re-login dialog
               ShowReLoginDialog();
           }
           throw;
       }
   }
   ```

3. **Subscribe and Unsubscribe to Events:**
   ```csharp
   private void OnEnable()
   {
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
   ```

4. **Use Async/Await Properly:**
   ```csharp
   // BAD: Blocking the main thread
   public void LoadData()
   {
       var result = LoadDataAsync().Result;  // ❌ Blocks Unity
   }
   
   // GOOD: Async all the way
   public async void LoadData()
   {
       var result = await LoadDataAsync();  // ✓ Non-blocking
   }
   ```

5. **Cache Data Appropriately:**
   ```csharp
   public class DataManager : MonoBehaviour
   {
       private List<Friend> cachedFriends;
       private DateTime lastFetchTime;
       private readonly TimeSpan cacheExpiry = TimeSpan.FromMinutes(5);
       
       public async Task<List<Friend>> GetFriends(bool forceRefresh = false)
       {
           if (!forceRefresh && 
               cachedFriends != null && 
               DateTime.Now - lastFetchTime < cacheExpiry)
           {
               return cachedFriends;
           }
           
           cachedFriends = await FetchFriendsFromServer();
           lastFetchTime = DateTime.Now;
           return cachedFriends;
       }
   }
   ```

6. **Provide User Feedback:**
   ```csharp
   public async void PerformAction()
   {
       ShowLoadingIndicator(true);
       
       try
       {
           await apiClient.PostAsync<Response>("/api/action", data);
           ShowSuccessMessage("Action completed successfully");
       }
       catch (Exception ex)
       {
           ShowErrorMessage($"Failed: {ex.Message}");
       }
       finally
       {
           ShowLoadingIndicator(false);
       }
   }
   ```

---

## Troubleshooting

### Common Server Issues

#### Issue: "Authorization header missing"

**Cause:** Client not sending Authorization header

**Solution:**
```typescript
// Verify middleware is applied
router.get('/api/protected', AuthMiddleware.authenticate, handler);

// Check client is sending header
request.SetRequestHeader("Authorization", $"Bearer {token}");
```

#### Issue: "Invalid authorization header format"

**Cause:** Header not in "Bearer <token>" format

**Solution:**
```csharp
// Correct format
request.SetRequestHeader("Authorization", $"Bearer {token}");

// NOT this
request.SetRequestHeader("Authorization", token);  // ❌ Missing "Bearer "
```

#### Issue: "Token verification failed"

**Possible Causes:**
1. Token expired (24 hours default)
2. JWT_SECRET mismatch between environments
3. Token corrupted during storage/transmission

**Solutions:**
```typescript
// Check JWT_SECRET is consistent
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

// Verify token expiration
const payload = JwtUtil.decodeToken(token);
console.log('Token expires at:', new Date(payload.exp * 1000));

// Check token format
console.log('Token parts:', token.split('.').length); // Should be 3
```

#### Issue: Database connection errors

**Solution:**
```bash
# Verify database is running
psql -h localhost -U postgres -d game_db

# Check environment variables
echo $DB_HOST
echo $DB_PORT
echo $DB_DATABASE

# Test connection in code
npm run migration:show
```

### Common Client Issues

#### Issue: "User is not authenticated" when they should be

**Cause:** Token not properly stored or retrieved

**Solution:**
```csharp
// Debug token storage
TokenStorage storage = new TokenStorage();
Debug.Log($"Has token: {storage.HasToken()}");
Debug.Log($"Token: {storage.GetToken()}");
Debug.Log($"UserId: {storage.GetUserId()}");

// Verify AuthenticationManager state
Debug.Log($"IsAuthenticated: {AuthenticationManager.Instance.IsAuthenticated}");
```

#### Issue: API calls fail with network errors

**Possible Causes:**
1. Server not running
2. Wrong server URL in config
3. CORS issues
4. Firewall blocking connection

**Solutions:**
```csharp
// Verify server URL
var config = Resources.Load<AuthenticationConfig>("AuthConfig");
Debug.Log($"Server URL: {config.serverUrl}");

// Test server connectivity
curl http://localhost:3000/api/auth/validate

// Check Unity console for detailed errors
Debug.Log($"Request error: {request.error}");
Debug.Log($"Response code: {request.responseCode}");
```

#### Issue: AuthenticationManager.Instance is null

**Cause:** AuthenticationManager not in scene or destroyed

**Solution:**
```csharp
// Ensure AuthenticationManager is in the scene
// Check it's marked as DontDestroyOnLoad
// Verify no duplicate instances are being destroyed

// Safe access pattern
if (AuthenticationManager.Instance == null)
{
    Debug.LogError("AuthenticationManager not found in scene");
    return;
}
```

#### Issue: Token expires too quickly

**Cause:** System time incorrect or token expiration too short

**Solution:**
```typescript
// Server: Adjust token expiration in .env
JWT_EXPIRES_IN=24h  // or 7d for 7 days

// Client: Handle expiration gracefully
private async Task<T> RetryWithReauth<T>(Func<Task<T>> apiCall)
{
    try
    {
        return await apiCall();
    }
    catch (Exception ex)
    {
        if (ex.Message.Contains("expired"))
        {
            // Prompt user to re-login
            await ShowReLoginDialog();
            return await apiCall();  // Retry with new token
        }
        throw;
    }
}
```

### Performance Issues

#### Server: Slow database queries

**Solution:**
```typescript
// Ensure indexes exist
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(online_status);

// Use connection pooling
// TypeORM handles this automatically, but verify config:
{
  type: 'postgres',
  extra: {
    max: 20,  // Maximum pool size
    min: 5    // Minimum pool size
  }
}
```

#### Client: UI freezing during API calls

**Solution:**
```csharp
// Always use async/await
public async void LoadData()
{
    await apiClient.GetAsync<Data>("/api/data");  // ✓ Non-blocking
}

// NOT this
public void LoadData()
{
    var data = apiClient.GetAsync<Data>("/api/data").Result;  // ❌ Blocks
}
```

---

## Additional Resources

### Documentation
- [Requirements Document](./requirements.md) - Feature requirements and acceptance criteria
- [Design Document](./design.md) - System architecture and component design
- [Tasks Document](./tasks.md) - Implementation task list
- [Server README](../../Server/README.md) - Server setup and configuration
- [Client Tests README](../../Client/Assets/Supermeo/Scripts/Modules/Authentication/Tests/README.md) - Testing guide

### API Reference

**Server Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/validate` - Validate token (protected)

**Client Classes:**
- `AuthenticationManager` - Main authentication manager singleton
- `AuthenticationConfig` - Configuration ScriptableObject
- `TokenStorage` - Token storage utility
- `AuthAPI` - HTTP API client

### Support

For issues or questions:
1. Check this integration guide
2. Review the design document
3. Check server/client logs for errors
4. Verify environment configuration
5. Test with provided examples

---

**Last Updated:** 2024
**Version:** 1.0
