using System;
using UnityEngine;

namespace FriendSystem.Models
{
    [Serializable]
    public class ApiResponse
    {
        [SerializeField] private bool success;
        [SerializeField] private string message;

        public bool Success { get => success; set => success = value; }
        public string Message { get => message; set => message = value; }
    }

    [Serializable]
    public class ApiResponse<T>
    {
        [SerializeField] private bool success;
        [SerializeField] private string message;
        [SerializeField] private T data;

        public bool Success { get => success; set => success = value; }
        public string Message { get => message; set => message = value; }
        public T Data { get => data; set => data = value; }
    }
}
