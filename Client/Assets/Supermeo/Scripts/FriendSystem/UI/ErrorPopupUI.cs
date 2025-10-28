using UnityEngine;
using UnityEngine.UI;
using TMPro;
using FriendSystem.Core;

namespace FriendSystem.UI
{
    /// <summary>
    /// UI component for displaying error messages to the user
    /// </summary>
    public class ErrorPopupUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject popupPanel;
        [SerializeField] private TextMeshProUGUI errorMessageText;
        [SerializeField] private TextMeshProUGUI errorTitleText;
        [SerializeField] private Button closeButton;
        [SerializeField] private Image iconImage;

        [Header("Error Type Colors")]
        [SerializeField] private Color badRequestColor = new Color(1f, 0.6f, 0f); // Orange
        [SerializeField] private Color unauthorizedColor = new Color(1f, 0.3f, 0.3f); // Red
        [SerializeField] private Color notFoundColor = new Color(0.5f, 0.5f, 0.5f); // Gray
        [SerializeField] private Color serverErrorColor = new Color(0.8f, 0f, 0f); // Dark Red
        [SerializeField] private Color networkErrorColor = new Color(0.3f, 0.3f, 1f); // Blue
        [SerializeField] private Color timeoutColor = new Color(0.6f, 0.4f, 0.8f); // Purple
        [SerializeField] private Color unknownColor = new Color(0.5f, 0.5f, 0.5f); // Gray

        [Header("Settings")]
        [SerializeField] private float autoCloseDelay = 5f;
        [SerializeField] private bool autoClose = true;

        private float autoCloseTimer;
        private bool isShowing;

        private void Awake()
        {
            if (closeButton != null)
            {
                closeButton.onClick.AddListener(ClosePopup);
            }

            // Subscribe to error events
            ErrorHandler.OnError += ShowError;

            // Hide popup initially
            if (popupPanel != null)
            {
                popupPanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from error events
            ErrorHandler.OnError -= ShowError;

            if (closeButton != null)
            {
                closeButton.onClick.RemoveListener(ClosePopup);
            }
        }

        private void Update()
        {
            if (isShowing && autoClose)
            {
                autoCloseTimer -= Time.deltaTime;
                if (autoCloseTimer <= 0)
                {
                    ClosePopup();
                }
            }
        }

        /// <summary>
        /// Show error popup with message and error type
        /// </summary>
        public void ShowError(string message, ErrorHandler.ErrorType errorType)
        {
            if (popupPanel == null)
            {
                Debug.LogError("Error popup panel is not assigned!");
                return;
            }

            // Set error message
            if (errorMessageText != null)
            {
                errorMessageText.text = message;
            }

            // Set error title based on type
            if (errorTitleText != null)
            {
                errorTitleText.text = GetErrorTitle(errorType);
            }

            // Set icon color based on error type
            if (iconImage != null)
            {
                iconImage.color = GetErrorColor(errorType);
            }

            // Show popup
            popupPanel.SetActive(true);
            isShowing = true;
            autoCloseTimer = autoCloseDelay;
        }

        /// <summary>
        /// Close the error popup
        /// </summary>
        public void ClosePopup()
        {
            if (popupPanel != null)
            {
                popupPanel.SetActive(false);
            }
            isShowing = false;
        }

        /// <summary>
        /// Get error title based on error type
        /// </summary>
        private string GetErrorTitle(ErrorHandler.ErrorType errorType)
        {
            switch (errorType)
            {
                case ErrorHandler.ErrorType.BadRequest:
                    return "Yêu cầu không hợp lệ";
                case ErrorHandler.ErrorType.Unauthorized:
                    return "Không có quyền truy cập";
                case ErrorHandler.ErrorType.NotFound:
                    return "Không tìm thấy";
                case ErrorHandler.ErrorType.ServerError:
                    return "Lỗi Server";
                case ErrorHandler.ErrorType.NetworkError:
                    return "Lỗi Kết nối";
                case ErrorHandler.ErrorType.Timeout:
                    return "Hết thời gian chờ";
                case ErrorHandler.ErrorType.Unknown:
                default:
                    return "Lỗi";
            }
        }

        /// <summary>
        /// Get error color based on error type
        /// </summary>
        private Color GetErrorColor(ErrorHandler.ErrorType errorType)
        {
            switch (errorType)
            {
                case ErrorHandler.ErrorType.BadRequest:
                    return badRequestColor;
                case ErrorHandler.ErrorType.Unauthorized:
                    return unauthorizedColor;
                case ErrorHandler.ErrorType.NotFound:
                    return notFoundColor;
                case ErrorHandler.ErrorType.ServerError:
                    return serverErrorColor;
                case ErrorHandler.ErrorType.NetworkError:
                    return networkErrorColor;
                case ErrorHandler.ErrorType.Timeout:
                    return timeoutColor;
                case ErrorHandler.ErrorType.Unknown:
                default:
                    return unknownColor;
            }
        }

        /// <summary>
        /// Set auto close behavior
        /// </summary>
        public void SetAutoClose(bool enabled, float delay = 5f)
        {
            autoClose = enabled;
            autoCloseDelay = delay;
        }
    }
}
