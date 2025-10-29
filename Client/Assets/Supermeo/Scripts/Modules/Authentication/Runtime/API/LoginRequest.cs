using System;

namespace Authentication.API
{
    [Serializable]
    public class LoginRequest
    {
        public string username;
        public string password;
    }
}
