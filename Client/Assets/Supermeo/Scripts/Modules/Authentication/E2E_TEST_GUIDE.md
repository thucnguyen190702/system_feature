# End-to-End Integration Testing Guide

This guide provides step-by-step instructions for manually testing the complete authentication flow from Unity client to server.

## Prerequisites

1. **Server Running**: Ensure the authentication server is running on `http://localhost:3000`
2. **Database**: PostgreSQL database must be running and configured
3. **Unity Scene**: Open the `Authentication` scene in Unity
4. **AuthConfig**: Verify `AuthConfig.asset` has correct server URL

## Test Setup

### 1. Start the Server

```bash
cd Server
npm install
npm run dev
```

Verify server is running by checking:
- Console shows: "Server running on port 3000"
- Health check: http://localhost:3000/health

### 2. Verify Database Connection

Check server logs for:
```
Database initialized successfully
Auth module initialized successfully
```

### 3. Open Unity Authentication Scene

1. Open Unity Editor
2. Navigate to `Assets/Scenes/Authentication.unity`
3. Enter Play Mode

## Manual Test Cases

### Test 1: Health Check Endpoint

**Objective**: Verify server is accessible

**Steps**:
1. Open browser or use curl
2. Navigate to: `http://localhost:3000/health`

**Expected Result**:
```json
{
  "status": "ok",
  "timestamp": "2024-10-29T...",
  "uptime": 123.456
}
```

---

### Test 2: Full Registration Flow

**Objective**: Test complete registration from Unity client to server

**Steps**:
1. In Unity Play Mode, ensure you're on the Register panel
2. Enter username: `testuser001` (3-50 alphanumeric characters)
3. Enter password: `testpass123` (minimum 6 characters)
4. Enter confirm password: `testpass123`
5. Click "Register" button

**Expected Results**:
- Loading indicator appears
- After ~1-2 seconds, loading indicator disappears
- Success message or transition to main game scene
- Console shows: "Registration successful"
- Token is stored in PlayerPrefs

**Verification**:
- Check Unity Console for success logs
- Check server logs for POST /api/auth/register
- Verify user exists in database

---

### Test 3: Full Login Flow

**Objective**: Test complete login from Unity client to server

**Steps**:
1. Click "Switch to Login" button
2. Enter username: `testuser001`
3. Enter password: `testpass123`
4. Click "Login" button

**Expected Results**:
- Loading indicator appears
- After ~1-2 seconds, loading indicator disappears
- Success message or transition to main game scene
- Console shows: "Login successful"
- Token is stored in PlayerPrefs

**Verification**:
- Check Unity Console for success logs
- Check server logs for POST /api/auth/login
- Verify token is valid

---

### Test 4: Token Validation Flow

**Objective**: Test automatic token validation on app start

**Steps**:
1. After successful login (Test 3), exit Play Mode
2. Re-enter Play Mode
3. Observe the authentication flow

**Expected Results**:
- AuthenticationManager checks for stored token
- Token is validated with server
- If valid, user is automatically authenticated
- No login screen shown (or quick transition)
- Console shows: "Token validated successfully"

**Verification**:
- Check Unity Console for "ValidateStoredTokenAsync" logs
- Check server logs for GET /api/auth/validate
- Verify IsAuthenticated is true

---

### Test 5: Session Persistence (Restart Unity)

**Objective**: Test session persistence across Unity restarts

**Steps**:
1. Complete a successful login (Test 3)
2. Exit Play Mode
3. Close Unity Editor completely
4. Reopen Unity Editor
5. Open Authentication scene
6. Enter Play Mode

**Expected Results**:
- Token is still stored in PlayerPrefs
- Automatic validation occurs
- User is authenticated without login
- Console shows: "Auto-login successful"

**Verification**:
- Check PlayerPrefs for stored token
- Verify GET /api/auth/validate is called
- User should not see login screen

---

### Test 6: Error Scenarios

#### 6.1 Invalid Credentials

**Steps**:
1. On Login panel, enter username: `testuser001`
2. Enter password: `wrongpassword`
3. Click "Login"

**Expected Results**:
- Error message displayed: "Invalid username or password"
- User remains on login screen
- Console shows error log

#### 6.2 Username Already Exists

**Steps**:
1. On Register panel, enter username: `testuser001` (existing user)
2. Enter password: `newpass123`
3. Enter confirm password: `newpass123`
4. Click "Register"

**Expected Results**:
- Error message displayed: "Username is already taken"
- User remains on register screen
- Console shows error log

#### 6.3 Validation Errors

**Test 6.3.1: Username Too Short**
- Enter username: `ab`
- Enter password: `validpass123`
- Click "Register"
- Expected: Error message about username length

**Test 6.3.2: Password Too Short**
- Enter username: `validuser`
- Enter password: `12345`
- Click "Register"
- Expected: Error message about password length

**Test 6.3.3: Password Mismatch**
- Enter username: `validuser`
- Enter password: `password123`
- Enter confirm password: `password456`
- Click "Register"
- Expected: Error message about password mismatch

**Test 6.3.4: Invalid Username Characters**
- Enter username: `invalid@user!`
- Enter password: `validpass123`
- Click "Register"
- Expected: Error message about invalid characters

#### 6.4 Network Errors

**Test 6.4.1: Server Not Running**
1. Stop the server (Ctrl+C in server terminal)
2. In Unity, try to login or register
3. Expected: Network error message displayed

**Test 6.4.2: Wrong Server URL**
1. Change AuthConfig server URL to `http://localhost:9999`
2. Try to login or register
3. Expected: Connection error message

