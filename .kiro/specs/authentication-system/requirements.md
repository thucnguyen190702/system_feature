# Requirements Document - Authentication System

## Introduction

Hệ thống xác thực (Authentication System) cung cấp chức năng đăng ký, đăng nhập, và quản lý phiên làm việc cho người dùng trong game. Hệ thống này là nền tảng cho các tính năng xã hội như friend-system, chat, clan, và leaderboard.

## Glossary

- **AuthSystem**: Hệ thống xác thực chịu trách nhiệm quản lý đăng ký, đăng nhập và phiên làm việc người dùng
- **Client**: Ứng dụng Unity game client chạy trên thiết bị người chơi
- **Server**: Backend API server xử lý các yêu cầu xác thực
- **User**: Người chơi game có tài khoản trong hệ thống
- **Session**: Phiên làm việc được tạo sau khi đăng nhập thành công
- **Token**: Chuỗi ký tự JWT dùng để xác thực các request từ client
- **Credentials**: Thông tin đăng nhập bao gồm username và password

## Requirements

### Requirement 1: User Registration

**User Story:** As a new player, I want to create an account with username and password, so that I can access game features and save my progress

#### Acceptance Criteria

1. WHEN a User submits registration with valid username and password, THE AuthSystem SHALL create a new account and return success confirmation
2. IF a User submits registration with an existing username, THEN THE AuthSystem SHALL reject the request and return an error message indicating username is taken
3. THE AuthSystem SHALL validate that username contains between 3 and 20 alphanumeric characters
4. THE AuthSystem SHALL validate that password contains at least 6 characters
5. WHEN account creation succeeds, THE AuthSystem SHALL store hashed password in the database

### Requirement 2: User Login

**User Story:** As a registered player, I want to log in with my credentials, so that I can access my account and use game features

#### Acceptance Criteria

1. WHEN a User submits valid credentials, THE AuthSystem SHALL authenticate the user and return a session token
2. IF a User submits invalid credentials, THEN THE AuthSystem SHALL reject the request and return an authentication error
3. WHEN login succeeds, THE AuthSystem SHALL generate a JWT token valid for 24 hours
4. THE AuthSystem SHALL include user ID and username in the token payload
5. WHEN login succeeds on Client, THE Client SHALL store the token securely for subsequent requests

### Requirement 3: Session Management

**User Story:** As a logged-in player, I want my session to persist across game sessions, so that I don't have to log in every time I open the game

#### Acceptance Criteria

1. WHEN Client starts, THE Client SHALL check for existing valid token in local storage
2. IF a valid token exists, THEN THE Client SHALL automatically authenticate the user without requiring login
3. WHEN a token expires, THE Client SHALL prompt the user to log in again
4. THE Client SHALL include the token in Authorization header for all authenticated API requests
5. WHEN user logs out, THE Client SHALL clear the stored token

### Requirement 4: Token Validation

**User Story:** As a system, I want to validate tokens on protected endpoints, so that only authenticated users can access restricted features

#### Acceptance Criteria

1. WHEN Server receives a request to a protected endpoint, THE Server SHALL validate the JWT token from Authorization header
2. IF the token is invalid or expired, THEN THE Server SHALL reject the request with 401 Unauthorized status
3. IF the token is valid, THEN THE Server SHALL extract user information and process the request
4. THE Server SHALL verify token signature matches the secret key
5. THE Server SHALL check token expiration time is in the future

### Requirement 5: Unity Client UI

**User Story:** As a player, I want a simple UI to register and log in, so that I can easily access my account

#### Acceptance Criteria

1. THE Client SHALL display a login screen with username and password input fields
2. THE Client SHALL provide a button to switch between login and registration modes
3. WHEN user submits login or registration, THE Client SHALL display loading indicator during API request
4. IF authentication fails, THEN THE Client SHALL display error message to the user
5. WHEN authentication succeeds, THE Client SHALL transition to the main game scene

### Requirement 6: Password Security

**User Story:** As a system administrator, I want passwords to be securely stored, so that user accounts are protected

#### Acceptance Criteria

1. THE Server SHALL hash passwords using bcrypt algorithm before storing in database
2. THE Server SHALL use a salt rounds value of at least 10 for bcrypt hashing
3. THE Server SHALL never return password hashes in API responses
4. THE Server SHALL never log passwords in plain text
5. WHEN comparing passwords during login, THE Server SHALL use bcrypt compare function

### Requirement 7: Error Handling

**User Story:** As a player, I want clear error messages when authentication fails, so that I know how to fix the problem

#### Acceptance Criteria

1. WHEN registration fails due to validation, THE AuthSystem SHALL return specific error message describing the validation issue
2. WHEN login fails, THE AuthSystem SHALL return generic error message to prevent username enumeration
3. WHEN network error occurs, THE Client SHALL display user-friendly error message
4. THE Client SHALL log detailed error information to console for debugging
5. WHEN Server encounters internal error, THE Server SHALL return 500 status with generic error message
