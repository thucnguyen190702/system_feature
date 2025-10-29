# Design Document - Authentication System

## Overview

Hệ thống xác thực được thiết kế theo kiến trúc modular monolith cho server và modular packaging cho Unity client. Server sử dụng Node.js với TypeScript, database PostgreSQL, và JWT cho session management. Client Unity được tổ chức thành các module độc lập, dễ bảo trì và mở rộng.

### Technology Stack

**Server:**
- Runtime: Node.js 18+
- Language: TypeScript 5+
- Framework: Express.js
- Database: PostgreSQL 14+
- ORM: TypeORM
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcrypt
- Validation: class-validator, class-transformer

**Client:**
- Engine: Unity 2021.3+
- Language: C#
- HTTP Client: UnityWebRequest
- JSON: Newtonsoft.Json (Unity built-in)
- Architecture: Module-based với ScriptableObject configuration

## Architecture

### Server Architecture - Modular Monolith

Server được tổ chức theo modular monolith pattern với các module độc lập nhưng chạy trong cùng một process:

```
server/
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.module.ts          # Module entry point
│   │       ├── auth.controller.ts      # HTTP endpoints
│   │       ├── auth.service.ts         # Business logic
│   │       ├── auth.repository.ts      # Data access
│   │       ├── entities/
│   │       │   └── user.entity.ts      # TypeORM entity
│   │       ├── dto/
│   │       │   ├── register.dto.ts     # Request DTOs
│   │       │   ├── login.dto.ts
│   │       │   └── auth-response.dto.ts
│   │       ├── middleware/
│   │       │   └── auth.middleware.ts  # JWT validation
│   │       └── types/
│   │           └── jwt-payload.ts
│   ├── shared/
│   │   ├── database/
│   │   │   └── database.config.ts      # PostgreSQL config
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   └── password.util.ts
│   │   └── types/
│   │       └── express.d.ts            # Type extensions
│   ├── config/
│   │   └── environment.ts              # Environment variables
│   └── app.ts                          # Application entry
└── package.json
```

### Client Architecture - Modular Unity

Client được tổ chức theo module pattern với Assembly Definitions:

```
Assets/
└── Modules/
    └── Authentication/
        ├── Authentication.asmdef
        ├── Runtime/
        │   ├── Core/
        │   │   ├── AuthenticationManager.cs    # Singleton manager
        │   │   ├── AuthenticationConfig.cs     # ScriptableObject config
        │   │   └── TokenStorage.cs             # Secure token storage
        │   ├── API/
        │   │   ├── AuthAPI.cs                  # HTTP client wrapper
        │   │   ├── Models/
        │   │   │   ├── RegisterRequest.cs
        │   │   │   ├── LoginRequest.cs
        │   │   │   └── AuthResponse.cs
        │   │   └── Responses/
        │   │       └── ErrorResponse.cs
        │   └── UI/
        │       ├── AuthenticationUI.cs         # Main UI controller
        │       ├── LoginPanel.cs
        │       ├── RegisterPanel.cs
        │       └── LoadingIndicator.cs
        └── Resources/
            └── AuthConfig.asset                # Configuration asset
```

## Components and Interfaces

### Server Components

#### 1. Auth Module

**auth.module.ts**
```typescript
export class AuthModule {
  controller: AuthController;
  service: AuthService;
  repository: AuthRepository;
  
  initialize(app: Express): void;
  registerRoutes(): void;
}
```

**auth.controller.ts**
```typescript
export class AuthController {
  constructor(private authService: AuthService);
  
  // POST /api/auth/register
  async register(req: Request, res: Response): Promise<void>;
  
  // POST /api/auth/login
  async login(req: Request, res: Response): Promise<void>;
  
  // GET /api/auth/validate (protected)
  async validateToken(req: Request, res: Response): Promise<void>;
}
```

**auth.service.ts**
```typescript
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private passwordUtil: PasswordUtil,
    private jwtUtil: JwtUtil
  );
  
  async register(dto: RegisterDto): Promise<AuthResponseDto>;
  async login(dto: LoginDto): Promise<AuthResponseDto>;
  async validateToken(token: string): Promise<JwtPayload>;
  
  private async validateUsername(username: string): Promise<void>;
  private async validatePassword(password: string): Promise<void>;
}
```

