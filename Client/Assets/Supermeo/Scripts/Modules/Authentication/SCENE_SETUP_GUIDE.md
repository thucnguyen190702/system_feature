# Authentication Scene Setup Guide

This guide provides step-by-step instructions for setting up the Authentication scene in Unity.

## Prerequisites

- Unity 2021.3 or later
- TextMesh Pro package installed
- Authentication module scripts already implemented

## Scene Setup Instructions

### 1. Open the Authentication Scene

1. Navigate to `Assets/Scenes/` in the Project window
2. Double-click `Authentication.unity` to open it

### 2. Create AuthenticationManager GameObject

1. In the Hierarchy, right-click and select `Create Empty`
2. Rename it to `AuthenticationManager`
3. Add the `AuthenticationManager` script component:
   - Click `Add Component`
   - Search for `AuthenticationManager`
   - Select it from the list

### 3. Create Canvas for UI

1. Right-click in Hierarchy → `UI` → `Canvas`
2. Rename it to `AuthenticationCanvas`
3. Configure Canvas settings:
   - Render Mode: `Screen Space - Overlay`
   - Canvas Scaler: `Scale With Screen Size`
   - Reference Resolution: `1920 x 1080`
   - Match: `0.5` (balance between width and height)

### 4. Create Background Panel (Optional)

1. Right-click on `AuthenticationCanvas` → `UI` → `Panel`
2. Rename to `Background`
3. Set color to a dark color (e.g., `#2C3E50`)

### 5. Create AuthenticationUI GameObject

1. Right-click on `AuthenticationCanvas` → `Create Empty`
2. Rename to `AuthenticationUI`
3. Add `AuthenticationUI` script component
4. Configure the script:
   - Main Game Scene Name: `Main` (or your main scene name)

### 6. Create Login Panel

1. Right-click on `AuthenticationUI` → `UI` → `Panel`
2. Rename to `LoginPanel`
3. Add `LoginPanel` script component
4. Configure RectTransform:
   - Anchor: Center
   - Width: 400
   - Height: 300

#### 6.1 Add Login Panel Children

Create the following UI elements as children of `LoginPanel`:

**Title Text:**
- Right-click `LoginPanel` → `UI` → `Text - TextMeshPro`
- Rename to `TitleText`
- Text: "Login"
- Font Size: 36
- Alignment: Center
- Position: Top of panel

**Username Input:**
- Right-click `LoginPanel` → `UI` → `Input Field - TextMeshPro`
- Rename to `UsernameInput`
- Placeholder: "Username"
- Position: Below title

**Password Input:**
- Right-click `LoginPanel` → `UI` → `Input Field - TextMeshPro`
- Rename to `PasswordInput`
- Placeholder: "Password"
- Content Type: `Password`
- Position: Below username input

**Login Button:**
- Right-click `LoginPanel` → `UI` → `Button - TextMeshPro`
- Rename to `LoginButton`
- Button Text: "Login"
- Position: Below password input

**Switch to Register Button:**
- Right-click `LoginPanel` → `UI` → `Button - TextMeshPro`
- Rename to `SwitchToRegisterButton`
- Button Text: "Don't have an account? Register"
- Position: Bottom of panel

#### 6.2 Wire Up LoginPanel Script

Select `LoginPanel` and assign references in the Inspector:
- Username Input: Drag `UsernameInput`
- Password Input: Drag `PasswordInput`
- Login Button: Drag `LoginButton`
- Switch To Register Button: Drag `SwitchToRegisterButton`

### 7. Create Register Panel

1. Right-click on `AuthenticationUI` → `UI` → `Panel`
2. Rename to `RegisterPanel`
3. Add `RegisterPanel` script component
4. Configure RectTransform:
   - Anchor: Center
   - Width: 400
   - Height: 400
5. Set Active: `false` (initially hidden)

#### 7.1 Add Register Panel Children

Create the following UI elements as children of `RegisterPanel`:

**Title Text:**
- Right-click `RegisterPanel` → `UI` → `Text - TextMeshPro`
- Rename to `TitleText`
- Text: "Register"
- Font Size: 36
- Alignment: Center
- Position: Top of panel

**Username Input:**
- Right-click `RegisterPanel` → `UI` → `Input Field - TextMeshPro`
- Rename to `UsernameInput`
- Placeholder: "Username (3-50 characters)"
- Position: Below title

**Password Input:**
- Right-click `RegisterPanel` → `UI` → `Input Field - TextMeshPro`
- Rename to `PasswordInput`
- Placeholder: "Password (min 6 characters)"
- Content Type: `Password`
- Position: Below username input

**Confirm Password Input:**
- Right-click `RegisterPanel` → `UI` → `Input Field - TextMeshPro`
- Rename to `ConfirmPasswordInput`
- Placeholder: "Confirm Password"
- Content Type: `Password`
- Position: Below password input

**Register Button:**
- Right-click `RegisterPanel` → `UI` → `Button - TextMeshPro`
- Rename to `RegisterButton`
- Button Text: "Register"
- Position: Below confirm password input

**Switch to Login Button:**
- Right-click `RegisterPanel` → `UI` → `Button - TextMeshPro`
- Rename to `SwitchToLoginButton`
- Button Text: "Already have an account? Login"
- Position: Bottom of panel

#### 7.2 Wire Up RegisterPanel Script

Select `RegisterPanel` and assign references in the Inspector:
- Username Input: Drag `UsernameInput`
- Password Input: Drag `PasswordInput`
- Confirm Password Input: Drag `ConfirmPasswordInput`
- Register Button: Drag `RegisterButton`
- Switch To Login Button: Drag `SwitchToLoginButton`

