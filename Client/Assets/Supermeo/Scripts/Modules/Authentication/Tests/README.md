# Authentication Module Tests

This folder contains Play Mode tests for the Authentication module.

## Test Files

### AuthenticationManagerTests.cs
Tests for the AuthenticationManager singleton and core functionality:
- Singleton pattern initialization
- Multiple instance prevention
- Initial authentication state
- Logout functionality

### TokenStorageTests.cs
Tests for token storage operations:
- Save token with user data
- Retrieve stored token, userId, and username
- Check token existence
- Clear stored data
- Overwrite existing tokens

### UIStateTests.cs
Tests for UI state management and transitions:
- Show/hide login panel
- Show/hide register panel
- Loading indicator display
- Error message display
- Panel interactivity during loading
- Input validation

## Running the Tests

### Using Unity Test Runner

1. Open Unity Test Runner:
   - Go to `Window` → `General` → `Test Runner`

2. Select the `PlayMode` tab

3. Run tests:
   - Click `Run All` to run all tests
   - Or click individual test names to run specific tests

4. View results:
   - Green checkmarks indicate passing tests
   - Red X marks indicate failing tests
   - Click on a test to see detailed output

### Using Command Line

Run tests from command line (useful for CI/CD):

```bash
# Windows
"C:\Program Files\Unity\Hub\Editor\<version>\Editor\Unity.exe" -runTests -batchmode -projectPath "path/to/project" -testResults "path/to/results.xml" -testPlatform PlayMode

# macOS
/Applications/Unity/Hub/Editor/<version>/Unity.app/Contents/MacOS/Unity -runTests -batchmode -projectPath "path/to/project" -testResults "path/to/results.xml" -testPlatform PlayMode

# Linux
/path/to/Unity/Editor/Unity -runTests -batchmode -projectPath "path/to/project" -testResults "path/to/results.xml" -testPlatform PlayMode
```

## Test Coverage

The tests cover the following requirements from the design document:

### AuthenticationManager Tests
- **Requirement 3.1, 3.2:** Session management and authentication state
- **Requirement 3.5:** Logout functionality
- Singleton pattern implementation

### TokenStorage Tests
- **Requirement 2.5:** Token storage in local storage
- **Requirement 3.1:** Check for existing valid token
- **Requirement 3.5:** Clear stored token on logout

### UI State Tests
- **Requirement 5.1:** Login screen display
- **Requirement 5.2:** Switch between login and registration modes
- **Requirement 5.3:** Loading indicator during API requests
- **Requirement 5.4:** Error message display
- **Requirement 5.5:** UI state management

## Test Guidelines

### Writing New Tests

When adding new tests, follow these guidelines:

1. **Naming Convention:**
   - Use descriptive names: `ClassName_MethodName_ExpectedBehavior`
   - Example: `AuthenticationManager_Logout_ClearsAuthenticationState`

2. **Test Structure:**
   - Arrange: Set up test data and conditions
   - Act: Execute the method being tested
   - Assert: Verify the expected outcome

3. **Cleanup:**
   - Always clean up in `TearDown` method
   - Clear PlayerPrefs after tests that use storage
   - Destroy GameObjects created during tests

4. **Isolation:**
   - Each test should be independent
   - Don't rely on test execution order
   - Reset state between tests

### Best Practices

1. **Focus on Core Logic:**
   - Test business logic, not Unity internals
   - Test public interfaces and behaviors
   - Avoid testing private methods directly

2. **Use Play Mode for Integration:**
   - Use Play Mode tests for MonoBehaviour components
   - Use Edit Mode tests for pure C# classes
   - Test Unity lifecycle methods (Awake, Start, Update)

3. **Mock External Dependencies:**
   - Mock network calls for unit tests
   - Use test doubles for complex dependencies
   - Keep tests fast and reliable

4. **Meaningful Assertions:**
   - Use descriptive assertion messages
   - Test one concept per test
   - Verify both positive and negative cases

## Known Limitations

1. **Network Tests:**
   - Current tests don't include actual API calls
   - Mock server implementation needed for full integration tests
   - See task 19 for end-to-end integration testing

2. **Scene Loading:**
   - Tests don't verify actual scene transitions
   - Scene loading requires Build Settings configuration
   - Manual testing recommended for scene flow

3. **UI Interaction:**
   - Tests use reflection to set private fields
   - Some UI tests are basic and may need enhancement
   - Visual testing requires manual verification

## Troubleshooting

### Tests Fail to Run

**Issue:** Tests don't appear in Test Runner
- **Solution:** Ensure `Authentication.Tests.asmdef` is properly configured
- **Solution:** Check that test files are in the Tests folder
- **Solution:** Rebuild the project

**Issue:** "Assembly not found" errors
- **Solution:** Verify assembly references in `.asmdef` file
- **Solution:** Ensure Authentication assembly is compiled
- **Solution:** Restart Unity Editor

### Tests Fail Unexpectedly

**Issue:** Singleton tests fail
- **Solution:** Ensure no AuthenticationManager exists in other scenes
- **Solution:** Check that TearDown properly cleans up instances

**Issue:** Storage tests fail
- **Solution:** Verify PlayerPrefs is accessible in test environment
- **Solution:** Check that TearDown clears PlayerPrefs

**Issue:** UI tests fail
- **Solution:** Ensure all required UI components are created in Setup
- **Solution:** Verify reflection code matches actual field names
- **Solution:** Check Unity version compatibility

## Future Improvements

1. **Add Mock Server:**
   - Implement mock HTTP server for API tests
   - Test actual request/response handling
   - Verify error handling with different server responses

2. **Expand UI Tests:**
   - Test button click events
   - Verify input field validation
   - Test keyboard navigation

3. **Performance Tests:**
   - Measure token storage performance
   - Test UI responsiveness
   - Verify memory usage

4. **Integration Tests:**
   - Test complete authentication flow
   - Verify scene transitions
   - Test with actual server (task 19)

## Related Documentation

- [Scene Setup Guide](../SCENE_SETUP_GUIDE.md) - Instructions for setting up the Authentication scene
- [Design Document](../../../../.kiro/specs/authentication-system/design.md) - System architecture and design
- [Requirements Document](../../../../.kiro/specs/authentication-system/requirements.md) - Feature requirements
- [Tasks Document](../../../../.kiro/specs/authentication-system/tasks.md) - Implementation tasks