**auth.repository.ts**
```typescript
export class AuthRepository {
  constructor(private dataSource: DataSource);
  
  async createUser(data: CreateUserData): Promise<User>;
  async findByUsername(username: string): Promise<User | null>;
  async findById(id: string): Promise<User | null>;
  async usernameExists(username: string): Promise<boolean>;
}

interface CreateUserData {
  username: string;
  passwordHash: string;
  displayName?: string;
  level?: number;
  onlineStatus?: string;
  privacySettings?: object;
}
```

#### 2. Entities

**user.entity.ts**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // Authentication fields
  @Column({ unique: true, length: 50 })
  username: string;
  
  @Column()
  passwordHash: string;
  
  // Profile fields (for friend system and other features)
  @Column({ nullable: true, length: 100 })
  displayName?: string;
  
  @Column({ nullable: true })
  avatarUrl?: string;
  
  @Column({ default: 1 })
  level: number;
  
  // Status fields
  @Column({ default: 'offline', length: 20 })
  onlineStatus: string;
  
  @Column({ nullable: true })
  lastOnlineAt?: Date;
  
  // Privacy settings
  @Column({ 
    type: 'jsonb', 
    default: { 
      allowFriendRequests: true, 
      showOnlineStatus: true, 
      showLevel: true 
    } 
  })
  privacySettings: {
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
    showLevel: boolean;
  };
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 3. DTOs

**register.dto.ts**
```typescript
export class RegisterDto {
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9]+$/)
  username: string;
  
  @IsString()
  @MinLength(6)
  password: string;
  
  @IsString()
  @IsOptional()
  @Length(1, 100)
  displayName?: string;
}
```

**login.dto.ts**
```typescript
export class LoginDto {
  @IsString()
  username: string;
  
  @IsString()
  password: string;
}
```

**auth-response.dto.ts**
```typescript
export class AuthResponseDto {
  success: boolean;
  token?: string;
  userId?: string;
  username?: string;
  message?: string;
}
```

#### 4. Middleware

**auth.middleware.ts**
```typescript
export class AuthMiddleware {
  constructor(private jwtUtil: JwtUtil);
  
  authenticate(req: Request, res: Response, next: NextFunction): void;
}
```

#### 5. Utilities

**jwt.util.ts**
```typescript
export class JwtUtil {
  private secret: string;
  private expiresIn: string = '24h';
  
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
  decodeToken(token: string): JwtPayload | null;
}
```

**password.util.ts**
```typescript
export class PasswordUtil {
  private saltRounds: number = 10;
  
  async hash(password: string): Promise<string>;
  async compare(password: string, hash: string): Promise<boolean>;
}
```

### Client Components

#### 1. Core Components

**AuthenticationManager.cs**
```csharp
public class AuthenticationManager : MonoBehaviour
{
    public static AuthenticationManager Instance { get; private set; }
    
    private AuthenticationConfig config;
    private TokenStorage tokenStorage;
    private AuthAPI authAPI;
    
    public bool IsAuthenticated { get; private set; }
    public string CurrentUserId { get; private set; }
    public string CurrentUsername { get; private set; }
    
    public async Task<AuthResult> RegisterAsync(string username, string password);
    public async Task<AuthResult> LoginAsync(string username, string password);
    public async Task<bool> ValidateStoredTokenAsync();
    public void Logout();
    
    private void OnApplicationQuit();
}
```

**AuthenticationConfig.cs**
```csharp
[CreateAssetMenu(fileName = "AuthConfig", menuName = "Authentication/Config")]
public class AuthenticationConfig : ScriptableObject
{
    [Header("Server Settings")]
    public string serverUrl = "http://localhost:3000";
    public string registerEndpoint = "/api/auth/register";
    public string loginEndpoint = "/api/auth/login";
    public string validateEndpoint = "/api/auth/validate";
    
    [Header("Validation")]
    public int minUsernameLength = 3;
    public int maxUsernameLength = 50;
    public int minPasswordLength = 6;
    
    [Header("Timeout")]
    public int requestTimeoutSeconds = 10;
}
```

**TokenStorage.cs**
```csharp
public class TokenStorage
{
    private const string TOKEN_KEY = "auth_token";
    private const string USER_ID_KEY = "user_id";
    private const string USERNAME_KEY = "username";
    
    public void SaveToken(string token, string userId, string username);
    public string GetToken();
    public string GetUserId();
    public string GetUsername();
    public bool HasToken();
    public void ClearToken();
}
```

#### 2. API Layer

