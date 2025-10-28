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
    /// Main UI controller for the Profile panel
    /// Displays account information and provides friend management actions
    /// Requirements: 2.3, 4.4, 4.5
    /// </summary>
    public class ProfileUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject profilePanel;
        [SerializeField] private TextMeshProUGUI displayNameText;
        [SerializeField] private TextMeshProUGUI usernameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Image avatarImage;
        [SerializeField] private GameObject onlineStatusIndicator;
        [SerializeField] private TextMeshProUGUI onlineStatusText;
        [SerializeField] private TextMeshProUGUI lastSeenText;
        [SerializeField] private Button sendFriendRequestButton;
        [SerializeField] private Button removeFriendButton;
        [SerializeField] private Button closeButton;
        [SerializeField] private GameObject loadingIndicator;
        [SerializeField] private GameObject notificationPanel;
        [SerializeField] private TextMeshProUGUI notificationText;

        [Header("Colors")]
        [SerializeField] private Color onlineColor = Color.green;
        [SerializeField] private Color offlineColor = Color.gray;

        [Header("Settings")]
        [SerializeField] private float notificationDuration = 3f;

        private InGameAccount currentProfile;
        private string currentAccountId;
        private bool isFriend;
        private bool hasPendingRequest;

        private void Start()
        {
            InitializeUI();
            HideProfile();
        }

        private void InitializeUI()
        {
            if (closeButton != null)
            {
                closeButton.onClick.AddListener(OnCloseButtonClicked);
            }

            if (sendFriendRequestButton != null)
            {
                sendFriendRequestButton.onClick.AddListener(OnSendFriendRequestClicked);
            }

            if (removeFriendButton != null)
            {
                removeFriendButton.onClick.AddListener(OnRemoveFriendClicked);
            }

            HideNotification();
        }

        /// <summary>
        /// Sets the current logged-in account ID
        /// </summary>
        public void SetCurrentAccount(string accountId)
        {
            currentAccountId = accountId;
        }

        /// <summary>
        /// Shows the profile for the specified account
        /// Requirements: 2.3, 4.4, 4.5
        /// </summary>
        public async void ShowProfile(InGameAccount account)
        {
            if (account == null)
            {
                Debug.LogError("Cannot show profile: account is null");
                return;
            }

            currentProfile = account;
            
            // Check if this account is already a friend
            await CheckFriendStatus();

            // Update the display
            UpdateProfileDisplay();

            // Show the panel
            if (profilePanel != null)
            {
                profilePanel.SetActive(true);
            }
        }

        /// <summary>
        /// Checks if the profile account is already a friend
        /// </summary>
        private async System.Threading.Tasks.Task CheckFriendStatus()
        {
            try
            {
                if (string.IsNullOrEmpty(currentAccountId))
                {
                    isFriend = false;
                    return;
                }

                var friendList = await FriendManager.Instance.GetFriendList(currentAccountId);
                isFriend = friendList.Any(f => f.AccountId == currentProfile.AccountId);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to check friend status: {ex.Message}");
                isFriend = false;
            }
        }

        /// <summary>
        /// Updates the profile display with account data
        /// Requirements: 2.3, 4.4, 4.5
        /// </summary>
        private void UpdateProfileDisplay()
        {
            if (currentProfile == null) return;

            // Display name
            if (displayNameText != null)
            {
                displayNameText.text = currentProfile.DisplayName;
            }

            // Username
            if (usernameText != null)
            {
                usernameText.text = $"@{currentProfile.Username}";
            }

            // Level
            if (levelText != null)
            {
                levelText.text = $"Level {currentProfile.Level}";
            }

            // Avatar (placeholder for now)
            if (avatarImage != null && !string.IsNullOrEmpty(currentProfile.AvatarUrl))
            {
                // TODO: Load avatar from URL
                // This would require a sprite loading system
            }

            // Online status
            UpdateOnlineStatus(currentProfile.IsOnline);

            // Last seen
            UpdateLastSeen(currentProfile.LastSeenAt);

            // Update button visibility
            UpdateButtonStates();
        }

        /// <summary>
        /// Updates the online status indicator and text
        /// Requirements: 3.1, 3.3
        /// </summary>
        private void UpdateOnlineStatus(bool isOnline)
        {
            if (onlineStatusIndicator != null)
            {
                onlineStatusIndicator.SetActive(true);
                Image indicator = onlineStatusIndicator.GetComponent<Image>();
                if (indicator != null)
                {
                    indicator.color = isOnline ? onlineColor : offlineColor;
                }
            }

            if (onlineStatusText != null)
            {
                onlineStatusText.text = isOnline ? "Đang online" : "Offline";
                onlineStatusText.color = isOnline ? onlineColor : offlineColor;
            }
        }

        /// <summary>
        /// Updates the last seen text
        /// Requirements: 3.3
        /// </summary>
        private void UpdateLastSeen(string lastSeenAt)
        {
            if (lastSeenText == null) return;

            if (currentProfile.IsOnline)
            {
                lastSeenText.text = "";
                return;
            }

            if (string.IsNullOrEmpty(lastSeenAt))
            {
                lastSeenText.text = "Chưa từng online";
                return;
            }

            try
            {
                DateTime lastSeen = DateTime.Parse(lastSeenAt);
                TimeSpan timeSince = DateTime.Now - lastSeen;

                if (timeSince.TotalMinutes < 1)
                {
                    lastSeenText.text = "Vừa mới offline";
                }
                else if (timeSince.TotalHours < 1)
                {
                    lastSeenText.text = $"Offline {(int)timeSince.TotalMinutes} phút trước";
                }
                else if (timeSince.TotalDays < 1)
                {
                    lastSeenText.text = $"Offline {(int)timeSince.TotalHours} giờ trước";
                }
                else if (timeSince.TotalDays < 7)
                {
                    lastSeenText.text = $"Offline {(int)timeSince.TotalDays} ngày trước";
                }
                else
                {
                    lastSeenText.text = $"Offline {lastSeen:dd/MM/yyyy}";
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to parse last seen date: {ex.Message}");
                lastSeenText.text = "";
            }
        }

        /// <summary>
        /// Updates button visibility based on friend status
        /// Requirements: 2.3, 4.4
        /// </summary>
        private void UpdateButtonStates()
        {
            // Don't show any action buttons if viewing own profile
            bool isOwnProfile = currentProfile.AccountId == currentAccountId;

            if (sendFriendRequestButton != null)
            {
                sendFriendRequestButton.gameObject.SetActive(!isOwnProfile && !isFriend && !hasPendingRequest);
            }

            if (removeFriendButton != null)
            {
                removeFriendButton.gameObject.SetActive(!isOwnProfile && isFriend);
            }
        }

        /// <summary>
        /// Handles send friend request button click
        /// Requirements: 2.4, 4.2
        /// </summary>
        private async void OnSendFriendRequestClicked()
        {
            if (currentProfile == null) return;

            try
            {
                ShowLoading(true);
                bool success = await FriendManager.Instance.SendFriendRequest(currentProfile.AccountId);

                if (success)
                {
                    ShowNotification($"Đã gửi lời mời kết bạn đến {currentProfile.DisplayName}");
                    hasPendingRequest = true;
                    UpdateButtonStates();
                }
                else
                {
                    ShowNotification("Không thể gửi lời mời kết bạn");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to send friend request: {ex.Message}");
                ShowNotification("Gửi lời mời thất bại. Vui lòng thử lại.");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Handles remove friend button click
        /// Requirements: 3.4, 4.3
        /// </summary>
        private async void OnRemoveFriendClicked()
        {
            if (currentProfile == null) return;

            // Show confirmation dialog
            bool confirmed = ShowRemoveConfirmation();
            if (!confirmed) return;

            try
            {
                ShowLoading(true);
                bool success = await FriendManager.Instance.RemoveFriend(currentProfile.AccountId);

                if (success)
                {
                    ShowNotification($"Đã xóa {currentProfile.DisplayName} khỏi danh sách bạn bè");
                    isFriend = false;
                    UpdateButtonStates();
                }
                else
                {
                    ShowNotification("Không thể xóa bạn bè");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to remove friend: {ex.Message}");
                ShowNotification("Xóa bạn bè thất bại. Vui lòng thử lại.");
            }
            finally
            {
                ShowLoading(false);
            }
        }

        /// <summary>
        /// Shows a confirmation dialog for removing a friend
        /// </summary>
        private bool ShowRemoveConfirmation()
        {
            // TODO: Implement proper confirmation dialog UI
            // For now, just return true
            Debug.Log($"Removing friend: {currentProfile.DisplayName}");
            return true;
        }

        /// <summary>
        /// Handles close button click
        /// </summary>
        private void OnCloseButtonClicked()
        {
            HideProfile();
        }

        /// <summary>
        /// Hides the profile panel
        /// </summary>
        public void HideProfile()
        {
            if (profilePanel != null)
            {
                profilePanel.SetActive(false);
            }

            currentProfile = null;
            isFriend = false;
            hasPendingRequest = false;
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
            if (closeButton != null)
            {
                closeButton.onClick.RemoveListener(OnCloseButtonClicked);
            }

            if (sendFriendRequestButton != null)
            {
                sendFriendRequestButton.onClick.RemoveListener(OnSendFriendRequestClicked);
            }

            if (removeFriendButton != null)
            {
                removeFriendButton.onClick.RemoveListener(OnRemoveFriendClicked);
            }
        }
    }
}
