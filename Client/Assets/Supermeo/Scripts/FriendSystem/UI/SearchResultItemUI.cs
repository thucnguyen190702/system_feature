using UnityEngine;
using UnityEngine.UI;
using TMPro;
using FriendSystem.Models;

namespace FriendSystem.UI
{
    /// <summary>
    /// UI component for individual search result items
    /// Requirements: 4.1, 4.5
    /// </summary>
    public class SearchResultItemUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI displayNameText;
        [SerializeField] private TextMeshProUGUI usernameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Image avatarImage;
        [SerializeField] private Button sendRequestButton;
        [SerializeField] private Button viewProfileButton;
        [SerializeField] private GameObject alreadyFriendIndicator;
        [SerializeField] private GameObject requestSentIndicator;

        private InGameAccount accountData;
        private SearchUI parentUI;
        private bool isFriend;
        private bool requestSent;

        /// <summary>
        /// Initializes the search result item with data
        /// </summary>
        public void Initialize(InGameAccount account, SearchUI parent, bool isFriend = false)
        {
            accountData = account;
            parentUI = parent;
            this.isFriend = isFriend;
            this.requestSent = false;

            UpdateDisplay();
            SetupButtons();
        }

        /// <summary>
        /// Updates the display with account data
        /// Requirements: 2.3, 4.2, 4.5
        /// </summary>
        private void UpdateDisplay()
        {
            if (accountData == null) return;

            // Display name
            if (displayNameText != null)
            {
                displayNameText.text = accountData.DisplayName;
            }

            // Username
            if (usernameText != null)
            {
                usernameText.text = $"@{accountData.Username}";
            }

            // Level
            if (levelText != null)
            {
                levelText.text = $"Lv.{accountData.Level}";
            }

            // Avatar (placeholder for now)
            if (avatarImage != null && !string.IsNullOrEmpty(accountData.AvatarUrl))
            {
                // TODO: Load avatar from URL
            }

            // Update button states
            UpdateButtonStates();
        }

        /// <summary>
        /// Updates button visibility based on friend status
        /// </summary>
        private void UpdateButtonStates()
        {
            if (sendRequestButton != null)
            {
                sendRequestButton.gameObject.SetActive(!isFriend && !requestSent);
            }

            if (alreadyFriendIndicator != null)
            {
                alreadyFriendIndicator.SetActive(isFriend);
            }

            if (requestSentIndicator != null)
            {
                requestSentIndicator.SetActive(requestSent);
            }
        }

        /// <summary>
        /// Sets up button listeners
        /// </summary>
        private void SetupButtons()
        {
            if (sendRequestButton != null)
            {
                sendRequestButton.onClick.AddListener(OnSendRequestButtonClicked);
            }

            if (viewProfileButton != null)
            {
                viewProfileButton.onClick.AddListener(OnViewProfileButtonClicked);
            }
        }

        /// <summary>
        /// Handles send friend request button click
        /// Requirements: 2.4, 4.2
        /// </summary>
        private void OnSendRequestButtonClicked()
        {
            if (parentUI != null && accountData != null)
            {
                parentUI.OnSendFriendRequest(accountData);
            }
        }

        /// <summary>
        /// Handles view profile button click
        /// </summary>
        private void OnViewProfileButtonClicked()
        {
            if (parentUI != null && accountData != null)
            {
                parentUI.OnViewProfile(accountData);
            }
        }

        /// <summary>
        /// Marks this result as having a friend request sent
        /// </summary>
        public void MarkRequestSent()
        {
            requestSent = true;
            UpdateButtonStates();
        }

        private void OnDestroy()
        {
            if (sendRequestButton != null)
            {
                sendRequestButton.onClick.RemoveListener(OnSendRequestButtonClicked);
            }

            if (viewProfileButton != null)
            {
                viewProfileButton.onClick.RemoveListener(OnViewProfileButtonClicked);
            }
        }
    }
}
