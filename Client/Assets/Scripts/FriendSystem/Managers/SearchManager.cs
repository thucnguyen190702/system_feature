using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using FriendSystem.Core;
using FriendSystem.Models;
using FriendSystem.Config;

namespace FriendSystem.Managers
{
    public class SearchManager : MonoBehaviour
    {
        private static SearchManager _instance;
        public static SearchManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    GameObject go = new GameObject("SearchManager");
                    _instance = go.AddComponent<SearchManager>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        [SerializeField] private FriendSystemConfig config;
        private ApiClient apiClient;

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
        /// Searches for accounts by username
        /// Requirements: 2.1
        /// </summary>
        public async Task<List<InGameAccount>> SearchByUsername(string username)
        {
            try
            {
                if (string.IsNullOrEmpty(username))
                {
                    throw new ArgumentException("Username cannot be empty");
                }

                var accounts = await apiClient.GetAsync<List<InGameAccount>>($"/api/search/username?q={Uri.EscapeDataString(username)}");
                
                Debug.Log($"Search by username completed: {accounts.Count} accounts found");
                return accounts;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to search by username: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Searches for a single account by ID
        /// Requirements: 2.2
        /// </summary>
        public async Task<InGameAccount> SearchById(string accountId)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                var account = await apiClient.GetAsync<InGameAccount>($"/api/search/id/{accountId}");
                
                Debug.Log($"Search by ID completed: {account.Username}");
                return account;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to search by ID: {ex.Message}");
                throw;
            }
        }
    }
}