**Test 6.4.3: Request Timeout**
1. Set AuthConfig timeout to 1 second
2. Simulate slow network (if possible)
3. Expected: Timeout error message

#### 6.5 Token Expiration

**Steps**:
1. Login successfully
2. Manually edit the token in PlayerPrefs to an expired token
3. Exit and re-enter Play Mode
4. Observe behavior

**Expected Results**:
- Token validation fails
- User is prompted to login again
- Error message: "Session expired. Please login again"

---

### Test 7: Error Message Display

**Objective**: Verify all error messages display correctly in UI

**Test Cases**:

| Scenario | Expected Error Message |
|----------|------------------------|
| Username exists | "Username is already taken" |
| Invalid credentials | "Invalid username or password" |
| Token expired | "Session expired. Please login again" |
| Network error | "Connection error. Please check your internet" |
| Username too short | "Username must be 3-50 characters" |
| Password too short | "Password must be at least 6 characters" |
| Password mismatch | "Passwords do not match" |
| Invalid characters | "Username can only contain letters and numbers" |

**Steps for Each**:
1. Trigger the error condition
2. Verify error message appears in UI
3. Verify error message matches expected text
4. Verify error message is user-friendly (no technical jargon)

---

### Test 8: Complete User Journey

**Objective**: Test the entire user lifecycle

**Steps**:
1. **Register**: Create new account with unique username
2. **Validate**: Verify token works immediately after registration
3. **Logout**: Click logout button (if implemented) or clear PlayerPrefs
4. **Login**: Login with same credentials
5. **Validate**: Verify token works after login
6. **Restart**: Exit and re-enter Play Mode
7. **Auto-Login**: Verify automatic authentication
8. **Logout Again**: Clear session
9. **Register New**: Try to register with same username (should fail)

**Expected Results**:
- All steps complete successfully
- Appropriate messages displayed at each step
- No errors in console
- Smooth transitions between states

---

## Automated Test Execution

### Server Integration Tests

```bash
cd Server
npm test
```

This runs all integration tests including:
- Registration flow
- Login flow
- Token validation
- Error scenarios

### Unity Play Mode Tests

1. Open Unity Test Runner (Window > General > Test Runner)
2. Select "PlayMode" tab
3. Click "Run All"

Tests include:
- AuthenticationManager initialization
- TokenStorage operations
- API request/response handling
- UI state transitions

---

## Verification Checklist

After completing all tests, verify:

- [ ] Server health check endpoint responds
- [ ] Registration creates new user in database
- [ ] Login returns valid JWT token
- [ ] Token validation works correctly
- [ ] Session persists across Unity restarts
- [ ] Invalid credentials show appropriate error
- [ ] Username conflicts are handled
- [ ] Validation errors display correctly
- [ ] Network errors are handled gracefully
- [ ] Token expiration is detected
- [ ] All error messages are user-friendly
- [ ] Loading indicators work properly
- [ ] UI transitions are smooth
- [ ] No errors in Unity console
- [ ] No errors in server logs

---

## Troubleshooting

### Server Not Starting

**Issue**: Server fails to start
**Solution**:
1. Check PostgreSQL is running
2. Verify .env file has correct database credentials
3. Run database migrations: `npm run migration:run`
4. Check port 3000 is not in use

### Database Connection Failed

**Issue**: "Database initialization failed"
**Solution**:
1. Verify PostgreSQL is running on port 5126
2. Check database credentials in .env
3. Ensure database `system_db` exists
4. Test connection: `psql -h localhost -p 5126 -U postgres -d system_db`

### Unity Cannot Connect to Server

**Issue**: Network error in Unity
**Solution**:
1. Verify server is running: http://localhost:3000/health
2. Check AuthConfig.asset has correct URL
3. Disable firewall temporarily
4. Check Unity console for detailed error

### Token Validation Fails

**Issue**: Token is rejected by server
**Solution**:
1. Verify JWT_SECRET matches in server .env
2. Check token hasn't expired (24 hour default)
3. Verify token format: "Bearer <token>"
4. Check server logs for validation errors

### PlayerPrefs Not Persisting

**Issue**: Token not saved between sessions
**Solution**:
1. Check TokenStorage.SaveToken is called
2. Verify PlayerPrefs.Save() is called
3. Check Unity Editor PlayerPrefs location
4. Try clearing PlayerPrefs and re-testing

---

## Test Results Template

Use this template to document test results:

```
Test Date: _______________
Tester: _______________
Unity Version: _______________
Server Version: _______________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Health Check | ☐ Pass ☐ Fail | |
| Registration Flow | ☐ Pass ☐ Fail | |
| Login Flow | ☐ Pass ☐ Fail | |
| Token Validation | ☐ Pass ☐ Fail | |
| Session Persistence | ☐ Pass ☐ Fail | |
| Invalid Credentials | ☐ Pass ☐ Fail | |
| Username Conflict | ☐ Pass ☐ Fail | |
| Validation Errors | ☐ Pass ☐ Fail | |
| Network Errors | ☐ Pass ☐ Fail | |
| Token Expiration | ☐ Pass ☐ Fail | |
| Error Messages | ☐ Pass ☐ Fail | |
| Complete Journey | ☐ Pass ☐ Fail | |

Overall Result: ☐ All Pass ☐ Some Failures

Issues Found:
1. _______________
2. _______________
3. _______________
```

---

## Next Steps

After completing E2E testing:

1. Document any issues found
2. Fix critical bugs
3. Optimize performance bottlenecks
4. Update documentation
5. Prepare for production deployment
6. Set up monitoring and logging
7. Create user documentation
