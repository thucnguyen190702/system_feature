using UnityEngine;

namespace Authentication.Core
{
    /// <summary>
    /// Handles secure storage and retrieval of authentication tokens and user data using PlayerPrefs.
    /// </summary>
    public class TokenStorage
    {
        private const string TOKEN_KEY = "auth_token";
        private const string USER_ID_KEY = "user_id";
        private const string USERNAME_KEY = "username";
        
        /// <summary>
        /// Saves authentication token and user information to persistent storage.
        /// </summary>
        /// <param name="token">JWT authentication token</param>
        /// <param name="userId">User's unique identifier</param>
        /// <param name="username">User's username</param>
        public void SaveToken(string token, string userId, string username)
        {
            if (string.IsNullOrEmpty(token))
            {
                Debug.LogWarning("TokenStorage: Attempted to save null or empty token");
                return;
            }
            
            if (string.IsNullOrEmpty(userId))
            {
                Debug.LogWarning("TokenStorage: Attempted to save null or empty userId");
                return;
            }
            
            if (string.IsNullOrEmpty(username))
            {
                Debug.LogWarning("TokenStorage: Attempted to save null or empty username");
                return;
            }
            
            PlayerPrefs.SetString(TOKEN_KEY, token);
            PlayerPrefs.SetString(USER_ID_KEY, userId);
            PlayerPrefs.SetString(USERNAME_KEY, username);
            PlayerPrefs.Save();
            
            Debug.Log($"TokenStorage: Saved authentication data for user: {username}");
        }
        
        /// <summary>
        /// Retrieves the stored authentication token.
        /// </summary>
        /// <returns>The stored token, or null if not found</returns>
        public string GetToken()
        {
            return PlayerPrefs.GetString(TOKEN_KEY, null);
        }
        
        /// <summary>
        /// Retrieves the stored user ID.
        /// </summary>
        /// <returns>The stored user ID, or null if not found</returns>
        public string GetUserId()
        {
            return PlayerPrefs.GetString(USER_ID_KEY, null);
        }
        
        /// <summary>
        /// Retrieves the stored username.
        /// </summary>
        /// <returns>The stored username, or null if not found</returns>
        public string GetUsername()
        {
            return PlayerPrefs.GetString(USERNAME_KEY, null);
        }
        
        /// <summary>
        /// Checks if a valid token exists in storage.
        /// </summary>
        /// <returns>True if a token exists, false otherwise</returns>
        public bool HasToken()
        {
            string token = GetToken();
            return !string.IsNullOrEmpty(token);
        }
        
        /// <summary>
        /// Clears all stored authentication data from persistent storage.
        /// </summary>
        public void ClearToken()
        {
            if (HasToken())
            {
                string username = GetUsername();
                PlayerPrefs.DeleteKey(TOKEN_KEY);
                PlayerPrefs.DeleteKey(USER_ID_KEY);
                PlayerPrefs.DeleteKey(USERNAME_KEY);
                PlayerPrefs.Save();
                
                Debug.Log($"TokenStorage: Cleared authentication data for user: {username}");
            }
            else
            {
                Debug.Log("TokenStorage: No token to clear");
            }
        }
    }
}
