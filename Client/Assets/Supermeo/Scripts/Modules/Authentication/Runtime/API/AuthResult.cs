namespace Authentication.API
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string ErrorCode { get; set; }
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
    }
}
