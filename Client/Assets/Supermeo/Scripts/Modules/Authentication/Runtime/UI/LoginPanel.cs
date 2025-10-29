using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
namespace Authentication.UI
{
    public class LoginPanel : MonoBehaviour
    {
        [Header("Input Fields")]
        [SerializeField] private TMP_InputField usernameInput;
        [SerializeField] private TMP_InputField passwordInput;
        [Header("Buttons")]
        [SerializeField] private Button loginButton;
        [SerializeField] private Button switchToRegisterButton;
        
        // Events
        public event Action<string, string> OnLoginClicked;
        public event Action OnSwitchToRegister;
        
        private void Start()
        {
            // Wire up button click events
            if (loginButton != null)
            {
                loginButton.onClick.AddListener(OnLoginButtonClicked);
            }
            
            if (switchToRegisterButton != null)
            {
                switchToRegisterButton.onClick.AddListener(OnSwitchToRegisterButtonClicked);
            }
        }
        
        private void OnDestroy()
        {
            // Clean up listeners
            if (loginButton != null)
            {
                loginButton.onClick.RemoveListener(OnLoginButtonClicked);
            }
            
            if (switchToRegisterButton != null)
            {
                switchToRegisterButton.onClick.RemoveListener(OnSwitchToRegisterButtonClicked);
            }
        }
        
        private void OnLoginButtonClicked()
        {
            string username = usernameInput != null ? usernameInput.text : string.Empty;
            string password = passwordInput != null ? passwordInput.text : string.Empty;
            
            OnLoginClicked?.Invoke(username, password);
        }
        
        private void OnSwitchToRegisterButtonClicked()
        {
            OnSwitchToRegister?.Invoke();
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
            
            if (loginButton != null)
            {
                loginButton.interactable = interactable;
            }
            
            if (switchToRegisterButton != null)
            {
                switchToRegisterButton.interactable = interactable;
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
        }
    }
}
