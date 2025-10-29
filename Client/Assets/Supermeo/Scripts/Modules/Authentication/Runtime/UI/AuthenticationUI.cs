using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using Authentication.Core;
using Authentication.API;
using Supermeo.Authentication.Utils;
using TMPro;

namespace Authentication.UI
{
    /// <summary>
    /// Main UI controller for authentication flow, managing login and registration panels
    /// </summary>
    public class AuthenticationUI : MonoBehaviour
    {
        [Header("Panels")]
        [SerializeField] private LoginPanel loginPanel;
        [SerializeField] private RegisterPanel registerPanel;
        
        [Header("UI Elements")]
        [SerializeField] private LoadingIndicator loadingIndicator;
        [SerializeField] private TextMeshProUGUI errorText;
        
        [Header("Scene Settings")]
        [SerializeField] private string mainGameSceneName = "Main";
        
        private AuthenticationManager authManager;
        
        private void Start()
        {
            // Get reference to AuthenticationManager
            authManager = AuthenticationManager.Instance;
            
            if (authManager == null)
            {
                Debug.LogError("AuthenticationUI: AuthenticationManager instance not found!");
                return;
            }
            
            // Subscribe to authentication state changes
            authManager.OnAuthenticationChanged += HandleAuthenticationChanged;
            
            // Wire up panel events
            if (loginPanel != null)
            {
                loginPanel.OnLoginClicked += HandleLoginClicked;
                loginPanel.OnSwitchToRegister += HandleSwitchToRegister;
            }
            
            if (registerPanel != null)
            {
                registerPanel.OnRegisterClicked += HandleRegisterClicked;
                registerPanel.OnSwitchToLogin += HandleSwitchToLogin;
            }
            
            // Initialize UI state
            ShowLogin();
            HideError();
            ShowLoading(false);
            
            // Check if already authenticated (in case auto-login completed before Start)
            if (authManager.IsAuthenticated)
            {
                OnLoginSuccess();
            }
        }
        
        private void OnDestroy()
        {
            // Clean up event subscriptions
            if (authManager != null)
            {
                authManager.OnAuthenticationChanged -= HandleAuthenticationChanged;
            }
            
            if (loginPanel != null)
            {
                loginPanel.OnLoginClicked -= HandleLoginClicked;
                loginPanel.OnSwitchToRegister -= HandleSwitchToRegister;
            }
            
            if (registerPanel != null)
            {
                registerPanel.OnRegisterClicked -= HandleRegisterClicked;
                registerPanel.OnSwitchToLogin -= HandleSwitchToLogin;
            }
        }
        
        /// <summary>
        /// Show the login panel and hide the register panel
        /// </summary>
        public void ShowLogin()
        {
            if (loginPanel != null)
            {
                loginPanel.gameObject.SetActive(true);
                loginPanel.Clear();
            }
            
            if (registerPanel != null)
            {
                registerPanel.gameObject.SetActive(false);
            }
            
            HideError();
        }
        
        /// <summary>
        /// Show the register panel and hide the login panel
        /// </summary>
        public void ShowRegister()
        {
            if (loginPanel != null)
            {
                loginPanel.gameObject.SetActive(false);
            }
            
            if (registerPanel != null)
            {
                registerPanel.gameObject.SetActive(true);
                registerPanel.Clear();
            }
            
            HideError();
        }
        
        /// <summary>
        /// Show or hide the loading indicator
        /// </summary>
        public void ShowLoading(bool show)
        {
            if (loadingIndicator != null)
            {
                if (show)
                {
                    loadingIndicator.Show();
                }
                else
                {
                    loadingIndicator.Hide();
                }
            }
            
            // Disable/enable panels during loading
            if (loginPanel != null)
            {
                loginPanel.SetInteractable(!show);
            }
            
            if (registerPanel != null)
            {
                registerPanel.SetInteractable(!show);
            }
        }
        
