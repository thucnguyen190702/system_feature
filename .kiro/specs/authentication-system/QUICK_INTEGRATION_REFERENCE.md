# Quick Integration Reference

Quick reference for integrating the Authentication System into your modules.

## Server: Protect an Endpoint (3 steps)

```typescript
// 1. Import middleware
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';

// 2. Apply to route
router.get('/api/your-endpoint', 
  AuthMiddleware.authenticate,  // Add this
  yourHandler
);

// 3. Access user data
async function yourHandler(req: Request, res: Response) {
  const userId = req.user.userId;      // Authenticated user ID
  const username = req.user.username;  // Authenticated username
  
  // Your logic here
}
```

## Client: Make Authenticated API Call (4 steps)

```csharp
// 1. Check authentication
if (!AuthenticationManager.Instance.IsAuthenticated) {
    return;
}

// 2. Get token
TokenStorage storage = new TokenStorage();
string token = storage.GetToken();

// 3. Create request with Authorization header
UnityWebRequest request = UnityWebRequest.Get(url);
request.SetRequestHeader("Authorization", $"Bearer {token}");

// 4. Send request
yield return request.SendWebRequest();
```

## Client: Listen to Auth State Changes

```csharp
private void OnEnable()
{
    AuthenticationManager.Instance.OnAuthenticationChanged += HandleAuthChanged;
}

private void OnDisable()
{
    AuthenticationManager.Instance.OnAuthenticationChanged -= HandleAuthChanged;
}

private void HandleAuthChanged(bool isAuthenticated)
{
    if (isAuthenticated) {
        // User logged in
    } else {
        // User logged out
    }
}
```

## Environment Setup

**Server (.env):**
```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
```

**Client (AuthConfig asset):**
- Server URL: `http://localhost:3000` (dev) or `https://api.yourgame.com` (prod)
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/validate`

## Common Patterns

### Server: Get User Profile
```typescript
router.get('/api/profile', AuthMiddleware.authenticate, async (req, res) => {
  const user = await userRepository.findById(req.user.userId);
  res.json({ success: true, data: user });
});
```

### Client: Reusable API Client
```csharp
public class AuthenticatedAPIClient
{
    public async Task<T> GetAsync<T>(string endpoint)
    {
        if (!AuthenticationManager.Instance.IsAuthenticated)
            throw new Exception("Not authenticated");
            
        string token = new TokenStorage().GetToken();
        // ... make request with Authorization header
    }
}
```

## Error Handling

**Server returns 401?**
- Token expired → Client should logout and prompt re-login
- Token invalid → Client should clear token and show login

**Client can't connect?**
- Check server is running
- Verify server URL in AuthConfig
- Check firewall/CORS settings

---

For detailed documentation, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
