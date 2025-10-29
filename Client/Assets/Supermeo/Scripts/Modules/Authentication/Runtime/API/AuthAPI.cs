using System;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using Authentication.Core;

namespace Authentication.API
{
    public class AuthAPI
    {
        private readonly AuthenticationConfig config;
        private const string AUTHORIZATION_HEADER = "Authorization";
        private const string CONTENT_TYPE_HEADER = "Content-Type";
        private const string CONTENT_TYPE_JSON = "application/json";

        public AuthAPI(AuthenticationConfig config)
        {
            if (config == null)
            {
                throw new ArgumentNullException(nameof(config));
            }
            this.config = config;
        }

        /// <summary>
        /// Generic method to send HTTP requests with JSON serialization/deserialization
        /// </summary>
        private async Task<T> SendRequestAsync<T>(
            string url, 
            string method, 
            object body = null, 
            string token = null) where T : class
        {
            UnityWebRequest request = null;

            try
            {
                // Create request based on method
                if (method == "GET")
                {
                    request = UnityWebRequest.Get(url);
                }
                else if (method == "POST")
                {
                    string jsonBody = body != null ? JsonUtility.ToJson(body) : "{}";
                    byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
                    request = new UnityWebRequest(url, method);
                    request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                    request.downloadHandler = new DownloadHandlerBuffer();
                    request.SetRequestHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_JSON);
                }
                else
                {
                    throw new NotSupportedException($"HTTP method {method} is not supported");
                }

                // Set timeout
                request.timeout = config.requestTimeoutSeconds;

                // Add authorization header if token is provided
                if (!string.IsNullOrEmpty(token))
                {
                    request.SetRequestHeader(AUTHORIZATION_HEADER, $"Bearer {token}");
                }

                // Send request
                var operation = request.SendWebRequest();

                // Wait for completion
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                // Handle response
                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    
                    if (string.IsNullOrEmpty(responseText))
                    {
                        return null;
                    }

                    T response = JsonUtility.FromJson<T>(responseText);
                    return response;
                }
                else
                {
                    // Handle error response
                    string errorText = request.downloadHandler?.text;
                    
                    if (!string.IsNullOrEmpty(errorText))
                    {
                        try
                        {
                            // Try to parse error as the expected type
                            T errorResponse = JsonUtility.FromJson<T>(errorText);
                            return errorResponse;
                        }
                        catch
                        {
                            // If parsing fails, log the error
                            Debug.LogError($"API Error: {request.error} - {errorText}");
                        }
                    }
                    
                    Debug.LogError($"API Request Failed: {request.error}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"API Request Exception: {ex.Message}");
                return null;
            }
            finally
            {
                request?.Dispose();
            }
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        /// <param name="request">Registration request with username and password</param>
        /// <returns>AuthResponse with token and user info on success, or error message on failure</returns>
        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (request == null)
            {
                return new AuthResponse
                {
                    success = false,
                    message = "Invalid request"
                };
            }

            try
            {
                string url = config.GetRegisterUrl();
                AuthResponse response = await SendRequestAsync<AuthResponse>(url, "POST", request);

                if (response == null)
                {
                    return new AuthResponse
                    {
                        success = false,
                        message = "Network error. Please check your connection."
                    };
                }

                return response;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Registration failed: {ex.Message}");
                return new AuthResponse
                {
                    success = false,
                    message = "An error occurred during registration"
                };
            }
        }

        /// <summary>
        /// Login with existing user credentials
        /// </summary>
        /// <param name="request">Login request with username and password</param>
        /// <returns>AuthResponse with token and user info on success, or error message on failure</returns>
        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            if (request == null)
            {
                return new AuthResponse
                {
                    success = false,
                    message = "Invalid request"
                };
            }

            try
            {
                string url = config.GetLoginUrl();
                AuthResponse response = await SendRequestAsync<AuthResponse>(url, "POST", request);

                if (response == null)
                {
                    return new AuthResponse
                    {
                        success = false,
                        message = "Network error. Please check your connection."
                    };
                }

                return response;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Login failed: {ex.Message}");
                return new AuthResponse
                {
                    success = false,
                    message = "An error occurred during login"
                };
            }
        }

        /// <summary>
        /// Validate a stored authentication token
        /// </summary>
        /// <param name="token">JWT token to validate</param>
        /// <returns>True if token is valid, false otherwise</returns>
        public async Task<bool> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                Debug.LogWarning("Cannot validate empty token");
                return false;
            }

            try
            {
                string url = config.GetValidateUrl();
                AuthResponse response = await SendRequestAsync<AuthResponse>(url, "GET", null, token);

                // If response is null or success is false, token is invalid
                if (response == null)
                {
                    Debug.LogWarning("Token validation failed: No response from server");
                    return false;
                }

                // Return the success status from the response
                return response.success;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Token validation exception: {ex.Message}");
                return false;
            }
        }
    }
}
