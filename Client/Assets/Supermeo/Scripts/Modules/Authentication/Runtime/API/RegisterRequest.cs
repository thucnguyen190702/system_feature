using System;

namespace Authentication.API
{
    [Serializable]
    public class RegisterRequest
    {
        public string username;
        public string password;
    }
}
