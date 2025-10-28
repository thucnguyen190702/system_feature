using System;
using System.Threading.Tasks;
using UnityEngine;
using FriendSystem.Core;
using FriendSystem.Models;
using FriendSystem.Config;

namespace FriendSystem.Managers
{
    /// <summary>
    /// Manages account operations and API calls
    /// </summary>
    public class AccountManager : MonoBehaviour
    {
        private static AccountManager _instance;
        public static AccountManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    GameObject go = new GameObject("AccountManager");
                    _instance = go.AddComponent<AccountManager>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        [SerializeField] private FriendSystemConfig config;
        private ApiClient apiClient;
        private InGameAccount currentAccount;

        public InGameAccount CurrentAccount => currentAccount;

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeApiClient();
        }

        private void InitializeApiClient()
        {
            if (config == null)
            {
                config = Resources.Load<FriendSystemConfig>("FriendSystemConfig");
                if (config == null)
                {
                    Debug.LogError("FriendSystemConfig not found in Resources folder!");
                    return;
                }
            }

            apiClient = new ApiClient(config.ServerUrl, config.RequestTimeout);
        }

        public void SetAuthToken(string token)
        {
            if (apiClient != null)
            {
                apiClient.SetAuthToken(token);
            }
        }

        /// <summary>
        /// Creates a new account with the specified username
        /// Requirements: 1.1, 1.2
        /// </summary>
        public async Task<InGameAccount> CreateAccount(string username)
        {
            try
            {
                if (string.IsNullOrEmpty(username))
                {
                    throw new ArgumentException("Username cannot be empty");
                }

                var requestData = new { username = username };
                currentAccount = await apiClient.PostAsync<InGameAccount>("/api/accounts", requestData);
                
                Debug.Log($"Account created successfully: {currentAccount.AccountId}");
                return currentAccount;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to create account: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets account information by account ID
        /// Requirements: 1.1
        /// </summary>
        public async Task<InGameAccount> GetAccount(string accountId)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                var account = await apiClient.GetAsync<InGameAccount>($"/api/accounts/{accountId}");
                
                Debug.Log($"Account retrieved successfully: {account.Username}");
                return account;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to get account: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Updates account information
        /// Requirements: 1.3
        /// </summary>
        public async Task<InGameAccount> UpdateAccount(string accountId, AccountUpdateData updateData)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                if (updateData == null)
                {
                    throw new ArgumentException("Update data cannot be null");
                }

                var account = await apiClient.PutAsync<InGameAccount>($"/api/accounts/{accountId}", updateData);
                
                // Update current account if it's the same account
                if (currentAccount != null && currentAccount.AccountId == accountId)
                {
                    currentAccount = account;
                }
                
                Debug.Log($"Account updated successfully: {account.AccountId}");
                return account;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to update account: {ex.Message}");
                throw;
            }
        }
    }

    [Serializable]
    public class AccountUpdateData
    {
        public string displayName;
        public string avatarUrl;
        public int? level;
        public string status;
    }
}
