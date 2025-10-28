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
    /// Main UI controller for the Friend List panel
    /// Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.5
    /// </summary>
    public class FriendListUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject friendItemPrefab;
        [SerializeField] private Transform friendListContainer;
        [SerializeField] private ScrollRect scrollRect;
        [SerializeField] private TMP_InputField searchInputField;
        [SerializeField] private TMP_Dropdown sortDropdown;
        [SerializeField] private TextMeshProUGUI friendCountText;
        [SerializeField] private Button refreshButton;
        [SerializeField] private GameObject loadingIndicator;
        [SerializeField] private GameObject emptyStatePanel;
        [SerializeField] private TextMeshProUGUI emptyStateText;

        [Header("Settings")]
        [SerializeField] private int maxFriends = 100;
        [SerializeField] private ProfileUI profileUI;

        private List<InGameAccount> allFriends = new List<InGameAccount>();
        private List<InGameAccount> filteredFriends = new List<InGameAccount>();
        private List<FriendItemUI> friendItemUIList = new List<FriendItemUI>();
        private string currentAccountId;

        public enum SortOption
        {
            Name,
            Level,
            OnlineStatus
        }

        private void Start()
        {
            InitializeUI();
        }

        private void InitializeUI()
        {
            if (searchInputField != null)
            {
                searchInputField.onValueChanged.AddListener(OnSearchTextChanged);
            }

            if (sortDropdown != null)
            {
                sortDropdown.onValueChanged.AddListener(OnSortOptionChanged);
                PopulateSortDropdown();
            }

            if (refreshButton != null)
            {
                refreshButton.onClick.AddListener(OnRefreshButtonClicked);
            }

            UpdateFriendCountDisplay();
            ShowEmptyState(true);
        }

        private void PopulateSortDropdown()
        {
            sortDropdown.ClearOptions();
            List<string> options = new List<string>
            {
                "Tên",
                "Cấp độ",
                "Trạng thái Online"
            };
            sortDropdown.AddOptions(options);
        }

        /// <summary>
        /// Loads and displays the friend list for the current account
        /// Requirements: 3.1, 3.2, 3.3
        /// </summary>
        public async void LoadFriendList(string accountId)
        {
            currentAccountId = accountId;
            ShowLoading(true);

            try
            {
                allFriends = await FriendManager.Instance.GetFriendList(accountId);
                
                // Get online status for all friends
                if (allFriends.Count > 0)
                {
                    var accountIds = allFriends.Select(f => f.AccountId).ToList();
                    var onlineStatuses = await FriendManager.Instance.GetFriendsOnlineStatus(accountIds);
                    
                    // Update online status
                    foreach (var friend in allFriends)
                    {
                        if (onlineStatuses.ContainsKey(friend.AccountId))
                        {
                            friend.IsOnline = onlineStatuses[friend.AccountId];
                        }
                    }
                }

                filteredFriends = new List<InGameAccount>(allFriends);
                ApplySorting((SortOption)sortDropdown.value);
                DisplayFriendList();
                UpdateFriendCountDisplay();
                ShowEmptyState(allFriends.Count == 0);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load friend list: {ex.Message}");
                ShowError("Không thể tải danh sách bạn bè");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Displays the friend list in the UI
        /// </summary>
        private void DisplayFriendList()
        {
            // Clear existing items
            ClearFriendList();

            // Create UI items for each friend
            foreach (var friend in filteredFriends)
            {
                GameObject itemObj = Instantiate(friendItemPrefab, friendListContainer);
                FriendItemUI itemUI = itemObj.GetComponent<FriendItemUI>();
                
                if (itemUI != null)
                {
                    itemUI.Initialize(friend, this);
                    friendItemUIList.Add(itemUI);
                }
            }
        }

        /// <summary>
        /// Clears all friend items from the UI
        /// </summary>
        private void ClearFriendList()
        {
            foreach (var item in friendItemUIList)
            {
                if (item != null)
                {
                    Destroy(item.gameObject);
                }
            }
            friendItemUIList.Clear();
        }

        /// <summary>
        /// Handles search text changes
        /// Requirements: 4.2
        /// </summary>
        private void OnSearchTextChanged(string searchText)
        {
            if (string.IsNullOrEmpty(searchText))
            {
                filteredFriends = new List<InGameAccount>(allFriends);
            }
            else
            {
                string lowerSearch = searchText.ToLower();
                filteredFriends = allFriends.Where(f =>
                    f.DisplayName.ToLower().Contains(lowerSearch) ||
                    f.Username.ToLower().Contains(lowerSearch)
                ).ToList();
            }

            ApplySorting((SortOption)sortDropdown.value);
            DisplayFriendList();
        }

        /// <summary>
        /// Handles sort option changes
        /// Requirements: 4.3
        /// </summary>
        private void OnSortOptionChanged(int optionIndex)
        {
            ApplySorting((SortOption)optionIndex);
            DisplayFriendList();
        }

        /// <summary>
        /// Applies sorting to the filtered friend list
        /// Requirements: 4.3
        /// </summary>
        private void ApplySorting(SortOption sortOption)
        {
            switch (sortOption)
            {
                case SortOption.Name:
                    filteredFriends = filteredFriends.OrderBy(f => f.DisplayName).ToList();
                    break;
                case SortOption.Level:
                    filteredFriends = filteredFriends.OrderByDescending(f => f.Level).ToList();
                    break;
                case SortOption.OnlineStatus:
                    filteredFriends = filteredFriends.OrderByDescending(f => f.IsOnline)
                        .ThenBy(f => f.DisplayName).ToList();
                    break;
            }
        }

        /// <summary>
        /// Updates the friend count display
        /// Requirements: 3.5, 4.4
        /// </summary>
        private void UpdateFriendCountDisplay()
        {
            if (friendCountText != null)
            {
                friendCountText.text = $"Bạn bè: {allFriends.Count}/{maxFriends}";
            }
        }

        /// <summary>
        /// Handles refresh button click
        /// </summary>
        private void OnRefreshButtonClicked()
        {
            if (!string.IsNullOrEmpty(currentAccountId))
            {
                LoadFriendList(currentAccountId);
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
        private void ShowEmptyState(bool show)
        {
            if (emptyStatePanel != null)
            {
                emptyStatePanel.SetActive(show);
            }
        }

        /// <summary>
        /// Shows an error message
        /// </summary>
        private void ShowError(string message)
        {
            Debug.LogError(message);
            // TODO: Implement error popup UI
        }

        /// <summary>
        /// Called when a friend is removed
        /// Requirements: 3.4
        /// </summary>
        public async void OnFriendRemoved(string friendAccountId)
        {
            try
            {
                bool success = await FriendManager.Instance.RemoveFriend(friendAccountId);
                
                if (success)
                {
                    // Remove from local lists
                    allFriends.RemoveAll(f => f.AccountId == friendAccountId);
                    filteredFriends.RemoveAll(f => f.AccountId == friendAccountId);
                    
                    DisplayFriendList();
                    UpdateFriendCountDisplay();
                    ShowEmptyState(allFriends.Count == 0);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to remove friend: {ex.Message}");
                ShowError("Không thể xóa bạn bè");
            }
        }

        /// <summary>
        /// Called when a friend profile is clicked
        /// Requirements: 4.3, 4.4, 2.3, 4.5
        /// </summary>
        public void OnFriendProfileClicked(InGameAccount friend)
        {
            Debug.Log($"Profile clicked for: {friend.DisplayName}");
            
            if (profileUI != null)
            {
                profileUI.SetCurrentAccount(currentAccountId);
                profileUI.ShowProfile(friend);
            }
            else
            {
                Debug.LogWarning("ProfileUI reference not set in FriendListUI");
            }
        }

        private void OnDestroy()
        {
            if (searchInputField != null)
            {
                searchInputField.onValueChanged.RemoveListener(OnSearchTextChanged);
            }

            if (sortDropdown != null)
            {
                sortDropdown.onValueChanged.RemoveListener(OnSortOptionChanged);
            }

            if (refreshButton != null)
            {
                refreshButton.onClick.RemoveListener(OnRefreshButtonClicked);
            }
        }
    }
}