        /// <summary>
        /// Display an error message to the user
        /// </summary>
        public void ShowError(string message)
        {
            if (errorText != null)
            {
                errorText.text = message;
                errorText.gameObject.SetActive(true);
            }
            
            Debug.LogWarning($"AuthenticationUI: Error displayed: {message}");
        }
        
        /// <summary>
        /// Hide the error message
        /// </summary>
        private void HideError()
        {
            if (errorText != null)
            {
                errorText.text = string.Empty;
                errorText.gameObject.SetActive(false);
            }
        }
        
        /// <summary>
        /// Handle authentication state changes (for auto-login)
        /// </summary>
        private void HandleAuthenticationChanged(bool isAuthenticated)
        {
            if (isAuthenticated)
            {
                Debug.Log("AuthenticationUI: Auto-login successful");
                OnLoginSuccess();
            }
        }
        
        /// <summary>
        /// Called when login is successful, transitions to main game scene
        /// </summary>
        public void OnLoginSuccess()
        {
            Debug.Log($"AuthenticationUI: Login successful, transitioning to {mainGameSceneName}");
            
            // Load main game scene
            try
            {
                SceneManager.LoadScene(mainGameSceneName);
            }
            catch (Exception ex)
            {
                Debug.LogError($"AuthenticationUI: Failed to load scene '{mainGameSceneName}': {ex.Message}");
                ShowError($"Failed to load game scene: {mainGameSceneName}");
            }
        }
        
        // Event Handlers
        
        private async void HandleLoginClicked(string username, string password)
        {
            HideError();
            ShowLoading(true);
            
            try
            {
                AuthResult result = await authManager.LoginAsync(username, password);
                
                ShowLoading(false);
                
                if (result.Success)
                {
                    OnLoginSuccess();
                }
                else
                {
                    // Use ErrorHandler to get user-friendly message from error code
                    Debug.Log($"AuthenticationUI: Login failed with code: {result.ErrorCode}, message: {result.Message}");
                    string errorCode = !string.IsNullOrEmpty(result.ErrorCode) ? result.ErrorCode : result.Message;
                    string userFriendlyMessage = ErrorHandler.GetUserFriendlyMessage(errorCode);
                    ShowError(userFriendlyMessage);
                }
            }
            catch (Exception ex)
            {
                ShowLoading(false);
                ShowError(ErrorHandler.GetUserFriendlyMessage("SERVER_ERROR"));
                Debug.LogError($"AuthenticationUI: Login error: {ex.Message}");
            }
        }
        
        private async void HandleRegisterClicked(string username, string password)
        {
            HideError();
            
            // Client-side validation
            if (registerPanel != null)
            {
                if (!registerPanel.ValidateInputs(out string validationError))
                {
                    ShowError(validationError);
                    return;
                }
            }
            
            ShowLoading(true);
            
            try
            {
                AuthResult result = await authManager.RegisterAsync(username, password);
                
                ShowLoading(false);
                
                if (result.Success)
                {
                    OnLoginSuccess();
                }
                else
                {
                    // Use ErrorHandler to get user-friendly message from error code
                    Debug.Log($"AuthenticationUI: Registration failed with code: {result.ErrorCode}, message: {result.Message}");
                    string errorCode = !string.IsNullOrEmpty(result.ErrorCode) ? result.ErrorCode : result.Message;
                    string userFriendlyMessage = ErrorHandler.GetUserFriendlyMessage(errorCode);
                    ShowError(userFriendlyMessage);
                }
            }
            catch (Exception ex)
            {
                ShowLoading(false);
                ShowError(ErrorHandler.GetUserFriendlyMessage("SERVER_ERROR"));
                Debug.LogError($"AuthenticationUI: Registration error: {ex.Message}");
            }
        }
        
        private void HandleSwitchToRegister()
        {
            ShowRegister();
        }
        
        private void HandleSwitchToLogin()
        {
            ShowLogin();
        }
    }
}
