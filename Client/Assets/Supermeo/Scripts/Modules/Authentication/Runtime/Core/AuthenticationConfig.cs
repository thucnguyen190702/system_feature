using UnityEngine;

namespace Authentication.Core
{
    [CreateAssetMenu(fileName = "AuthConfig", menuName = "Authentication/Config")]
    public class AuthenticationConfig : ScriptableObject
    {
        [Header("Server Settings")]
        [Tooltip("Base URL of the authentication server")]
        public string serverUrl = "http://localhost:3000";
        
        [Tooltip("Endpoint path for user registration")]
        public string registerEndpoint = "/api/auth/register";
        
        [Tooltip("Endpoint path for user login")]
        public string loginEndpoint = "/api/auth/login";
        
        [Tooltip("Endpoint path for token validation")]
        public string validateEndpoint = "/api/auth/validate";
        
        [Header("Validation Settings")]
        [Tooltip("Minimum username length (characters)")]
        public int minUsernameLength = 3;
        
        [Tooltip("Maximum username length (characters)")]
        public int maxUsernameLength = 50;
        
        [Tooltip("Minimum password length (characters)")]
        public int minPasswordLength = 6;
        
        [Header("Request Settings")]
        [Tooltip("Request timeout in seconds")]
        public int requestTimeoutSeconds = 10;
        
        // Helper methods to get full URLs
        public string GetRegisterUrl() => serverUrl + registerEndpoint;
        public string GetLoginUrl() => serverUrl + loginEndpoint;
        public string GetValidateUrl() => serverUrl + validateEndpoint;
    }
}
