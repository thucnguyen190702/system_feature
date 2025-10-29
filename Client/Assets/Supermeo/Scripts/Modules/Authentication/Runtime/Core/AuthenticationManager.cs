using System;
using System.Threading.Tasks;
using UnityEngine;
using Authentication.API;

namespace Authentication.Core
{
    /// <summary>
    /// Singleton manager for handling authentication operations including registration, login, and session management.
    /// Persists across scenes and manages authentication state throughout the application lifecycle.
    /// </summary>
    public class AuthenticationManager : MonoBehaviour
    {
        private static AuthenticationManager instance;
        
        /// <summary>
        /// Singleton instance of the AuthenticationManager
        /// </summary>
        public static AuthenticationManager Instance
        {
            get
            {
                if (instance == null)
                {
                    Debug.LogError("AuthenticationManager: Instance is null. Make sure AuthenticationManager is in the scene.");
                }
                return instance;
            }
        }
        
        private AuthenticationConfig config;
        private TokenStorage tokenStorage;
        private AuthAPI authAPI;
        
        /// <summary>
        /// Indicates whether the user is currently authenticated
        /// </summary>
        public bool IsAuthenticated { get; private set; }
        
        /// <summary>
        /// Current authenticated user's unique identifier
        /// </summary>
        public string CurrentUserId { get; private set; }
        
        /// <summary>
        /// Current authenticated user's username
        /// </summary>
        public string CurrentUsername { get; private set; }
        
        /// <summary>
        /// Event fired when authentication state changes
        /// </summary>
        public event Action<bool> OnAuthenticationChanged;
        
        private void Awake()
        {
            // Implement singleton pattern
            if (instance != null && instance != this)
            {
                Debug.LogWarning("AuthenticationManager: Multiple instances detected. Destroying duplicate.");
                Destroy(gameObject);
                return;
            }
            
            instance = this;
            DontDestroyOnLoad(gameObject);
            
            // Initialize components
            InitializeComponents();
            
            Debug.Log("AuthenticationManager: Initialized successfully");
        }
        
        private void InitializeComponents()
        {
            // Load configuration from Resources
            config = Resources.Load<AuthenticationConfig>("AuthConfig");
            
            if (config == null)
            {
                Debug.LogError("AuthenticationManager: Failed to load AuthConfig from Resources. Please create AuthConfig asset.");
                return;
            }
            
            // Initialize token storage
            tokenStorage = new TokenStorage();
            
            // Initialize API client
            authAPI = new AuthAPI(config);
            
            Debug.Log($"AuthenticationManager: Components initialized. Server URL: {config.serverUrl}");
        }
        
        private async void Start()
        {
            // Attempt auto-login with stored token
            await ValidateStoredTokenAsync();
        }
        
        /// <summary>
        /// Registers a new user account with the provided credentials
        /// </summary>
        /// <param name="username">Desired username</param>
        /// <param name="password">User password</param>
        /// <returns>AuthResult containing success status and relevant information</returns>
        public async Task<AuthResult> RegisterAsync(string username, string password)
        {
            // Validate inputs
            string validationError = ValidateCredentials(username, password);
            if (!string.IsNullOrEmpty(validationError))
            {
                return new AuthResult
                {
                    Success = false,
                    Message = validationError
                };
            }
            
            try
            {
                // Create registration request
                var request = new RegisterRequest
                {
                    username = username,
                    password = password
                };
                
                Debug.Log($"AuthenticationManager: Attempting to register user: {username}");
                
                // Call API
                AuthResponse response = await authAPI.RegisterAsync(request);
                
                if (response == null)
                {
                    return new AuthResult
                    {
                        Success = false,
                        Message = "Network error. Please check your connection."
                    };
                }
                
                if (response.success)
                {
                    // Save token and update state
                    tokenStorage.SaveToken(response.token, response.userId, response.username);
                    UpdateAuthenticationState(true, response.userId, response.username);
                    
                    Debug.Log($"AuthenticationManager: Registration successful for user: {response.username}");
                    
                    return new AuthResult
                    {
                        Success = true,
                        Message = "Registration successful",
                        Token = response.token,
                        UserId = response.userId,
                        Username = response.username
                    };
                }
                else
                {
                    Debug.LogWarning($"AuthenticationManager: Registration failed: {response.message} (Code: {response.code})");
                    
                    return new AuthResult
                    {
                        Success = false,
                        Message = response.message ?? "Registration failed",
                        ErrorCode = response.code
                    };
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"AuthenticationManager: Registration exception: {ex.Message}");
                
                return new AuthResult
                {
                    Success = false,
                    Message = "An error occurred during registration"
                };
            }
        }
        
        /// <summary>
        /// Logs in an existing user with the provided credentials
        /// </summary>
        /// <param name="username">User's username</param>
        /// <param name="password">User's password</param>
        /// <returns>AuthResult containing success status and relevant information</returns>
        public async Task<AuthResult> LoginAsync(string username, string password)
        {
            // Basic validation
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Username and password are required"
                };
            }
            
