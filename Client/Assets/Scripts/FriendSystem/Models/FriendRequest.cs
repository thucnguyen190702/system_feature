using System;
using UnityEngine;

namespace FriendSystem.Models
{
    [Serializable]
    public class FriendRequest
    {
        [SerializeField] private string requestId;
        [SerializeField] private string fromAccountId;
        [SerializeField] private string toAccountId;
        [SerializeField] private string status;
        [SerializeField] private string createdAt;

        public string RequestId { get => requestId; set => requestId = value; }
        public string FromAccountId { get => fromAccountId; set => fromAccountId = value; }
        public string ToAccountId { get => toAccountId; set => toAccountId = value; }
        public string Status { get => status; set => status = value; }
        public string CreatedAt { get => createdAt; set => createdAt = value; }
    }
}
