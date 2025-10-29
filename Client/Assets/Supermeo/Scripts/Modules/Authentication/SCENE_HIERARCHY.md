# Authentication Scene Hierarchy

This document shows the complete GameObject hierarchy for the Authentication scene.

## Scene Structure

```
Authentication Scene
│
├── Main Camera
│   └── (Default Unity camera)
│
├── AuthenticationManager
│   └── AuthenticationManager.cs
│
└── Canvas
    ├── Canvas
    ├── Canvas Scaler
    ├── Graphic Raycaster
    │
    ├── Background (Optional)
    │   └── Image (Panel)
    │
    └── AuthenticationUI
        ├── AuthenticationUI.cs
        │
        ├── LoginPanel
        │   ├── LoginPanel.cs
        │   ├── Image (Panel background)
        │   │
        │   ├── TitleText
        │   │   └── TextMeshProUGUI ("Login")
        │   │
        │   ├── UsernameInput
        │   │   ├── TMP_InputField
        │   │   ├── Text Area
        │   │   │   ├── Placeholder ("Username")
        │   │   │   └── Text
        │   │   └── Image (background)
        │   │
        │   ├── PasswordInput
        │   │   ├── TMP_InputField (Content Type: Password)
        │   │   ├── Text Area
        │   │   │   ├── Placeholder ("Password")
        │   │   │   └── Text
        │   │   └── Image (background)
        │   │
        │   ├── LoginButton
        │   │   ├── Button
        │   │   ├── Image (button background)
        │   │   └── Text (TMP) ("Login")
        │   │
        │   └── SwitchToRegisterButton
        │       ├── Button
        │       ├── Image (button background)
        │       └── Text (TMP) ("Don't have an account? Register")
        │
        ├── RegisterPanel (Initially Inactive)
        │   ├── RegisterPanel.cs
        │   ├── Image (Panel background)
        │   │
        │   ├── TitleText
        │   │   └── TextMeshProUGUI ("Register")
        │   │
        │   ├── UsernameInput
        │   │   ├── TMP_InputField
        │   │   ├── Text Area
        │   │   │   ├── Placeholder ("Username (3-50 characters)")
        │   │   │   └── Text
        │   │   └── Image (background)
        │   │
        │   ├── PasswordInput
        │   │   ├── TMP_InputField (Content Type: Password)
        │   │   ├── Text Area
        │   │   │   ├── Placeholder ("Password (min 6 characters)")
        │   │   │   └── Text
        │   │   └── Image (background)
        │   │
        │   ├── ConfirmPasswordInput
        │   │   ├── TMP_InputField (Content Type: Password)
        │   │   ├── Text Area
        │   │   │   ├── Placeholder ("Confirm Password")
        │   │   │   └── Text
        │   │   └── Image (background)
        │   │
        │   ├── RegisterButton
        │   │   ├── Button
        │   │   ├── Image (button background)
        │   │   └── Text (TMP) ("Register")
        │   │
        │   └── SwitchToLoginButton
        │       ├── Button
        │       ├── Image (button background)
        │       └── Text (TMP) ("Already have an account? Login")
        │
        ├── LoadingIndicator (Initially Inactive)
        │   ├── LoadingIndicator.cs
        │   ├── RectTransform
        │   └── Image (circular sprite)
        │
        └── ErrorText (Initially Inactive)
            └── TextMeshProUGUI (red color)
```

## Component Details

### AuthenticationManager
- **Script:** `AuthenticationManager.cs`
- **Purpose:** Singleton manager for authentication state
- **DontDestroyOnLoad:** Yes
- **Configuration:** Uses `AuthConfig` from Resources

### Canvas
- **Render Mode:** Screen Space - Overlay
- **Canvas Scaler:**
  - UI Scale Mode: Scale With Screen Size
  - Reference Resolution: 1920 x 1080
  - Match: 0.5
- **Graphic Raycaster:** For UI interaction

### AuthenticationUI
- **Script:** `AuthenticationUI.cs`
- **Purpose:** Main UI controller
- **References:**
  - Login Panel
  - Register Panel
  - Loading Indicator
  - Error Text
- **Settings:**
  - Main Game Scene Name: "Main"

### LoginPanel
- **Script:** `LoginPanel.cs`
- **RectTransform:**
  - Anchor: Center
  - Width: 400
  - Height: 300
- **References:**
  - Username Input
  - Password Input
  - Login Button
  - Switch To Register Button

### RegisterPanel
- **Script:** `RegisterPanel.cs`
- **RectTransform:**
  - Anchor: Center
  - Width: 400
  - Height: 400
- **Initial State:** Inactive
- **References:**
  - Username Input
  - Password Input
  - Confirm Password Input
  - Register Button
  - Switch To Login Button
- **Validation Settings:**
  - Min Username Length: 3
  - Max Username Length: 50
  - Min Password Length: 6