**AuthAPI.cs**
```csharp
public class AuthAPI
{
    private readonly AuthenticationConfig config;
    private readonly string authorizationHeader = "Authorization";
    
    public AuthAPI(AuthenticationConfig config);
    
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request);
    public async Task<AuthResponse> LoginAsync(LoginRequest request);
    public async Task<bool> ValidateTokenAsync(string token);
    
    private async Task<T> SendRequestAsync<T>(
        string endpoint, 
        string method, 
        object body = null, 
        string token = null
    );
    
    private void SetAuthorizationHeader(UnityWebRequest request, string token);
}
```

#### 3. Models

**RegisterRequest.cs**
```csharp
[Serializable]
public class RegisterRequest
{
    public string username;
    public string password;
}
```

**LoginRequest.cs**
```csharp
[Serializable]
public class LoginRequest
{
    public string username;
    public string password;
}
```

**AuthResponse.cs**
```csharp
[Serializable]
public class AuthResponse
{
    public bool success;
    public string token;
    public string userId;
    public string username;
    public string message;
}
```

**AuthResult.cs**
```csharp
public class AuthResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string Token { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }
}
```

#### 4. UI Components

**AuthenticationUI.cs**
```csharp
public class AuthenticationUI : MonoBehaviour
{
    [SerializeField] private LoginPanel loginPanel;
    [SerializeField] private RegisterPanel registerPanel;
    [SerializeField] private LoadingIndicator loadingIndicator;
    [SerializeField] private Text errorText;
    
    private AuthenticationManager authManager;
    
    public void ShowLogin();
    public void ShowRegister();
    public void ShowLoading(bool show);
    public void ShowError(string message);
    public void OnLoginSuccess();
    
    private void Start();
}
```

**LoginPanel.cs**
```csharp
public class LoginPanel : MonoBehaviour
{
    [SerializeField] private InputField usernameInput;
    [SerializeField] private InputField passwordInput;
    [SerializeField] private Button loginButton;
    [SerializeField] private Button switchToRegisterButton;
    
    public event Action<string, string> OnLoginClicked;
    public event Action OnSwitchToRegister;
    
    public void SetInteractable(bool interactable);
    public void Clear();
    
    private void Start();
    private void OnLoginButtonClicked();
}
```

**RegisterPanel.cs**
```csharp
public class RegisterPanel : MonoBehaviour
{
    [SerializeField] private InputField usernameInput;
    [SerializeField] private InputField passwordInput;
    [SerializeField] private InputField confirmPasswordInput;
    [SerializeField] private Button registerButton;
    [SerializeField] private Button switchToLoginButton;
    
    public event Action<string, string> OnRegisterClicked;
    public event Action OnSwitchToLogin;
    
    public void SetInteractable(bool interactable);
    public void Clear();
    public bool ValidateInputs(out string error);
    
    private void Start();
    private void OnRegisterButtonClicked();
}
```

## Data Models

### Database Schema

**users table (Unified schema for authentication and profile)**
```sql
CREATE TABLE users (
    -- Authentication fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile fields (for friend system and other features)
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    
    -- Status fields
    online_status VARCHAR(20) DEFAULT 'offline',
    last_online_at TIMESTAMP,
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "allowFriendRequests": true,
        "showOnlineStatus": true,
        "showLevel": true
    }',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT valid_status CHECK (online_status IN ('online', 'offline', 'away', 'busy'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(online_status);
```

**Note:** This unified schema supports both authentication and social features (friend system, etc.). Profile fields are nullable to allow gradual population after registration.

### JWT Payload Structure

```typescript
interface JwtPayload {
  userId: string;
  username: string;
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### API Request/Response Formats

**POST /api/auth/register**
```json
Request:
{
  "username": "player123",
  "password": "securepass"
}

Response (Success):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123"
}

Response (Error):
{
  "success": false,
  "message": "Username already exists"
}
```

**POST /api/auth/login**
```json
Request:
{
  "username": "player123",
  "password": "securepass"
}

Response (Success):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123"
}

Response (Error):
{
  "success": false,
  "message": "Invalid credentials"
}
```

**GET /api/auth/validate**
```json
Request Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (Success):
{
  "success": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123"
}

Response (Error):
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Error Handling

### Server Error Handling

**Error Categories:**

1. **Validation Errors (400 Bad Request)**
   - Username length invalid
   - Password too short
   - Invalid characters in username
   - Missing required fields

2. **Authentication Errors (401 Unauthorized)**
   - Invalid credentials (generic message)
   - Token expired
   - Token invalid
   - Token missing

3. **Conflict Errors (409 Conflict)**
   - Username already exists

4. **Server Errors (500 Internal Server Error)**
   - Database connection failed
   - Unexpected errors

