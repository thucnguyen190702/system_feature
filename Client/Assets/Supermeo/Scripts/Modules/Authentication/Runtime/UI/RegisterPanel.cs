using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Authentication.UI
{
    public class RegisterPanel : MonoBehaviour
    {
        [Header("Input Fields")]
        [SerializeField] private TMP_InputField usernameInput;
        [SerializeField] private TMP_InputField passwordInput;
        [SerializeField] private TMP_InputField confirmPasswordInput;
        
        [Header("Buttons")]
        [SerializeField] private Button registerButton;
        [SerializeField] private Button switchToLoginButton;
        
        [Header("Configuration")]
        [SerializeField] private int minUsernameLength = 3;
        [SerializeField] private int maxUsernameLength = 50;
        [SerializeField] private int minPasswordLength = 6;
        
        // Events
        public event Action<string, string> OnRegisterClicked;
        public event Action OnSwitchToLogin;
        
        private void Start()
        {
            // Wire up button click events
            if (registerButton != null)
            {
                registerButton.onClick.AddListener(OnRegisterButtonClicked);
            }
            
            if (switchToLoginButton != null)
            {
                switchToLoginButton.onClick.AddListener(OnSwitchToLoginButtonClicked);
            }
        }
        
        private void OnDestroy()
        {
            // Clean up listeners
            if (registerButton != null)
            {
                registerButton.onClick.RemoveListener(OnRegisterButtonClicked);
            }
            
            if (switchToLoginButton != null)
            {
                switchToLoginButton.onClick.RemoveListener(OnSwitchToLoginButtonClicked);
            }
        }
        
        private void OnRegisterButtonClicked()
        {
            string username = usernameInput != null ? usernameInput.text : string.Empty;
            string password = passwordInput != null ? passwordInput.text : string.Empty;
            
            OnRegisterClicked?.Invoke(username, password);
        }
        
        private void OnSwitchToLoginButtonClicked()
        {
            OnSwitchToLogin?.Invoke();
        }
        
        /// <summary>
        /// Validate inputs for client-side validation
        /// </summary>
        public bool ValidateInputs(out string error)
        {
            error = string.Empty;
            
            // Get input values
            string username = usernameInput != null ? usernameInput.text : string.Empty;
            string password = passwordInput != null ? passwordInput.text : string.Empty;
            string confirmPassword = confirmPasswordInput != null ? confirmPasswordInput.text : string.Empty;
            
            // Validate username length
            if (string.IsNullOrEmpty(username))
            {
                error = "Username is required";
                return false;
            }
            
            if (username.Length < minUsernameLength)
            {
                error = $"Username must be at least {minUsernameLength} characters";
                return false;
            }
            
            if (username.Length > maxUsernameLength)
            {
                error = $"Username must not exceed {maxUsernameLength} characters";
                return false;
            }
            
            // Validate username contains only alphanumeric characters
            foreach (char c in username)
            {
                if (!char.IsLetterOrDigit(c))
                {
                    error = "Username must contain only letters and numbers";
                    return false;
                }
            }
            
            // Validate password length
            if (string.IsNullOrEmpty(password))
            {
                error = "Password is required";
                return false;
            }
            
            if (password.Length < minPasswordLength)
            {
                error = $"Password must be at least {minPasswordLength} characters";
                return false;
            }
            
            // Validate password match
            if (password != confirmPassword)
            {
                error = "Passwords do not match";
                return false;
            }
            
            return true;
        }
        
        /// <summary>
        /// Enable or disable all interactive elements
        /// </summary>
        public void SetInteractable(bool interactable)
        {
            if (usernameInput != null)
            {
                usernameInput.interactable = interactable;
            }
            
            if (passwordInput != null)
            {
                passwordInput.interactable = interactable;
            }
            
            if (confirmPasswordInput != null)
            {
                confirmPasswordInput.interactable = interactable;
            }
            
            if (registerButton != null)
            {
                registerButton.interactable = interactable;
            }
            
            if (switchToLoginButton != null)
            {
                switchToLoginButton.interactable = interactable;
            }
        }
        
        /// <summary>
        /// Clear all input fields
        /// </summary>
        public void Clear()
        {
            if (usernameInput != null)
            {
                usernameInput.text = string.Empty;
            }
            
            if (passwordInput != null)
            {
                passwordInput.text = string.Empty;
            }
            
            if (confirmPasswordInput != null)
            {
                confirmPasswordInput.text = string.Empty;
            }
        }
    }
}