### 8. Create Loading Indicator

1. Right-click on `AuthenticationUI` → `UI` → `Image`
2. Rename to `LoadingIndicator`
3. Add `LoadingIndicator` script component
4. Configure:
   - Image: Use a circular sprite (or create one)
   - Color: White or accent color
   - RectTransform: Center, Width: 50, Height: 50
   - Rotation Speed: 360 (in script)
5. Set Active: `false` (initially hidden)

### 9. Create Error Text

1. Right-click on `AuthenticationUI` → `UI` → `Text - TextMeshPro`
2. Rename to `ErrorText`
3. Configure:
   - Text: (leave empty)
   - Font Size: 18
   - Color: Red (#FF0000)
   - Alignment: Center
   - Position: Below panels (visible area)
   - RectTransform: Stretch horizontally
4. Set Active: `false` (initially hidden)

### 10. Wire Up AuthenticationUI Script

Select `AuthenticationUI` GameObject and assign references in the Inspector:
- Login Panel: Drag `LoginPanel`
- Register Panel: Drag `RegisterPanel`
- Loading Indicator: Drag `LoadingIndicator`
- Error Text: Drag `ErrorText`
- Main Game Scene Name: Enter your main scene name (e.g., "Main")

### 11. Configure AuthenticationConfig Asset

1. Navigate to `Assets/Supermeo/Scripts/Modules/Authentication/Resources/`
2. Select `AuthConfig.asset`
3. Configure the settings:
   - Server URL: `http://localhost:3000` (or your server URL)
   - Register Endpoint: `/api/auth/register`
   - Login Endpoint: `/api/auth/login`
   - Validate Endpoint: `/api/auth/validate`
   - Min Username Length: `3`
   - Max Username Length: `50`
   - Min Password Length: `6`
   - Request Timeout Seconds: `10`

### 12. Add Scene to Build Settings

1. Go to `File` → `Build Settings`
2. Click `Add Open Scenes` to add the Authentication scene
3. Ensure it's at index 0 or adjust your scene loading logic accordingly

## Testing the Scene

### Manual Testing Checklist

1. **Scene Load:**
   - [ ] Scene loads without errors
   - [ ] Login panel is visible
   - [ ] Register panel is hidden

2. **Login Panel:**
   - [ ] Can enter username and password
   - [ ] Login button is clickable
   - [ ] Switch to Register button works

3. **Register Panel:**
   - [ ] Can enter username, password, and confirm password
   - [ ] Register button is clickable
   - [ ] Switch to Login button works
   - [ ] Validation works (password mismatch, short username, etc.)

4. **Loading Indicator:**
   - [ ] Shows when login/register is clicked
   - [ ] Rotates smoothly
   - [ ] Hides after response

5. **Error Display:**
   - [ ] Shows error messages in red text
   - [ ] Clears when switching panels
   - [ ] Displays user-friendly messages

6. **Integration:**
   - [ ] Successful login transitions to Main scene
   - [ ] Successful registration transitions to Main scene
   - [ ] Invalid credentials show error
   - [ ] Network errors are handled gracefully

### Play Mode Tests

Run the Unity Test Runner to execute automated tests:

1. Open `Window` → `General` → `Test Runner`
2. Select `PlayMode` tab
3. Click `Run All` to execute all tests
4. Verify all tests pass:
   - AuthenticationManager initialization tests
   - TokenStorage save/retrieve tests
   - UI state transition tests

## Styling Tips

### Color Scheme Suggestions

- **Background:** Dark blue/gray (#2C3E50)
- **Panels:** Slightly lighter (#34495E)
- **Buttons:** Accent color (#3498DB for primary, #95A5A6 for secondary)
- **Text:** White (#FFFFFF) or light gray (#ECF0F1)
- **Error Text:** Red (#E74C3C)
- **Success:** Green (#2ECC71)

### Layout Tips

1. Use consistent spacing between elements (e.g., 10-20 pixels)
2. Make input fields wide enough for comfortable typing (300-350 pixels)
3. Use larger buttons for better touch/click targets (height: 40-50 pixels)
4. Center panels on screen for better focus
5. Add padding inside panels (10-20 pixels from edges)

## Troubleshooting

### Common Issues

**Issue: Scripts not found**
- Solution: Ensure all scripts are compiled without errors. Check Console for compilation errors.

**Issue: AuthenticationManager.Instance is null**
- Solution: Ensure AuthenticationManager GameObject exists in the scene and has the script attached.

**Issue: Scene doesn't transition after login**
- Solution: Check that the Main scene name in AuthenticationUI matches your actual scene name and is added to Build Settings.

**Issue: Server connection fails**
- Solution: Verify server is running and AuthConfig has correct server URL.

**Issue: UI elements not visible**
- Solution: Check Canvas render mode, camera settings, and UI element positions/anchors.

## Next Steps

After setting up the scene:

1. Test the complete authentication flow with the server running
2. Customize the UI styling to match your game's theme
3. Add additional features like "Remember Me" or "Forgot Password"
4. Implement proper error handling for network issues
5. Add loading animations or transitions for better UX

## Additional Resources

- Unity UI Documentation: https://docs.unity3d.com/Manual/UISystem.html
- TextMesh Pro Documentation: https://docs.unity3d.com/Manual/com.unity.textmeshpro.html
- Authentication System Design: See `design.md` in the specs folder
