using System;
using UnityEngine;

namespace FriendSystem.Models
{
    [Serializable]
    public class InGameAccount
    {
        [SerializeField] private string accountId;
        [SerializeField] private string username;
        [SerializeField] private string displayName;
        [SerializeField] private string avatarUrl;
        [SerializeField] private int level;
        [SerializeField] private string status;
        [SerializeField] private bool isOnline;
        [SerializeField] private string lastSeenAt;
        [SerializeField] private string createdAt;
        [SerializeField] private string updatedAt;

        public string AccountId { get => accountId; set => accountId = value; }
        public string Username { get => username; set => username = value; }
        public string DisplayName { get => displayName; set => displayName = value; }
        public string AvatarUrl { get => avatarUrl; set => avatarUrl = value; }
        public int Level { get => level; set => level = value; }
        public string Status { get => status; set => status = value; }
        public bool IsOnline { get => isOnline; set => isOnline = value; }
        public string LastSeenAt { get => lastSeenAt; set => lastSeenAt = value; }
        public string CreatedAt { get => createdAt; set => createdAt = value; }
        public string UpdatedAt { get => updatedAt; set => updatedAt = value; }
    }
}