### LoadingIndicator
- **Script:** `LoadingIndicator.cs`
- **RectTransform:**
  - Anchor: Center
  - Width: 50
  - Height: 50
- **Initial State:** Inactive
- **Animation:**
  - Rotation Speed: 360°/second
  - Continuous rotation when active

### ErrorText
- **Component:** TextMeshProUGUI
- **Initial State:** Inactive
- **Styling:**
  - Color: Red (#FF0000 or #E74C3C)
  - Font Size: 18
  - Alignment: Center
- **Position:** Below panels, visible area

## Layout Recommendations

### LoginPanel Layout (400x300)
```
┌─────────────────────────────────────┐
│              Login                  │ ← Title (36pt, top 20px)
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Username                      │ │ ← Input (top 80px)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │ ← Password (top 140px)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Button (top 200px)
│  └───────────────────────────────┘ │
│                                     │
│  Don't have an account? Register   │ ← Link (bottom 20px)
└─────────────────────────────────────┘
```

### RegisterPanel Layout (400x400)
```
┌─────────────────────────────────────┐
│             Register                │ ← Title (36pt, top 20px)
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Username (3-50 characters)    │ │ ← Input (top 80px)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │ ← Password (top 140px)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │ ← Confirm (top 200px)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        Register               │ │ ← Button (top 260px)
│  └───────────────────────────────┘ │
│                                     │
│  Already have an account? Login    │ ← Link (bottom 20px)
└─────────────────────────────────────┘
```

## RectTransform Settings

### Panel Positioning
```csharp
// LoginPanel / RegisterPanel
Anchor Preset: Center
Anchor Min: (0.5, 0.5)
Anchor Max: (0.5, 0.5)
Pivot: (0.5, 0.5)
Position: (0, 0, 0)
```

### Input Field Sizing
```csharp
Width: 350
Height: 40
Spacing: 15px between fields
```

### Button Sizing
```csharp
Width: 350
Height: 45
Spacing: 20px from last input
```

### Text Sizing
```csharp
Title: Font Size 36, Bold
Input Placeholder: Font Size 14
Button Text: Font Size 16
Link Text: Font Size 14
Error Text: Font Size 18
```

## Script References Diagram

```
AuthenticationUI
    ├─→ LoginPanel (reference)
    ├─→ RegisterPanel (reference)
    ├─→ LoadingIndicator (reference)
    └─→ ErrorText (reference)

LoginPanel
    ├─→ usernameInput (InputField)
    ├─→ passwordInput (InputField)
    ├─→ loginButton (Button)
    └─→ switchToRegisterButton (Button)

RegisterPanel
    ├─→ usernameInput (InputField)
    ├─→ passwordInput (InputField)
    ├─→ confirmPasswordInput (InputField)
    ├─→ registerButton (Button)
    └─→ switchToLoginButton (Button)

LoadingIndicator
    └─→ animatedElement (RectTransform)
```

## Event Flow

```
User Action → Panel Event → AuthenticationUI Handler → AuthenticationManager → API Call

Example: Login Flow
1. User clicks Login Button
2. LoginPanel.OnLoginClicked event fires
3. AuthenticationUI.HandleLoginClicked receives username/password
4. AuthenticationUI shows loading indicator
5. AuthenticationManager.LoginAsync called
6. AuthAPI.LoginAsync makes HTTP request
7. Response received
8. AuthenticationUI hides loading
9. On success: transition to Main scene
10. On error: show error message
```

## State Transitions

```
Initial State:
- LoginPanel: Active
- RegisterPanel: Inactive
- LoadingIndicator: Inactive
- ErrorText: Inactive

Switch to Register:
- LoginPanel: Inactive
- RegisterPanel: Active
- LoadingIndicator: Inactive
- ErrorText: Inactive

During API Call:
- Current Panel: Active but disabled
- LoadingIndicator: Active (rotating)
- ErrorText: Inactive

After Error:
- Current Panel: Active and enabled
- LoadingIndicator: Inactive
- ErrorText: Active (showing message)

After Success:
- Scene transition to Main
```

## Tips for Scene Setup

1. **Use Prefabs:** Consider creating prefabs for LoginPanel and RegisterPanel for reusability
2. **Anchors:** Use proper anchors for responsive design across different resolutions
3. **Layout Groups:** Consider using Vertical Layout Group for automatic spacing
4. **Event System:** Ensure EventSystem exists in scene (created automatically with Canvas)
5. **Testing:** Use Unity's UI Preview to test different resolutions

## Related Files

- **Scene File:** `Assets/Scenes/Authentication.unity`
- **Scripts:** `Assets/Supermeo/Scripts/Modules/Authentication/Runtime/`
- **Config:** `Assets/Supermeo/Scripts/Modules/Authentication/Resources/AuthConfig.asset`
- **Tests:** `Assets/Supermeo/Scripts/Modules/Authentication/Tests/`
