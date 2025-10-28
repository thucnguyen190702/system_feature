using UnityEngine;
using UnityEngine.UI;
using TMPro;
using FriendSystem.Models;

namespace FriendSystem.UI
{
    /// <summary>
    /// UI component for individual friend request items
    /// Requirements: 2.4, 2.5, 4.2, 4.5
    /// </summary>
    public class FriendRequestItemUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI displayNameText;
        [SerializeField] private TextMeshProUGUI usernameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private TextMeshProUGUI timeText;
        [SerializeField] private Image avatarImage;
        [SerializeField] private Button acceptButton;
        [SerializeField] private Button rejectButton;
        [SerializeField] private Button viewProfileButton;
        [SerializeField] private GameObject processingIndicator;

        private FriendRequest requestData;
        private InGameAccount senderAccount;
        private FriendRequestUI parentUI;
        private bool isProcessing = false;

        /// <summary>
        /// Initializes the friend request item with data
        /// </summary>
        public void Initialize(FriendRequest request, InGameAccount sender, FriendRequestUI parent)
        {
            requestData = request;
            senderAccount = sender;
            parentUI = parent;

            UpdateDisplay();
            SetupButtons();
        }

        /// <summary>
        /// Updates the display with request data
        /// Requirements: 2.4, 4.5
        /// </summary>
        private void UpdateDisplay()
        {
            if (senderAccount == null) return;

            // Display name
            if (displayNameText != null)
            {
                displayNameText.text = senderAccount.DisplayName;
            }

            // Username
            if (usernameText != null)
            {
                usernameText.text = $"@{senderAccount.Username}";
            }

            // Level
            if (levelText != null)
            {
                levelText.text = $"Lv.{senderAccount.Level}";
            }

            // Time ago
            if (timeText != null && requestData != null)
            {
                timeText.text = GetTimeAgo(requestData.CreatedAt);
            }

            // Avatar (placeholder for now)
            if (avatarImage != null && !string.IsNullOrEmpty(senderAccount.AvatarUrl))
            {
                // TODO: Load avatar from URL
            }

            // Hide processing indicator initially
            if (processingIndicator != null)
            {
                processingIndicator.SetActive(false);
            }
        }

        /// <summary>
        /// Converts timestamp to "time ago" format
        /// </summary>
        private string GetTimeAgo(string timestamp)
        {
            try
            {
                if (string.IsNullOrEmpty(timestamp))
                    return "Vừa xong";

                System.DateTime createdTime = System.DateTime.Parse(timestamp);
                System.TimeSpan timeDiff = System.DateTime.Now - createdTime;

                if (timeDiff.TotalMinutes < 1)
                    return "Vừa xong";
                else if (timeDiff.TotalMinutes < 60)
                    return $"{(int)timeDiff.TotalMinutes} phút trước";
                else if (timeDiff.TotalHours < 24)
                    return $"{(int)timeDiff.TotalHours} giờ trước";
                else if (timeDiff.TotalDays < 7)
                    return $"{(int)timeDiff.TotalDays} ngày trước";
                else
                    return createdTime.ToString("dd/MM/yyyy");
            }
            catch
            {
                return "Vừa xong";
            }
        }

        /// <summary>
        /// Sets up button listeners
        /// </summary>
        private void SetupButtons()
        {
            if (acceptButton != null)
            {
                acceptButton.onClick.AddListener(OnAcceptButtonClicked);
            }

            if (rejectButton != null)
            {
                rejectButton.onClick.AddListener(OnRejectButtonClicked);
            }

            if (viewProfileButton != null)
            {
                viewProfileButton.onClick.AddListener(OnViewProfileButtonClicked);
            }
        }

        /// <summary>
        /// Handles accept button click
        /// Requirements: 2.5, 4.2
        /// </summary>
        private void OnAcceptButtonClicked()
        {
            if (isProcessing || parentUI == null || requestData == null)
                return;

            parentUI.OnAcceptRequest(requestData, this);
        }

        /// <summary>
        /// Handles reject button click
        /// Requirements: 2.5, 4.2
        /// </summary>
        private void OnRejectButtonClicked()
        {
            if (isProcessing || parentUI == null || requestData == null)
                return;

            parentUI.OnRejectRequest(requestData, this);
        }

        /// <summary>
        /// Handles view profile button click
        /// </summary>
        private void OnViewProfileButtonClicked()
        {
            if (parentUI != null && senderAccount != null)
            {
                parentUI.OnViewProfile(senderAccount);
            }
        }

        /// <summary>
        /// Shows processing state (disables buttons, shows indicator)
        /// </summary>
        public void SetProcessing(bool processing)
        {
            isProcessing = processing;

            if (acceptButton != null)
            {
                acceptButton.interactable = !processing;
            }

            if (rejectButton != null)
            {
                rejectButton.interactable = !processing;
            }

            if (processingIndicator != null)
            {
                processingIndicator.SetActive(processing);
            }
        }

        /// <summary>
        /// Gets the request ID
        /// </summary>
        public string GetRequestId()
        {
            return requestData?.RequestId;
        }

        private void OnDestroy()
        {
            if (acceptButton != null)
            {
                acceptButton.onClick.RemoveListener(OnAcceptButtonClicked);
            }

            if (rejectButton != null)
            {
                rejectButton.onClick.RemoveListener(OnRejectButtonClicked);
            }

            if (viewProfileButton != null)
            {
                viewProfileButton.onClick.RemoveListener(OnViewProfileButtonClicked);
            }
        }
    }
}