**Error Response Format:**
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;  // Error code for client handling
}
```

**Error Handling Strategy:**
- Use try-catch blocks in all async operations
- Log detailed errors server-side with stack traces
- Return generic error messages to prevent information leakage
- Use specific error codes for client-side handling
- Never expose password hashes or sensitive data in errors

### Client Error Handling

**Error Categories:**

1. **Network Errors**
   - Connection timeout
   - No internet connection
   - Server unreachable

2. **Validation Errors**
   - Client-side validation before API call
   - Display specific field errors

3. **API Errors**
   - Parse server error response
   - Display user-friendly messages

**Error Handling Strategy:**
```csharp
public class ErrorHandler
{
    public static string GetUserFriendlyMessage(string errorCode)
    {
        return errorCode switch
        {
            "USERNAME_EXISTS" => "Username is already taken",
            "INVALID_CREDENTIALS" => "Invalid username or password",
            "TOKEN_EXPIRED" => "Session expired. Please login again",
            "NETWORK_ERROR" => "Connection error. Please check your internet",
            _ => "An error occurred. Please try again"
        };
    }
}
```

## Security Considerations

### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Never store plain text passwords
- Never log passwords
- Never return password hashes in API responses
- Use secure password comparison (bcrypt.compare)

### Token Security
- JWT tokens signed with secret key (stored in environment variable)
- Token expiration: 24 hours
- Tokens stored securely on client (PlayerPrefs with encryption consideration)
- Token included in Authorization header: `Bearer <token>`
- Token validation on every protected endpoint

### API Security
- Input validation on all endpoints
- CORS configuration for allowed origins
- HTTPS in production
- SQL injection prevention (TypeORM parameterized queries)

### Client Security
- Validate inputs before sending to server
- Clear sensitive data on logout
- Handle token expiration gracefully
- Don't log sensitive information

## Testing Strategy

### Server Testing

**Unit Tests:**
- AuthService: register, login, token validation logic
- PasswordUtil: hash and compare functions
- JwtUtil: token generation and verification
- AuthRepository: database operations (with test database)

**Integration Tests:**
- Full registration flow
- Full login flow
- Token validation middleware
- Error handling scenarios

**Test Tools:**
- Jest for unit and integration tests
- Supertest for API endpoint testing
- Test database with Docker

**Test Coverage Goals:**
- Business logic: 90%+
- API endpoints: 100%
- Error scenarios: 100%

### Client Testing

**Play Mode Tests:**
- AuthenticationManager initialization
- Token storage and retrieval
- API request/response handling
- UI state transitions

**Manual Testing:**
- Registration flow with valid/invalid inputs
- Login flow with valid/invalid credentials
- Session persistence across game restarts
- Error message display
- Loading indicators
- Scene transitions

**Test Scenarios:**
- New user registration
- Existing user login
- Invalid credentials
- Network errors
- Token expiration
- Logout and re-login

## Performance Considerations

### Server Performance
- Database connection pooling
- Index on username column for fast lookups
- Async/await for non-blocking operations
- Response compression

### Client Performance
- Async/await for API calls (non-blocking)
- Timeout handling (10 seconds default)
- Minimal UI updates during loading
- Token validation only on app start (not every frame)

## Deployment Considerations

### Server Deployment
- Environment variables for configuration
- Database migrations with TypeORM
- Health check endpoint
- Logging with Winston or similar
- Process manager (PM2)

### Client Deployment
- Configuration via ScriptableObject (no hardcoded URLs)
- Different configs for development/production
- Build-time environment selection


## Module Dependencies

### Server Module Dependencies
```
auth module
├── depends on: shared/database
├── depends on: shared/utils
└── provides: auth.middleware (for other modules)
```

### Client Module Dependencies
```
Authentication module
├── depends on: Unity core (UnityEngine, UnityEngine.UI)
├── depends on: Newtonsoft.Json
└── provides: AuthenticationManager (for other modules)
```

## Integration Points

### For Other Modules

**Server:**
```typescript
// Other modules can use auth middleware
import { authMiddleware } from './modules/auth/middleware/auth.middleware';

router.get('/protected-endpoint', authMiddleware.authenticate, handler);

// Access authenticated user
req.user.userId;
req.user.username;
```

**Client:**
```csharp
// Other modules can check authentication status
if (AuthenticationManager.Instance.IsAuthenticated)
{
    string userId = AuthenticationManager.Instance.CurrentUserId;
    // Make authenticated API calls
}

// Other modules can listen to auth events
AuthenticationManager.Instance.OnAuthenticationChanged += HandleAuthChange;
```

