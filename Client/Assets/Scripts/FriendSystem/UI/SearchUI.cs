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
    /// Main UI controller for the Search panel
    /// Requirements: 2.1, 2.2, 2.3, 4.2, 4.5
    /// </summary>
    public class SearchUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TMP_InputField searchInputField;
        [SerializeField] private Button searchButton;
        [SerializeField] private TMP_Dropdown searchTypeDropdown;
        [SerializeField] private GameObject searchResultItemPrefab;
        [SerializeField] private Transform searchResultsContainer;
        [SerializeField] private ScrollRect scrollRect;
        [SerializeField] private GameObject loadingIndicator;
        [SerializeField] private GameObject emptyStatePanel;
        [SerializeField] private TextMeshProUGUI emptyStateText;
        [SerializeField] private GameObject errorPanel;
        [SerializeField] private TextMeshProUGUI errorText;
        [SerializeField] private GameObject notificationPanel;
        [SerializeField] private TextMeshProUGUI notificationText;

        [Header("Settings")]
        [SerializeField] private float notificationDuration = 3f;
        [SerializeField] private ProfileUI profileUI;

        private List<InGameAccount> searchResults = new List<InGameAccount>();
        private List<SearchResultItemUI> resultItemUIList = new List<SearchResultItemUI>();
        private List<InGameAccount> currentFriendList = new List<InGameAccount>();
        private string currentAccountId;

        public enum SearchType
        {
            Username,
            AccountId
        }

        private void Start()
        {
            InitializeUI();
        }

        private void InitializeUI()
        {
            if (searchButton != null)
            {
                searchButton.onClick.AddListener(OnSearchButtonClicked);
            }

            if (searchInputField != null)
            {
                searchInputField.onSubmit.AddListener(OnSearchSubmit);
            }

            if (searchTypeDropdown != null)
            {
                searchTypeDropdown.onValueChanged.AddListener(OnSearchTypeChanged);
                PopulateSearchTypeDropdown();
            }

            ShowEmptyState(true, "Nhập tên người dùng hoặc ID để tìm kiếm");
            HideError();
            HideNotification();
        }

        private void PopulateSearchTypeDropdown()
        {
            searchTypeDropdown.ClearOptions();
            List<string> options = new List<string>
            {
                "Tìm theo tên",
                "Tìm theo ID"
            };
            searchTypeDropdown.AddOptions(options);
        }

        /// <summary>
        /// Sets the current account ID and loads friend list for comparison
        /// </summary>
        public async void SetCurrentAccount(string accountId)
        {
            currentAccountId = accountId;
            
            try
            {
                // Load current friend list to check if search results are already friends
                currentFriendList = await FriendManager.Instance.GetFriendList(accountId);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load friend list: {ex.Message}");
            }
        }

        /// <summary>
        /// Handles search button click
        /// </summary>
        private void OnSearchButtonClicked()
        {
            PerformSearch();
        }

        /// <summary>
        /// Handles search input submit (Enter key)
        /// </summary>
        private void OnSearchSubmit(string searchText)
        {
            PerformSearch();
        }

        /// <summary>
        /// Handles search type dropdown change
        /// </summary>
        private void OnSearchTypeChanged(int typeIndex)
        {
            // Update placeholder text based on search type
            if (searchInputField != null)
            {
                SearchType searchType = (SearchType)typeIndex;
                searchInputField.placeholder.GetComponent<TextMeshProUGUI>().text = 
                    searchType == SearchType.Username ? "Nhập tên người dùng..." : "Nhập ID tài khoản...";
            }
        }

        /// <summary>
        /// Performs the search based on current search type
        /// Requirements: 2.1, 2.2
        /// </summary>
        private async void PerformSearch()
        {
            string searchText = searchInputField.text.Trim();
            
            if (string.IsNullOrEmpty(searchText))
            {
                ShowError("Vui lòng nhập từ khóa tìm kiếm");
                return;
            }

            SearchType searchType = (SearchType)searchTypeDropdown.value;
            ShowLoading(true);
            HideError();
            HideEmptyState();

            try
            {
                if (searchType == SearchType.Username)
                {
                    // Search by username
                    searchResults = await SearchManager.Instance.SearchByUsername(searchText);
                }
                else
                {
                    // Search by ID
                    InGameAccount account = await SearchManager.Instance.SearchById(searchText);
                    searchResults = account != null ? new List<InGameAccount> { account } : new List<InGameAccount>();
                }

                DisplaySearchResults();

                if (searchResults.Count == 0)
                {
                    ShowEmptyState(true, "Không tìm thấy kết quả");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Search failed: {ex.Message}");
                ShowError("Tìm kiếm thất bại. Vui lòng thử lại.");
                ShowEmptyState(true, "Đã xảy ra lỗi");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Displays search results in the UI
        /// Requirements: 2.3, 4.2, 4.5
        /// </summary>
        private void DisplaySearchResults()
        {
            // Clear existing items
            ClearSearchResults();

            // Create UI items for each result
            foreach (var account in searchResults)
            {
                // Skip if it's the current user
                if (account.AccountId == currentAccountId)
                {
                    continue;
                }

                GameObject itemObj = Instantiate(searchResultItemPrefab, searchResultsContainer);
                SearchResultItemUI itemUI = itemObj.GetComponent<SearchResultItemUI>();
                
                if (itemUI != null)
                {
                    // Check if already friends
                    bool isFriend = currentFriendList.Any(f => f.AccountId == account.AccountId);
                    itemUI.Initialize(account, this, isFriend);
                    resultItemUIList.Add(itemUI);
                }
            }
        }

        /// <summary>
        /// Clears all search result items from the UI
        /// </summary>
        private void ClearSearchResults()
        {
            foreach (var item in resultItemUIList)
            {
                if (item != null)
                {
                    Destroy(item.gameObject);
                }
            }
            resultItemUIList.Clear();
        }

        /// <summary>
        /// Handles sending a friend request from search results
        /// Requirements: 2.4, 4.2
        /// </summary>
        public async void OnSendFriendRequest(InGameAccount targetAccount)
        {
            try
            {
                ShowLoading(true);
                bool success = await FriendManager.Instance.SendFriendRequest(targetAccount.AccountId);
                
                if (success)
                {
                    ShowNotification($"Đã gửi lời mời kết bạn đến {targetAccount.DisplayName}");
                    
                    // Update the UI item to show request sent
                    var itemUI = resultItemUIList.FirstOrDefault(item => 
                        item.GetComponent<SearchResultItemUI>() != null);
                    
                    if (itemUI != null)
                    {
                        itemUI.MarkRequestSent();
                    }
                }
                else
                {
                    ShowError("Không thể gửi lời mời kết bạn");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to send friend request: {ex.Message}");
                ShowError("Gửi lời mời thất bại. Vui lòng thử lại.");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Handles viewing a profile from search results
        /// Requirements: 2.3, 4.4, 4.5
        /// </summary>
        public void OnViewProfile(InGameAccount account)
        {
            Debug.Log($"View profile for: {account.DisplayName}");
            
            if (profileUI != null)
            {
                profileUI.SetCurrentAccount(currentAccountId);
                profileUI.ShowProfile(account);
            }
            else
            {
                Debug.LogWarning("ProfileUI reference not set in SearchUI");
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
        /// Hides the empty state panel
        /// </summary>
        private void HideEmptyState()
        {
            ShowEmptyState(false);
        }

        /// <summary>
        /// Shows an error message
        /// </summary>
        private void ShowError(string message)
        {
            if (errorPanel != null)
            {
                errorPanel.SetActive(true);
            }

            if (errorText != null)
            {
                errorText.text = message;
            }

            // Auto-hide after a delay
            Invoke(nameof(HideError), notificationDuration);
        }

        /// <summary>
        /// Hides the error panel
        /// </summary>
        private void HideError()
        {
            if (errorPanel != null)
            {
                errorPanel.SetActive(false);
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

        /// <summary>
        /// Clears the search input and results
        /// </summary>
        public void ClearSearch()
        {
            if (searchInputField != null)
            {
                searchInputField.text = "";
            }

            ClearSearchResults();
            ShowEmptyState(true, "Nhập tên người dùng hoặc ID để tìm kiếm");
        }

        private void OnDestroy()
        {
            if (searchButton != null)
            {
                searchButton.onClick.RemoveListener(OnSearchButtonClicked);
            }

            if (searchInputField != null)
            {
                searchInputField.onSubmit.RemoveListener(OnSearchSubmit);
            }

            if (searchTypeDropdown != null)
            {
                searchTypeDropdown.onValueChanged.RemoveListener(OnSearchTypeChanged);
            }
        }
    }
}
