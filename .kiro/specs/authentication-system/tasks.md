# Implementation Plan - Authentication System

## Server Implementation (Node.js TypeScript)

- [x] 1. Setup project structure and dependencies





  - Initialize Node.js project with TypeScript configuration
  - Install dependencies: express, typeorm, pg, jsonwebtoken, bcrypt, class-validator, class-transformer
  - Create modular monolith folder structure (modules/auth, shared, config)
  - Setup TypeScript compiler options and build scripts
  - _Requirements: All requirements need proper project foundation_
- [x] 2. Configure database and shared utilities




- [ ] 2. Configure database and shared utilities

  - [x] 2.1 Setup PostgreSQL connection with TypeORM


    - Create database configuration file with connection settings
    - Configure TypeORM DataSource with PostgreSQL driver
    - Setup environment variables for database credentials
    - _Requirements: 1.5, 2.1_
  

  - [x] 2.2 Create User entity with TypeORM (unified schema)

    - Define User entity with authentication fields: id (UUID), username (max 50 chars), passwordHash
    - Add profile fields: displayName, avatarUrl, level (default 1)
    - Add status fields: onlineStatus (default 'offline'), lastOnlineAt
    - Add privacySettings (JSONB with default values)
    - Add unique constraint on username column and timestamps
    - Configure entity decorators for PostgreSQL
    - _Requirements: 1.1, 1.3, 1.5_
    - _Note: This unified schema supports both authentication and social features (friend system)_
  
  - [x] 2.3 Implement password utility with bcrypt


    - Create PasswordUtil class with hash method (10 salt rounds)
    - Implement compare method for password verification
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 2.4 Implement JWT utility


    - Create JwtUtil class with generateToken method
    - Implement verifyToken method with signature validation
    - Implement decodeToken method for payload extraction
    - Configure 24-hour token expiration
    - _Requirements: 2.3, 4.1, 4.4, 4.5_

- [x] 3. Implement Auth Repository layer





  - [x] 3.1 Create AuthRepository class


    - Implement createUser method to insert new user with hashed password and default profile values
    - Set displayName to username if not provided
    - Set default level to 1, onlineStatus to 'offline'
    - Set default privacySettings (allowFriendRequests: true, showOnlineStatus: true, showLevel: true)
    - Implement findByUsername method for login lookup
    - Implement findById method for token validation
    - Implement usernameExists method for registration validation
    - _Requirements: 1.1, 1.5, 2.1_

- [x] 4. Implement Auth Service layer





  - [x] 4.1 Create registration service logic


    - Implement validateUsername method (3-50 alphanumeric characters)
    - Implement validatePassword method (minimum 6 characters)
    - Implement register method: validate inputs, check username exists, hash password, create user with default profile, generate token
    - Set displayName to username if not provided in request
    - Return AuthResponseDto with token, userId, username
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 2.4_
  
  - [x] 4.2 Create login service logic

    - Implement login method: find user by username, compare password, generate token
    - Return generic error for invalid credentials (prevent username enumeration)
    - Return AuthResponseDto with token, userId, username on success
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.2_
  
  - [x] 4.3 Create token validation service logic

    - Implement validateToken method using JwtUtil
    - Extract and return JwtPayload from valid token
    - Throw error for invalid or expired tokens
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Create DTOs with validation




  - [x] 5.1 Create RegisterDto


    - Add username field with @Length(3, 50) and @Matches alphanumeric validation
    - Add password field with @MinLength(6) validation
    - Add optional displayName field with @Length(1, 100) validation
    - _Requirements: 1.3, 1.4_
  
  - [x] 5.2 Create LoginDto


    - Add username and password fields with @IsString validation
    - _Requirements: 2.1_
  
  - [x] 5.3 Create AuthResponseDto



    - Define success, token, userId, username, message fields
    - _Requirements: 1.1, 2.3, 2.4_
-

- [x] 6. Implement Auth Controller



  - [x] 6.1 Create register endpoint


    - Implement POST /api/auth/register handler
    - Validate request body with RegisterDto
    - Call AuthService.register method
    - Return 201 on success, 400 on validation error, 409 on username conflict
    - Handle errors and return appropriate error responses
    - _Requirements: 1.1, 1.2, 7.1_
  

  - [ ] 6.2 Create login endpoint
    - Implement POST /api/auth/login handler
    - Validate request body with LoginDto
    - Call AuthService.login method
    - Return 200 on success, 401 on invalid credentials
    - Handle errors and return appropriate error responses
    - _Requirements: 2.1, 2.2, 7.2_

  
  - [ ] 6.3 Create token validation endpoint
    - Implement GET /api/auth/validate handler (protected)
    - Extract token from Authorization header
    - Call AuthService.validateToken method




    - Return 200 with user info on success, 401 on invalid token
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Implement authentication middleware

  - Create AuthMiddleware with authenticate method
  - Extract token from Authorization header (Bearer format)
  - Verify token using JwtUtil
  - Attach user info (userId, username) to request object
  - Return 401 if token is missing, invalid, or expired
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Create Auth Module and wire everything together





  - Create AuthModule class to initialize all components
  - Register routes with Express app
  - Apply validation middleware to endpoints
  - Setup error handling middleware
  - Create main app.ts to bootstrap server
  - _Requirements: All requirements_
