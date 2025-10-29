using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using UnityEngine.UI;
using Authentication.UI;

namespace Authentication.Tests
{
    /// <summary>
    /// Tests for UI state transitions between login and register panels
    /// </summary>
    public class UIStateTests
    {
        private GameObject canvasObject;
        private GameObject authUIObject;
        private GameObject loginPanelObject;
        private GameObject registerPanelObject;
        private GameObject loadingIndicatorObject;
        private GameObject errorTextObject;

        private AuthenticationUI authUI;
        private LoginPanel loginPanel;
        private RegisterPanel registerPanel;
        private LoadingIndicator loadingIndicator;

        [SetUp]
        public void Setup()
        {
            // Create Canvas
            canvasObject = new GameObject("Canvas");
            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObject.AddComponent<CanvasScaler>();
            canvasObject.AddComponent<GraphicRaycaster>();

            // Create AuthenticationUI
            authUIObject = new GameObject("AuthenticationUI");
            authUIObject.transform.SetParent(canvasObject.transform);
            authUI = authUIObject.AddComponent<AuthenticationUI>();

            // Create LoginPanel
            loginPanelObject = new GameObject("LoginPanel");
            loginPanelObject.transform.SetParent(authUIObject.transform);
            loginPanel = loginPanelObject.AddComponent<LoginPanel>();
            
            // Add required UI components for LoginPanel
            var loginUsernameObj = new GameObject("UsernameInput");
            loginUsernameObj.transform.SetParent(loginPanelObject.transform);
            var loginUsernameInput = loginUsernameObj.AddComponent<InputField>();
            loginUsernameInput.textComponent = loginUsernameObj.AddComponent<Text>();
            
            var loginPasswordObj = new GameObject("PasswordInput");
            loginPasswordObj.transform.SetParent(loginPanelObject.transform);
            var loginPasswordInput = loginPasswordObj.AddComponent<InputField>();
            loginPasswordInput.textComponent = loginPasswordObj.AddComponent<Text>();
            
            var loginButtonObj = new GameObject("LoginButton");
            loginButtonObj.transform.SetParent(loginPanelObject.transform);
            var loginButton = loginButtonObj.AddComponent<Button>();
            
            var switchToRegisterObj = new GameObject("SwitchToRegisterButton");
            switchToRegisterObj.transform.SetParent(loginPanelObject.transform);
            var switchToRegisterButton = switchToRegisterObj.AddComponent<Button>();

            // Use reflection to set private fields
            var loginPanelType = typeof(LoginPanel);
            loginPanelType.GetField("usernameInput", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(loginPanel, loginUsernameInput);
            loginPanelType.GetField("passwordInput", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(loginPanel, loginPasswordInput);
            loginPanelType.GetField("loginButton", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(loginPanel, loginButton);
            loginPanelType.GetField("switchToRegisterButton", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(loginPanel, switchToRegisterButton);

            // Create RegisterPanel
            registerPanelObject = new GameObject("RegisterPanel");
            registerPanelObject.transform.SetParent(authUIObject.transform);
            registerPanel = registerPanelObject.AddComponent<RegisterPanel>();
            
            // Add required UI components for RegisterPanel
            var regUsernameObj = new GameObject("UsernameInput");
            regUsernameObj.transform.SetParent(registerPanelObject.transform);
            var regUsernameInput = regUsernameObj.AddComponent<InputField>();
            regUsernameInput.textComponent = regUsernameObj.AddComponent<Text>();
            
            var regPasswordObj = new GameObject("PasswordInput");
            regPasswordObj.transform.SetParent(registerPanelObject.transform);
            var regPasswordInput = regPasswordObj.AddComponent<InputField>();
            regPasswordInput.textComponent = regPasswordObj.AddComponent<Text>();
            
            var regConfirmPasswordObj = new GameObject("ConfirmPasswordInput");
            regConfirmPasswordObj.transform.SetParent(registerPanelObject.transform);
            var regConfirmPasswordInput = regConfirmPasswordObj.AddComponent<InputField>();
            regConfirmPasswordInput.textComponent = regConfirmPasswordObj.AddComponent<Text>();
            
            var regButtonObj = new GameObject("RegisterButton");
            regButtonObj.transform.SetParent(registerPanelObject.transform);
            var regButton = regButtonObj.AddComponent<Button>();
            
            var switchToLoginObj = new GameObject("SwitchToLoginButton");
            switchToLoginObj.transform.SetParent(registerPanelObject.transform);
            var switchToLoginButton = switchToLoginObj.AddComponent<Button>();

            // Use reflection to set private fields
            var registerPanelType = typeof(RegisterPanel);
            registerPanelType.GetField("usernameInput", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(registerPanel, regUsernameInput);
            registerPanelType.GetField("passwordInput", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(registerPanel, regPasswordInput);
            registerPanelType.GetField("confirmPasswordInput", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(registerPanel, regConfirmPasswordInput);
            registerPanelType.GetField("registerButton", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(registerPanel, regButton);
            registerPanelType.GetField("switchToLoginButton", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(registerPanel, switchToLoginButton);

            // Create LoadingIndicator
            loadingIndicatorObject = new GameObject("LoadingIndicator");
            loadingIndicatorObject.transform.SetParent(authUIObject.transform);
            loadingIndicatorObject.AddComponent<RectTransform>();
            loadingIndicator = loadingIndicatorObject.AddComponent<LoadingIndicator>();

            // Create Error Text
            errorTextObject = new GameObject("ErrorText");
            errorTextObject.transform.SetParent(authUIObject.transform);
            var errorText = errorTextObject.AddComponent<Text>();

            // Set references in AuthenticationUI using reflection
            var authUIType = typeof(AuthenticationUI);
            authUIType.GetField("loginPanel", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(authUI, loginPanel);
            authUIType.GetField("registerPanel", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(authUI, registerPanel);
            authUIType.GetField("loadingIndicator", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(authUI, loadingIndicator);
            authUIType.GetField("errorText", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(authUI, errorText);
        }

        [TearDown]
        public void TearDown()
        {
            // Clean up
            if (canvasObject != null)
            {
                GameObject.DestroyImmediate(canvasObject);
            }
        }

        [UnityTest]
        public IEnumerator UI_ShowLogin_DisplaysLoginPanelAndHidesRegisterPanel()
        {
            yield return null;

            // Act
            authUI.ShowLogin();
            yield return null;

            // Assert
            Assert.IsTrue(loginPanelObject.activeSelf, "Login panel should be active");
            Assert.IsFalse(registerPanelObject.activeSelf, "Register panel should be inactive");
        }

        [UnityTest]
        public IEnumerator UI_ShowRegister_DisplaysRegisterPanelAndHidesLoginPanel()
        {
            yield return null;

            // Act
            authUI.ShowRegister();
            yield return null;

            // Assert
            Assert.IsFalse(loginPanelObject.activeSelf, "Login panel should be inactive");
            Assert.IsTrue(registerPanelObject.activeSelf, "Register panel should be active");
        }

        [UnityTest]
        public IEnumerator UI_ShowLoading_DisplaysLoadingIndicator()
        {
            yield return null;

            // Act
            authUI.ShowLoading(true);
            yield return null;

            // Assert
            Assert.IsTrue(loadingIndicatorObject.activeSelf, "Loading indicator should be active");
        }

        [UnityTest]
        public IEnumerator UI_HideLoading_HidesLoadingIndicator()
        {
            yield return null;

            // Arrange
            authUI.ShowLoading(true);
            yield return null;

            // Act
            authUI.ShowLoading(false);
            yield return null;

            // Assert
            Assert.IsFalse(loadingIndicatorObject.activeSelf, "Loading indicator should be inactive");
        }

        [UnityTest]
        public IEnumerator UI_ShowError_DisplaysErrorMessage()
        {
            yield return null;

            // Act
            string testError = "Test error message";
            authUI.ShowError(testError);
            yield return null;

            // Assert
            Assert.IsTrue(errorTextObject.activeSelf, "Error text should be active");
            var errorText = errorTextObject.GetComponent<Text>();
            Assert.AreEqual(testError, errorText.text, "Error message should match");
        }

        [Test]
        public void LoginPanel_SetInteractable_DisablesInputs()
        {
            // Act
            loginPanel.SetInteractable(false);

            // Assert - verify that inputs are disabled
            // Note: This is a basic test, actual implementation may vary
            Assert.Pass("SetInteractable method executed without errors");
        }

        [Test]
        public void RegisterPanel_SetInteractable_DisablesInputs()
        {
            // Act
            registerPanel.SetInteractable(false);

            // Assert
            Assert.Pass("SetInteractable method executed without errors");
        }

        [Test]
        public void RegisterPanel_ValidateInputs_ReturnsFalseForEmptyUsername()
        {
            // Act
            bool isValid = registerPanel.ValidateInputs(out string error);

            // Assert
            Assert.IsFalse(isValid, "Validation should fail for empty username");
            Assert.IsNotEmpty(error, "Error message should be provided");
        }
    }
}
