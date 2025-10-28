using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace FriendSystem.UI
{
    /// <summary>
    /// Notification badge component that displays the number of pending friend requests
    /// Requirements: 4.2
    /// </summary>
    public class FriendRequestNotificationBadge : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject badgeObject;
        [SerializeField] private TextMeshProUGUI countText;
        [SerializeField] private Image badgeBackground;

        [Header("Settings")]
        [SerializeField] private Color normalColor = Color.red;
        [SerializeField] private Color highlightColor = new Color(1f, 0.3f, 0f); // Orange
        [SerializeField] private int highlightThreshold = 5;
        [SerializeField] private bool animateOnUpdate = true;
        [SerializeField] private float animationDuration = 0.3f;

        [Header("References")]
        [SerializeField] private FriendRequestUI friendRequestUI;

        private int currentCount = 0;
        private bool isAnimating = false;

        private void Start()
        {
            // Subscribe to request count changes
            if (friendRequestUI != null)
            {
                friendRequestUI.OnRequestCountChanged += UpdateBadge;
                
                // Initialize with current count
                UpdateBadge(friendRequestUI.GetPendingRequestCount());
            }
            else
            {
                // Hide badge if no UI reference
                UpdateBadge(0);
            }
        }

        /// <summary>
        /// Updates the badge with the new request count
        /// Requirements: 4.2
        /// </summary>
        public void UpdateBadge(int count)
        {
            currentCount = count;

            if (count > 0)
            {
                ShowBadge(count);
                
                if (animateOnUpdate && !isAnimating)
                {
                    AnimateBadge();
                }
            }
            else
            {
                HideBadge();
            }
        }

        /// <summary>
        /// Shows the badge with the specified count
        /// </summary>
        private void ShowBadge(int count)
        {
            if (badgeObject != null)
            {
                badgeObject.SetActive(true);
            }

            if (countText != null)
            {
                // Display count, or "99+" if over 99
                countText.text = count > 99 ? "99+" : count.ToString();
            }

            // Update color based on threshold
            UpdateBadgeColor(count);
        }

        /// <summary>
        /// Hides the badge
        /// </summary>
        private void HideBadge()
        {
            if (badgeObject != null)
            {
                badgeObject.SetActive(false);
            }
        }

        /// <summary>
        /// Updates the badge color based on count
        /// </summary>
        private void UpdateBadgeColor(int count)
        {
            if (badgeBackground != null)
            {
                badgeBackground.color = count >= highlightThreshold ? highlightColor : normalColor;
            }
        }

        /// <summary>
        /// Animates the badge with a pulse effect
        /// </summary>
        private void AnimateBadge()
        {
            if (isAnimating || badgeObject == null)
                return;

            isAnimating = true;
            StartCoroutine(PulseAnimation());
        }

        /// <summary>
        /// Pulse animation coroutine
        /// </summary>
        private System.Collections.IEnumerator PulseAnimation()
        {
            Vector3 originalScale = badgeObject.transform.localScale;
            Vector3 targetScale = originalScale * 1.3f;
            float elapsed = 0f;

            // Scale up
            while (elapsed < animationDuration / 2)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / (animationDuration / 2);
                badgeObject.transform.localScale = Vector3.Lerp(originalScale, targetScale, t);
                yield return null;
            }

            elapsed = 0f;

            // Scale down
            while (elapsed < animationDuration / 2)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / (animationDuration / 2);
                badgeObject.transform.localScale = Vector3.Lerp(targetScale, originalScale, t);
                yield return null;
            }

            badgeObject.transform.localScale = originalScale;
            isAnimating = false;
        }

        /// <summary>
        /// Manually sets the FriendRequestUI reference
        /// </summary>
        public void SetFriendRequestUI(FriendRequestUI ui)
        {
            // Unsubscribe from old UI if exists
            if (friendRequestUI != null)
            {
                friendRequestUI.OnRequestCountChanged -= UpdateBadge;
            }

            friendRequestUI = ui;

            // Subscribe to new UI
            if (friendRequestUI != null)
            {
                friendRequestUI.OnRequestCountChanged += UpdateBadge;
                UpdateBadge(friendRequestUI.GetPendingRequestCount());
            }
        }

        /// <summary>
        /// Gets the current count displayed on the badge
        /// </summary>
        public int GetCurrentCount()
        {
            return currentCount;
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (friendRequestUI != null)
            {
                friendRequestUI.OnRequestCountChanged -= UpdateBadge;
            }
        }
    }
}
