using System;
using UnityEngine;
using UnityEngine.Networking;

namespace FriendSystem.Core
{
    /// <summary>
    /// Handles API errors and provides user-friendly error messages
    /// </summary>
    public static class ErrorHandler
    {
        public delegate void ErrorCallback(string message, ErrorType errorType);
        public static event ErrorCallback OnError;

        public enum ErrorType
        {
            BadRequest,
            Unauthorized,
            NotFound,
            ServerError,
            NetworkError,
            Timeout,
            Unknown
        }

        /// <summary>
        /// Handle API errors from UnityWebRequest
        /// </summary>
        public static void HandleApiError(UnityWebRequest request)
        {
            if (request == null)
            {
                ShowError("Lỗi không xác định", ErrorType.Unknown);
                return;
            }

            long responseCode = request.responseCode;
            string errorMessage = GetUserFriendlyMessage(responseCode, request.result);
            ErrorType errorType = GetErrorType(responseCode, request.result);

            Debug.LogError($"API Error [{responseCode}]: {request.error} - {request.downloadHandler?.text}");
            ShowError(errorMessage, errorType);
        }

        /// <summary>
        /// Handle general exceptions
        /// </summary>
        public static void HandleException(Exception ex)
        {
            if (ex == null)
            {
                ShowError("Lỗi không xác định", ErrorType.Unknown);
                return;
            }

            Debug.LogError($"Exception: {ex.Message}\n{ex.StackTrace}");
            
            string errorMessage = "Đã xảy ra lỗi: " + ex.Message;
            ErrorType errorType = ErrorType.Unknown;

            // Check for specific exception types
            if (ex.Message.Contains("timeout") || ex.Message.Contains("timed out"))
            {
                errorMessage = "Kết nối bị timeout. Vui lòng thử lại.";
                errorType = ErrorType.Timeout;
            }
            else if (ex.Message.Contains("network") || ex.Message.Contains("connection"))
            {
                errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
                errorType = ErrorType.NetworkError;
            }

            ShowError(errorMessage, errorType);
        }

        /// <summary>
        /// Get user-friendly error message based on HTTP status code
        /// </summary>
        private static string GetUserFriendlyMessage(long statusCode, UnityWebRequest.Result result)
        {
            // Handle network errors first
            if (result == UnityWebRequest.Result.ConnectionError)
            {
                return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.";
            }

            if (result == UnityWebRequest.Result.ProtocolError)
            {
                switch (statusCode)
                {
                    case 400:
                        return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
                    case 401:
                        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                    case 403:
                        return "Bạn không có quyền thực hiện thao tác này.";
                    case 404:
                        return "Không tìm thấy thông tin yêu cầu.";
                    case 409:
                        return "Dữ liệu đã tồn tại hoặc xung đột.";
                    case 429:
                        return "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    case 500:
                        return "Lỗi server. Vui lòng thử lại sau.";
                    case 502:
                        return "Server tạm thời không khả dụng. Vui lòng thử lại sau.";
                    case 503:
                        return "Dịch vụ đang bảo trì. Vui lòng thử lại sau.";
                    default:
                        if (statusCode >= 500)
                        {
                            return "Lỗi server. Vui lòng thử lại sau.";
                        }
                        return $"Đã xảy ra lỗi (Mã lỗi: {statusCode}). Vui lòng thử lại.";
                }
            }

            if (result == UnityWebRequest.Result.DataProcessingError)
            {
                return "Lỗi xử lý dữ liệu. Vui lòng thử lại.";
            }

            return "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
        }

        /// <summary>
        /// Get error type based on HTTP status code
        /// </summary>
        private static ErrorType GetErrorType(long statusCode, UnityWebRequest.Result result)
        {
            if (result == UnityWebRequest.Result.ConnectionError)
            {
                return ErrorType.NetworkError;
            }

            if (result == UnityWebRequest.Result.ProtocolError)
            {
                switch (statusCode)
                {
                    case 400:
                        return ErrorType.BadRequest;
                    case 401:
                    case 403:
                        return ErrorType.Unauthorized;
                    case 404:
                        return ErrorType.NotFound;
                    case 500:
                    case 502:
                    case 503:
                        return ErrorType.ServerError;
                    default:
                        if (statusCode >= 500)
                        {
                            return ErrorType.ServerError;
                        }
                        return ErrorType.Unknown;
                }
            }

            return ErrorType.Unknown;
        }

        /// <summary>
        /// Show error message to user
        /// </summary>
        private static void ShowError(string message, ErrorType errorType)
        {
            Debug.LogError($"[ErrorHandler] {errorType}: {message}");
            OnError?.Invoke(message, errorType);
        }

        /// <summary>
        /// Show custom error message
        /// </summary>
        public static void ShowCustomError(string message, ErrorType errorType = ErrorType.Unknown)
        {
            ShowError(message, errorType);
        }
    }
}