- [x] 9. Setup database migrations




- [ ] 9. Setup database migrations

  - Create initial migration for unified users table with all fields
  - Add username index and online_status index for performance
  - Add constraints for username length and valid online status
  - Configure migration scripts in package.json
  - _Requirements: 1.5_
  - _Note: This migration creates the foundation for both authentication and friend system_


- [x] 10. Add logging and error handling



  - Setup Winston logger for server-side logging
  - Log errors with stack traces (never log passwords)
  - Implement global error handler middleware
  - Return generic error messages to client (500 status)
  - _Requirements: 6.4, 7.1, 7.2, 7.5_

- [x] 10.1 Write server integration tests


  - Test registration flow with valid and invalid inputs
  - Test login flow with valid and invalid credentials
  - Test token validation with valid, expired, and invalid tokens
  - Test error responses and status codes
  - _Requirements: All requirements_

## Client Implementation (Unity C#)




- [x] 11. Setup Unity module structure






  - Create Assets/Modules/Authentication folder
  - Create Authentication.asmdef for module isolation
  - Create Runtime folder with Core, API, UI subfolders
  - Create Resources folder for configuration assets
  - _Requirements: All requirements need proper module foundation_
-

- [x] 12. Create configuration and storage components



  - [x] 12.1 Create AuthenticationConfig ScriptableObject


    - Add server URL and endpoint paths (register, login, validate)
    - Add validation settings (username length 3-50, password length)
    - Add timeout settings (10 seconds default)
    - Create AuthConfig.asset in Resources folder
    - _Requirements: 1.3, 1.4, 5.1, 5.2_
  
  - [x] 12.2 Create TokenStorage class


    - Implement SaveToken method to store token, userId, username in PlayerPrefs
    - Implement GetToken, GetUserId, GetUsername methods
    - Implement HasToken method to check token existence
    - Implement ClearToken method to remove all stored data
    - _Requirements: 2.5, 3.1, 3.5_




- [x] 13. Create API models



  - [ ] 13.1 Create request models
    - Create RegisterRequest class with username and password fields
    - Create LoginRequest class with username and password fields


    - Add [Serializable] attribute for JSON serialization
    - _Requirements: 1.1, 2.1_
  



  - [x] 13.2 Create response models


    - Create AuthResponse class with success, token, userId, username, message fields
    - Create AuthResult class for internal use with Success, Message, Token, UserId, Username properties
    - Create ErrorResponse class for error handling
    - Add [Serializable] attribute for JSON serialization
    - _Requirements: 1.1, 2.3, 2.4, 7.1, 7.2, 7.3_



- [x] 14. Implement AuthAPI class





  - [x] 14.1 Create HTTP request wrapper


    - Create AuthAPI class with AuthenticationConfig dependency
    - Implement SendRequestAsync generic method using UnityWebRequest


    - Add JSON serialization/deserialization with JsonUtility
    - Add Authorization header support for authenticated requests
    - Implement timeout handling (10 seconds)
    - _Requirements: 2.5, 3.4, 5.3_
  


  - [x] 14.2 Implement registration API call


    - Create RegisterAsync method that sends POST to /api/auth/register
    - Serialize RegisterRequest to JSON
    - Deserialize AuthResponse from JSON
    - Handle network errors and return error response
    - _Requirements: 1.1, 7.3_
  
  - [x] 14.3 Implement login API call


    - Create LoginAsync method that sends POST to /api/auth/login
    - Serialize LoginRequest to JSON
    - Deserialize AuthResponse from JSON
    - Handle network errors and return error response
    - _Requirements: 2.1, 7.3_
  
  - [x] 14.4 Implement token validation API call


    - Create ValidateTokenAsync method that sends GET to /api/auth/validate
    - Include token in Authorization header
    - Return true if token is valid, false otherwise
    - Handle 401 errors gracefully
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_
-

