using System;

namespace Authentication.API
{
    [Serializable]
    public class AuthResponse
    {
        public bool success;
        public string token;
        public string userId;
        public string username;
        public string message;
        public string code;
    }
}
