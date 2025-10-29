namespace Supermeo.Authentication.Utils
{
    /// <summary>
    /// Static utility class for handling and translating error codes to user-friendly messages
    /// </summary>
    public static class ErrorHandler
    {
        /// <summary>
        /// Converts error codes to user-friendly messages
        /// </summary>
        /// <param name="errorCode">The error code from the server or client</param>
        /// <returns>A user-friendly error message</returns>
        public static string GetUserFriendlyMessage(string errorCode)
        {
            if (string.IsNullOrEmpty(errorCode))
            {
                return "An error occurred. Please try again";
            }

            return errorCode switch
            {
				"USERNAME_EXISTS" => "Tên người dùng đã được sử dụng",
				"INVALID_CREDENTIALS" => "Tên đăng nhập hoặc mật khẩu không đúng",
				"TOKEN_EXPIRED" => "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
				"NETWORK_ERROR" => "Lỗi kết nối. Vui lòng kiểm tra internet của bạn",
				"VALIDATION_ERROR" => "Vui lòng kiểm tra lại thông tin và thử lại",
				"USERNAME_TOO_SHORT" => "Tên người dùng phải có ít nhất 3 ký tự",
				"USERNAME_TOO_LONG" => "Tên người dùng không được vượt quá 50 ký tự",
				"PASSWORD_TOO_SHORT" => "Mật khẩu phải có ít nhất 6 ký tự",
				"INVALID_USERNAME_FORMAT" => "Tên người dùng chỉ được chứa chữ và số",
				"SERVER_ERROR" => "Lỗi máy chủ. Vui lòng thử lại sau",
				"TIMEOUT" => "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại",
				_ => "Đã xảy ra lỗi. Vui lòng thử lại"
			};
        }
    }
}
