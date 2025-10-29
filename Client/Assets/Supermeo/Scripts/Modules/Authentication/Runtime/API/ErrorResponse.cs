using System;

namespace Authentication.API
{
    [Serializable]
    public class ErrorResponse
    {
        public bool success;
        public string message;
        public string code;
    }
}
