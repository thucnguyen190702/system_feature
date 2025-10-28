using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using FriendSystem.Core;
using FriendSystem.Models;
using FriendSystem.Config;

namespace FriendSystem.Managers
{
    public class FriendManager : MonoBehaviour
    {
        private static FriendManager _instance;
        public static FriendManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    GameObject go = new GameObject("FriendManager");
                    _instance = go.AddComponent<FriendManager>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        [SerializeField] private FriendSystemConfig config;
        private ApiClient apiClient;
        private List<InGameAccount> cachedFriendList = new List<InGameAccount>();
        private string currentAccountId;

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

        public void SetCurrentAccountId(string accountId)
        {
            currentAccountId = accountId;
        }

        /// <summary>
        /// Gets the friend list for the specified account
        /// Caches the result locally for performance
        /// Requirements: 3.1, 3.2, 3.3, 6.1
        /// </summary>
        public async Task<List<InGameAccount>> GetFriendList(string accountId)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                cachedFriendList = await apiClient.GetAsync<List<InGameAccount>>($"/api/friends/{accountId}");
                
                Debug.Log($"Friend list retrieved successfully: {cachedFriendList.Count} friends");
                return cachedFriendList;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to get friend list: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Sends a friend request to another account
        /// Requirements: 2.4, 6.2
        /// </summary>
        public async Task<bool> SendFriendRequest(string toAccountId)
        {
            try
            {
                if (string.IsNullOrEmpty(toAccountId))
                {
                    throw new ArgumentException("Target account ID cannot be empty");
                }

                var requestData = new { toAccountId = toAccountId };
                var response = await apiClient.PostAsync<ApiResponse>("/api/friend-requests", requestData);
                
                Debug.Log($"Friend request sent successfully to: {toAccountId}");
                return response.Success;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to send friend request: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Accepts a friend request and refreshes the friend list
        /// Requirements: 2.5
        /// </summary>
        public async Task<bool> AcceptFriendRequest(string requestId)
        {
            try
            {
                if (string.IsNullOrEmpty(requestId))
                {
                    throw new ArgumentException("Request ID cannot be empty");
                }

                var response = await apiClient.PostAsync<ApiResponse>($"/api/friend-requests/{requestId}/accept", null);
                
                if (response.Success && !string.IsNullOrEmpty(currentAccountId))
                {
                    // Refresh friend list after accepting request
                    await GetFriendList(currentAccountId);
                }
                
                Debug.Log($"Friend request accepted successfully: {requestId}");
                return response.Success;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to accept friend request: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Removes a friend and updates the local friend list
        /// Requirements: 3.4
        /// </summary>
        public async Task<bool> RemoveFriend(string friendAccountId)
        {
            try
            {
                if (string.IsNullOrEmpty(friendAccountId))
                {
                    throw new ArgumentException("Friend account ID cannot be empty");
                }

                var response = await apiClient.DeleteAsync<ApiResponse>($"/api/friends/{friendAccountId}");
                
                if (response.Success)
                {
                    // Update local friend list by removing the friend
                    cachedFriendList.RemoveAll(friend => friend.AccountId == friendAccountId);
                    Debug.Log($"Friend removed successfully: {friendAccountId}");
                }
                
                return response.Success;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to remove friend: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets pending friend requests for the specified account
        /// Requirements: 2.4
        /// </summary>
        public async Task<List<FriendRequest>> GetPendingRequests(string accountId)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                var requests = await apiClient.GetAsync<List<FriendRequest>>($"/api/friend-requests/{accountId}/pending");
                
                Debug.Log($"Pending requests retrieved successfully: {requests.Count} requests");
                return requests;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to get pending requests: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Updates the online status of the player
        /// Should be called when player logs in/out
        /// Requirements: 3.1, 3.3
        /// </summary>
        public async Task<bool> UpdateOnlineStatus(string accountId, bool isOnline)
        {
            try
            {
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be empty");
                }

                var requestData = new { accountId = accountId, isOnline = isOnline };
                var response = await apiClient.PostAsync<ApiResponse>("/api/friends/status", requestData);
                
                Debug.Log($"Online status updated successfully: {isOnline}");
                return response.Success;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to update online status: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets the online status of multiple friends
        /// Returns a dictionary mapping account IDs to their online status
        /// Requirements: 3.1, 3.3
        /// </summary>
        public async Task<Dictionary<string, bool>> GetFriendsOnlineStatus(List<string> accountIds)
        {
            try
            {
                if (accountIds == null || accountIds.Count == 0)
                {
                    throw new ArgumentException("Account IDs list cannot be empty");
                }

                var requestData = new { accountIds = accountIds };
                var statuses = await apiClient.PostAsync<Dictionary<string, bool>>("/api/friends/status/batch", requestData);
                
                Debug.Log($"Friends online status retrieved successfully: {statuses.Count} statuses");
                return statuses;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to get friends online status: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets the cached friend list without making an API call
        /// </summary>
        public List<InGameAccount> GetCachedFriendList()
        {
            return new List<InGameAccount>(cachedFriendList);
        }

        /// <summary>
        /// Clears the cached friend list
        /// </summary>
        public void ClearCache()
        {
            cachedFriendList.Clear();
        }
    }
}
