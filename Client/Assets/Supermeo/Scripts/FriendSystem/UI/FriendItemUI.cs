using UnityEngine;
using UnityEngine.UI;
using TMPro;
using FriendSystem.Models;

namespace FriendSystem.UI
{
    /// <summary>
    /// UI component for individual friend items in the friend list
    /// Requirements: 3.4, 4.3, 4.4
    /// </summary>
    public class FriendItemUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI displayNameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI usernameText;
        [SerializeField] private Image avatarImage;
        [SerializeField] private GameObject onlineIndicator;
        [SerializeField] private GameObject offlineIndicator;
        [SerializeField] private Button profileButton;
        [SerializeField] private Button removeFriendButton;
        [SerializeField] private Image backgroundImage;

        [Header("Colors")]
        [SerializeField] private Color onlineColor = Color.green;
        [SerializeField] private Color offlineColor = Color.gray;

        private InGameAccount friendData;
        private FriendListUI parentUI;

        /// <summary>
        /// Initializes the friend item with data
        /// </summary>
        public void Initialize(InGameAccount friend, FriendListUI parent)
        {
            friendData = friend;
            parentUI = parent;

            UpdateDisplay();
            SetupButtons();
        }

        /// <summary>
        /// Updates the display with friend data
        /// Requirements: 3.1, 3.2, 3.3
        /// </summary>
        private void UpdateDisplay()
        {
            if (friendData == null) return;

            // Display name
            if (displayNameText != null)
            {
                displayNameText.text = friendData.DisplayName;
            }

            // Username
            if (usernameText != null)
            {
                usernameText.text = $"@{friendData.Username}";
            }

            // Level
            if (levelText != null)
            {
                levelText.text = $"Lv.{friendData.Level}";
            }

            // Online status indicator
            UpdateOnlineStatus(friendData.IsOnline);

            // Avatar (placeholder for now)
            if (avatarImage != null && !string.IsNullOrEmpty(friendData.AvatarUrl))
            {
                // TODO: Load avatar from URL
                // This would require a sprite loading system
            }
        }

        /// <summary>
        /// Updates the online status indicator
        /// Requirements: 3.1, 3.3
        /// </summary>
        private void UpdateOnlineStatus(bool isOnline)
        {
            if (onlineIndicator != null)
            {
                onlineIndicator.SetActive(isOnline);
            }

            if (offlineIndicator != null)
            {
                offlineIndicator.SetActive(!isOnline);
            }

            // Optional: Change background color based on online status
            if (backgroundImage != null)
            {
                Color bgColor = backgroundImage.color;
                bgColor.a = isOnline ? 1.0f : 0.7f;
                backgroundImage.color = bgColor;
            }
        }

        /// <summary>
        /// Sets up button listeners
        /// </summary>
        private void SetupButtons()
        {
            if (profileButton != null)
            {
                profileButton.onClick.AddListener(OnProfileButtonClicked);
            }

            if (removeFriendButton != null)
            {
                removeFriendButton.onClick.AddListener(OnRemoveFriendButtonClicked);
            }
        }

        /// <summary>
        /// Handles profile button click
        /// Requirements: 4.3, 4.4
        /// </summary>
        private void OnProfileButtonClicked()
        {
            if (parentUI != null && friendData != null)
            {
                parentUI.OnFriendProfileClicked(friendData);
            }
        }

        /// <summary>
        /// Handles remove friend button click
        /// Requirements: 3.4, 4.3
        /// </summary>
        private void OnRemoveFriendButtonClicked()
        {
            if (parentUI != null && friendData != null)
            {
                // Show confirmation dialog
                bool confirmed = ShowRemoveConfirmation();
                
                if (confirmed)
                {
                    parentUI.OnFriendRemoved(friendData.AccountId);
                }
            }
        }

        /// <summary>
        /// Shows a confirmation dialog for removing a friend
        /// </summary>
        private bool ShowRemoveConfirmation()
        {
            // TODO: Implement proper confirmation dialog UI
            // For now, just return true
            Debug.Log($"Removing friend: {friendData.DisplayName}");
            return true;
        }

        /// <summary>
        /// Updates the online status (can be called externally)
        /// </summary>
        public void SetOnlineStatus(bool isOnline)
        {
            if (friendData != null)
            {
                friendData.IsOnline = isOnline;
                UpdateOnlineStatus(isOnline);
            }
        }

        private void OnDestroy()
        {
            if (profileButton != null)
            {
                profileButton.onClick.RemoveListener(OnProfileButtonClicked);
            }

            if (removeFriendButton != null)
            {
                removeFriendButton.onClick.RemoveListener(OnRemoveFriendButtonClicked);
            }
        }
    }
}
