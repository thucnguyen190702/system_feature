using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using FriendSystem.Managers;
using FriendSystem.Models;

namespace FriendSystem.UI
{
    /// <summary>
    /// Main UI controller for the Friend Request panel
    /// Requirements: 2.4, 2.5, 4.2, 4.5
    /// </summary>
    public class FriendRequestUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject friendRequestItemPrefab;
        [SerializeField] private Transform requestListContainer;
        [SerializeField] private ScrollRect scrollRect;
        [SerializeField] private Button refreshButton;
        [SerializeField] private GameObject loadingIndicator;
        [SerializeField] private GameObject emptyStatePanel;
        [SerializeField] private TextMeshProUGUI emptyStateText;
        [SerializeField] private TextMeshProUGUI requestCountText;
        [SerializeField] private GameObject notificationPanel;
        [SerializeField] private TextMeshProUGUI notificationText;

        [Header("Settings")]
        [SerializeField] private float refreshInterval = 30f;
        [SerializeField] private float notificationDuration = 3f;

        private List<FriendRequest> pendingRequests = new List<FriendRequest>();
        private List<FriendRequestItemUI> requestItemUIList = new List<FriendRequestItemUI>();
        private Dictionary<string, InGameAccount> senderAccountCache = new Dictionary<string, InGameAccount>();
        private string currentAccountId;
        private float lastRefreshTime;

        public event Action<int> OnRequestCountChanged;

        private void Start()
        {
            InitializeUI();
        }

        private void Update()
        {
            // Auto-refresh pending requests periodically
            if (!string.IsNullOrEmpty(currentAccountId) && 
                Time.time - lastRefreshTime > refreshInterval)
            {
                LoadPendingRequests(currentAccountId);
            }
        }

        private void InitializeUI()
        {
            if (refreshButton != null)
            {
                refreshButton.onClick.AddListener(OnRefreshButtonClicked);
            }

            ShowEmptyState(true, "Không có lời mời kết bạn nào");
            HideNotification();
        }