            try
            {
                // Create login request
                var request = new LoginRequest
                {
                    username = username,
                    password = password
                };
                
                Debug.Log($"AuthenticationManager: Attempting to login user: {username}");
                
                // Call API
                AuthResponse response = await authAPI.LoginAsync(request);
                
                if (response == null)
                {
                    return new AuthResult
                    {
                        Success = false,
                        Message = "Network error. Please check your connection."
                    };
                }
                
                if (response.success)
                {
                    // Save token and update state
                    tokenStorage.SaveToken(response.token, response.userId, response.username);
                    UpdateAuthenticationState(true, response.userId, response.username);
                    
                    Debug.Log($"AuthenticationManager: Login successful for user: {response.username}");
                    
                    return new AuthResult
                    {
                        Success = true,
                        Message = "Login successful",
                        Token = response.token,
                        UserId = response.userId,
                        Username = response.username
                    };
                }
                else
                {
                    Debug.LogWarning($"AuthenticationManager: Login failed: {response.message} (Code: {response.code})");
                    
                    return new AuthResult
                    {
                        Success = false,
                        Message = response.message ?? "Login failed",
                        ErrorCode = response.code
                    };
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"AuthenticationManager: Login exception: {ex.Message}");
                
                return new AuthResult
                {
                    Success = false,
                    Message = "An error occurred during login"
                };
            }
        }
        
        /// <summary>
        /// Validates a stored token and automatically logs in the user if valid
        /// </summary>
        /// <returns>True if token is valid and user is authenticated, false otherwise</returns>
        public async Task<bool> ValidateStoredTokenAsync()
        {
            // Check if token exists
            if (!tokenStorage.HasToken())
            {
                Debug.Log("AuthenticationManager: No stored token found");
                return false;
            }
            
            string token = tokenStorage.GetToken();
            string userId = tokenStorage.GetUserId();
            string username = tokenStorage.GetUsername();
            
            Debug.Log($"AuthenticationManager: Validating stored token for user: {username}");
            
            try
            {
                // Validate token with server
                bool isValid = await authAPI.ValidateTokenAsync(token);
                
                if (isValid)
                {
                    // Token is valid, update authentication state
                    UpdateAuthenticationState(true, userId, username);
                    Debug.Log($"AuthenticationManager: Auto-login successful for user: {username}");
                    return true;
                }
                else
                {
                    // Token is invalid or expired, clear it
                    Debug.LogWarning("AuthenticationManager: Stored token is invalid or expired");
                    tokenStorage.ClearToken();
                    UpdateAuthenticationState(false, null, null);
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"AuthenticationManager: Token validation exception: {ex.Message}");
                tokenStorage.ClearToken();
                UpdateAuthenticationState(false, null, null);
                return false;
            }
        }
        
        /// <summary>
        /// Logs out the current user and clears all stored authentication data
        /// </summary>
        public void Logout()
        {
            Debug.Log($"AuthenticationManager: Logging out user: {CurrentUsername}");
            
            // Clear stored token
            tokenStorage.ClearToken();
            
            // Reset authentication state
            UpdateAuthenticationState(false, null, null);
            
            Debug.Log("AuthenticationManager: Logout complete");
        }
        
        /// <summary>
        /// Validates username and password against configuration rules
        /// </summary>
        /// <param name="username">Username to validate</param>
        /// <param name="password">Password to validate</param>
        /// <returns>Error message if validation fails, null if valid</returns>
        private string ValidateCredentials(string username, string password)
        {
            if (string.IsNullOrEmpty(username))
            {
                return "Username is required";
            }
            
            if (string.IsNullOrEmpty(password))
            {
                return "Password is required";
            }
            
            if (username.Length < config.minUsernameLength)
            {
                return $"Username must be at least {config.minUsernameLength} characters";
            }
            
            if (username.Length > config.maxUsernameLength)
            {
                return $"Username must not exceed {config.maxUsernameLength} characters";
            }
            
            if (password.Length < config.minPasswordLength)
            {
                return $"Password must be at least {config.minPasswordLength} characters";
            }
            
            // Check for alphanumeric username
            foreach (char c in username)
            {
                if (!char.IsLetterOrDigit(c))
                {
                    return "Username must contain only letters and numbers";
                }
            }
            
            return null;
        }
        
        /// <summary>
        /// Updates the authentication state and fires the OnAuthenticationChanged event
        /// </summary>
        /// <param name="isAuthenticated">New authentication status</param>
        /// <param name="userId">User ID (null if not authenticated)</param>
        /// <param name="username">Username (null if not authenticated)</param>
        private void UpdateAuthenticationState(bool isAuthenticated, string userId, string username)
        {
            bool stateChanged = IsAuthenticated != isAuthenticated;
            
            IsAuthenticated = isAuthenticated;
            CurrentUserId = userId;
            CurrentUsername = username;
            
            if (stateChanged)
            {
                OnAuthenticationChanged?.Invoke(isAuthenticated);
            }
        }
        
        private void OnApplicationQuit()
        {
            Debug.Log("AuthenticationManager: Application quitting");
        }
    }
}
