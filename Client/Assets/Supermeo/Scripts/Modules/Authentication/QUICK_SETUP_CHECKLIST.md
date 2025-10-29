# Authentication Scene - Quick Setup Checklist

Use this checklist to quickly set up the Authentication scene in Unity.

## ✅ Scene Setup Checklist

### Core GameObjects
- [ ] Open `Assets/Scenes/Authentication.unity`
- [ ] Create `AuthenticationManager` GameObject with script
- [ ] Create `Canvas` (Screen Space Overlay, 1920x1080 reference)

### AuthenticationUI Structure
- [ ] Create `AuthenticationUI` GameObject under Canvas
- [ ] Add `AuthenticationUI` script
- [ ] Set Main Game Scene Name to "Main"

### Login Panel
- [ ] Create `LoginPanel` (Panel, 400x300)
- [ ] Add `LoginPanel` script
- [ ] Add children:
  - [ ] Title Text (TextMeshPro)
  - [ ] Username Input Field (TextMeshPro)
  - [ ] Password Input Field (TextMeshPro, Content Type: Password)
  - [ ] Login Button (TextMeshPro)
  - [ ] Switch to Register Button (TextMeshPro)
- [ ] Wire up script references in Inspector

### Register Panel
- [ ] Create `RegisterPanel` (Panel, 400x400, initially inactive)
- [ ] Add `RegisterPanel` script
- [ ] Add children:
  - [ ] Title Text (TextMeshPro)
  - [ ] Username Input Field (TextMeshPro)
  - [ ] Password Input Field (TextMeshPro, Content Type: Password)
  - [ ] Confirm Password Input Field (TextMeshPro, Content Type: Password)
  - [ ] Register Button (TextMeshPro)
  - [ ] Switch to Login Button (TextMeshPro)
- [ ] Wire up script references in Inspector

### Loading & Error UI
- [ ] Create `LoadingIndicator` (Image, 50x50, initially inactive)
- [ ] Add `LoadingIndicator` script
- [ ] Create `ErrorText` (TextMeshPro, red color, initially inactive)

### Wire Up AuthenticationUI
- [ ] Assign Login Panel reference
- [ ] Assign Register Panel reference
- [ ] Assign Loading Indicator reference
- [ ] Assign Error Text reference

### Configuration
- [ ] Configure `AuthConfig.asset` in Resources folder:
  - [ ] Server URL (e.g., http://localhost:3000)
  - [ ] Endpoints (/api/auth/register, /api/auth/login, /api/auth/validate)
  - [ ] Validation settings (3-50 username, 6+ password)
  - [ ] Timeout (10 seconds)

### Build Settings
- [ ] Add Authentication scene to Build Settings
- [ ] Add Main scene to Build Settings
- [ ] Verify scene order

## 🧪 Testing Checklist

### Manual Testing
- [ ] Scene loads without errors
- [ ] Login panel visible, Register panel hidden
- [ ] Can switch between panels
- [ ] Input fields accept text
- [ ] Buttons are clickable
- [ ] Loading indicator shows/hides
- [ ] Error messages display correctly

### Automated Testing
- [ ] Open Test Runner (Window → General → Test Runner)
- [ ] Switch to PlayMode tab
- [ ] Run all tests
- [ ] Verify all tests pass:
  - [ ] AuthenticationManagerTests
  - [ ] TokenStorageTests
  - [ ] UIStateTests

### Integration Testing (with Server)
- [ ] Start server (npm run dev in Server folder)
- [ ] Test registration with valid data
- [ ] Test registration with invalid data (short username, password mismatch)
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test session persistence (restart game)
- [ ] Test network error handling (stop server)

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Scripts not found | Check Console for compilation errors |
| AuthenticationManager.Instance is null | Ensure GameObject exists with script attached |
| Scene doesn't transition | Check Main scene name and Build Settings |
| Server connection fails | Verify server is running and URL in AuthConfig |
| UI elements not visible | Check Canvas settings and UI anchors |
| Tests don't appear | Verify .asmdef configuration and rebuild |

## 🎨 Styling Recommendations

### Colors
- Background: `#2C3E50` (dark blue-gray)
- Panels: `#34495E` (lighter gray)
- Primary Button: `#3498DB` (blue)
- Secondary Button: `#95A5A6` (gray)
- Text: `#FFFFFF` or `#ECF0F1` (white/light gray)
- Error: `#E74C3C` (red)

### Spacing
- Panel padding: 15-20px
- Element spacing: 10-15px
- Button height: 40-50px
- Input field width: 300-350px

## 📚 Documentation

- **Detailed Setup:** See `SCENE_SETUP_GUIDE.md`
- **Test Documentation:** See `Tests/README.md`
- **Design Document:** See `.kiro/specs/authentication-system/design.md`
- **Requirements:** See `.kiro/specs/authentication-system/requirements.md`

## ⚡ Quick Start Commands

### Start Server
```bash
cd Server
npm install
npm run dev
```

### Run Tests
```bash
# In Unity Test Runner
Window → General → Test Runner → PlayMode → Run All
```

### Build Scene
```bash
File → Build Settings → Add Open Scenes → Build
```

## ✨ Next Steps

After completing setup:
1. Customize UI styling to match your game theme
2. Test complete authentication flow with server
3. Implement additional features (Remember Me, Forgot Password)
4. Add animations and transitions
5. Optimize for different screen sizes

---

**Status:** Scene setup complete when all checkboxes are marked ✅