        /// <summary>
        /// Loads and displays pending friend requests
        /// Requirements: 2.4, 4.2, 4.5
        /// </summary>
        public async void LoadPendingRequests(string accountId)
        {
            currentAccountId = accountId;
            lastRefreshTime = Time.time;
            ShowLoading(true);

            try
            {
                pendingRequests = await FriendManager.Instance.GetPendingRequests(accountId);
                
                // Load sender account information for each request
                await LoadSenderAccounts();
                
                DisplayPendingRequests();
                UpdateRequestCount();
                ShowEmptyState(pendingRequests.Count == 0, "Không có lời mời kết bạn nào");
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load pending requests: {ex.Message}");
                ShowNotification("Không thể tải danh sách lời mời");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Loads account information for all request senders
        /// </summary>
        private async System.Threading.Tasks.Task LoadSenderAccounts()
        {
            senderAccountCache.Clear();

            foreach (var request in pendingRequests)
            {
                try
                {
                    var account = await AccountManager.Instance.GetAccount(request.FromAccountId);
                    if (account != null)
                    {
                        senderAccountCache[request.FromAccountId] = account;
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogError($"Failed to load sender account {request.FromAccountId}: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Displays pending requests in the UI
        /// </summary>
        private void DisplayPendingRequests()
        {
            ClearRequestList();

            foreach (var request in pendingRequests)
            {
                if (senderAccountCache.TryGetValue(request.FromAccountId, out InGameAccount sender))
                {
                    GameObject itemObj = Instantiate(friendRequestItemPrefab, requestListContainer);
                    FriendRequestItemUI itemUI = itemObj.GetComponent<FriendRequestItemUI>();
                    
                    if (itemUI != null)
                    {
                        itemUI.Initialize(request, sender, this);
                        requestItemUIList.Add(itemUI);
                    }
                }
            }
        }

        /// <summary>
        /// Clears all request items from the UI
        /// </summary>
        private void ClearRequestList()
        {
            foreach (var item in requestItemUIList)
            {
                if (item != null)
                {
                    Destroy(item.gameObject);
                }
            }
            requestItemUIList.Clear();
        }

        /// <summary>
        /// Handles accepting a friend request
        /// Requirements: 2.5, 4.2
        /// </summary>
        public async void OnAcceptRequest(FriendRequest request, FriendRequestItemUI itemUI)
        {
            if (request == null || itemUI == null)
                return;

            itemUI.SetProcessing(true);

            try
            {
                bool success = await FriendManager.Instance.AcceptFriendRequest(request.RequestId);
                
                if (success)
                {
                    // Remove from local list
                    pendingRequests.RemoveAll(r => r.RequestId == request.RequestId);
                    requestItemUIList.Remove(itemUI);
                    Destroy(itemUI.gameObject);
                    
                    UpdateRequestCount();
                    ShowEmptyState(pendingRequests.Count == 0, "Không có lời mời kết bạn nào");
                    
                    if (senderAccountCache.TryGetValue(request.FromAccountId, out InGameAccount sender))
                    {
                        ShowNotification($"Đã chấp nhận lời mời từ {sender.DisplayName}");
                    }
                    else
                    {
                        ShowNotification("Đã chấp nhận lời mời kết bạn");
                    }
                }
                else
                {
                    ShowNotification("Không thể chấp nhận lời mời");
                    itemUI.SetProcessing(false);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to accept friend request: {ex.Message}");
                ShowNotification("Chấp nhận lời mời thất bại");
                itemUI.SetProcessing(false);
            }
        }

        /// <summary>
        /// Handles rejecting a friend request
        /// Requirements: 2.5, 4.2
        /// </summary>
        public async void OnRejectRequest(FriendRequest request, FriendRequestItemUI itemUI)
        {
            if (request == null || itemUI == null)
                return;

            itemUI.SetProcessing(true);

            try
            {
                // Note: Reject endpoint needs to be implemented on server
                // For now, we'll just remove it from the UI
                // TODO: Implement reject endpoint on server
                
                // Remove from local list
                pendingRequests.RemoveAll(r => r.RequestId == request.RequestId);
                requestItemUIList.Remove(itemUI);
                Destroy(itemUI.gameObject);
                
                UpdateRequestCount();
                ShowEmptyState(pendingRequests.Count == 0, "Không có lời mời kết bạn nào");
                ShowNotification("Đã từ chối lời mời kết bạn");
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to reject friend request: {ex.Message}");
                ShowNotification("Từ chối lời mời thất bại");
                itemUI.SetProcessing(false);
            }
        }

        /// <summary>
        /// Handles viewing a profile from friend requests
        /// </summary>
        public void OnViewProfile(InGameAccount account)
        {
            Debug.Log($"View profile for: {account.DisplayName}");
            // TODO: Open profile UI
            // This will be implemented in task 17
        }

        /// <summary>
        /// Updates the request count display
        /// Requirements: 4.2
        /// </summary>
        private void UpdateRequestCount()
        {
            if (requestCountText != null)
            {
                requestCountText.text = $"Lời mời kết bạn ({pendingRequests.Count})";
            }

            // Notify listeners about count change (for notification badge)
            OnRequestCountChanged?.Invoke(pendingRequests.Count);
        }

        /// <summary>
        /// Gets the current pending request count
        /// </summary>
        public int GetPendingRequestCount()
        {
            return pendingRequests.Count;
        }

        /// <summary>
        /// Handles refresh button click
        /// </summary>
        private void OnRefreshButtonClicked()
        {
            if (!string.IsNullOrEmpty(currentAccountId))
            {
                LoadPendingRequests(currentAccountId);
            }
        }

        /// <summary>
        /// Shows or hides the loading indicator
        /// </summary>
        private void ShowLoading(bool show)
        {
            if (loadingIndicator != null)
            {
                loadingIndicator.SetActive(show);
            }
        }

        /// <summary>
        /// Shows or hides the empty state panel
        /// </summary>
        private void ShowEmptyState(bool show, string message = "")
        {
            if (emptyStatePanel != null)
            {
                emptyStatePanel.SetActive(show);
            }

            if (emptyStateText != null && !string.IsNullOrEmpty(message))
            {
                emptyStateText.text = message;
            }
        }

        /// <summary>
        /// Shows a notification message
        /// Requirements: 4.2
        /// </summary>
        private void ShowNotification(string message)
        {
            if (notificationPanel != null)
            {
                notificationPanel.SetActive(true);
            }

            if (notificationText != null)
            {
                notificationText.text = message;
            }

            // Auto-hide after a delay
            Invoke(nameof(HideNotification), notificationDuration);
        }

        /// <summary>
        /// Hides the notification panel
        /// </summary>
        private void HideNotification()
        {
            if (notificationPanel != null)
            {
                notificationPanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (refreshButton != null)
            {
                refreshButton.onClick.RemoveListener(OnRefreshButtonClicked);
            }
        }
    }
}