- [x] 15. Implement AuthenticationManager




  - [x] 15.1 Create singleton manager


    - Create AuthenticationManager MonoBehaviour with singleton pattern
    - Initialize AuthenticationConfig, TokenStorage, AuthAPI in Awake
    - Add IsAuthenticated, CurrentUserId, CurrentUsername properties
    - Implement DontDestroyOnLoad for persistence
    - _Requirements: 3.1, 3.2_
  
  - [x] 15.2 Implement registration flow

    - Create RegisterAsync method with username and password parameters
    - Validate inputs against config settings (client-side validation)
    - Call AuthAPI.RegisterAsync
    - Save token on success using TokenStorage
    - Update IsAuthenticated, CurrentUserId, CurrentUsername properties
    - Return AuthResult with success status and message
    - _Requirements: 1.1, 1.3, 1.4, 2.5, 7.1, 7.4_
  
  - [x] 15.3 Implement login flow

    - Create LoginAsync method with username and password parameters
    - Call AuthAPI.LoginAsync
    - Save token on success using TokenStorage
    - Update IsAuthenticated, CurrentUserId, CurrentUsername properties
    - Return AuthResult with success status and message
    - _Requirements: 2.1, 2.2, 2.5, 7.2, 7.4_
  
  - [x] 15.4 Implement auto-login with stored token

    - Create ValidateStoredTokenAsync method called on Start
    - Check if token exists using TokenStorage.HasToken
    - Call AuthAPI.ValidateTokenAsync if token exists
    - Update authentication state if token is valid
    - Clear token if validation fails
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 15.5 Implement logout

    - Create Logout method to clear token using TokenStorage
    - Reset IsAuthenticated, CurrentUserId, CurrentUsername properties
    - _Requirements: 3.5_

- [x] 16. Create UI components





  - [x] 16.1 Create LoginPanel


    - Create LoginPanel MonoBehaviour with username and password InputFields
    - Add login Button and switch to register Button
    - Implement OnLoginClicked event with username and password parameters
    - Implement OnSwitchToRegister event
    - Implement SetInteractable method to disable inputs during loading
    - Implement Clear method to reset input fields
    - _Requirements: 5.1, 5.2_
  
  - [x] 16.2 Create RegisterPanel


    - Create RegisterPanel MonoBehaviour with username, password, confirmPassword InputFields
    - Add register Button and switch to login Button
    - Implement OnRegisterClicked event with username and password parameters
    - Implement OnSwitchToLogin event
    - Implement ValidateInputs method for client-side validation (password match, length checks)
    - Implement SetInteractable method to disable inputs during loading
    - Implement Clear method to reset input fields
    - _Requirements: 5.1, 5.2, 7.1_
  
  - [x] 16.3 Create LoadingIndicator


    - Create LoadingIndicator MonoBehaviour with animated UI element
    - Implement Show and Hide methods
    - _Requirements: 5.3_
  
  - [x] 16.4 Create AuthenticationUI controller


    - Create AuthenticationUI MonoBehaviour to manage LoginPanel and RegisterPanel
    - Implement ShowLogin and ShowRegister methods to switch between panels
    - Implement ShowLoading method to display/hide loading indicator
    - Implement ShowError method to display error messages
    - Wire up panel events to AuthenticationManager methods
    - Handle AuthResult responses and display appropriate messages
    - Implement OnLoginSuccess to transition to main game scene


    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.3, 7.4_

- [ ] 17. Create error handling utilities


  - Create ErrorHandler static class with GetUserFriendlyMessage method
  - Map error codes to user-friendly messages (USERNAME_EXISTS, INVALID_CREDENTIALS, TOKEN_EXPIRED, NETWORK_ERROR)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 18. Create authentication scene




  - Create Authentication scene with Canvas
  - Add AuthenticationManager GameObject with script
  - Add AuthenticationUI GameObject with LoginPanel, RegisterPanel, LoadingIndicator
  - Configure UI layout and styling
  - Test scene flow: login, register, error display, loading states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 18.1 Write Unity Play Mode tests


  - Test AuthenticationManager initialization and singleton pattern
  - Test TokenStorage save and retrieve operations
  - Test API request/response handling with mock server
  - Test UI state transitions between login and register panels
  - _Requirements: All requirements_

## Integration and Testing

- [x] 19. End-to-end integration testing





  - Start server and verify health check endpoint
  - Test full registration flow from Unity client to server
  - Test full login flow from Unity client to server
  - Test token validation flow
  - Test session persistence (restart Unity, auto-login)
  - Test error scenarios (invalid credentials, network errors, token expiration)
  - Verify error messages display correctly in UI
  - _Requirements: All requirements_




- [x] 20. Create integration documentation

  - Document how other modules can use AuthenticationManager
  - Document how to use auth middleware on server for protected endpoints
  - Document environment configuration for development and production
  - Create example code for authenticated API calls from other Unity modules
  - _Requirements: Integration points for future modules_

