using UnityEngine;

namespace FriendSystem.Config
{
    [CreateAssetMenu(fileName = "FriendSystemConfig", menuName = "Friend System/Config")]
    public class FriendSystemConfig : ScriptableObject
    {
        [Header("Server Configuration")]
        [SerializeField] private string serverUrl = "http://localhost:3000";
        [SerializeField] private int requestTimeout = 30;

        [Header("Friend List Settings")]
        [SerializeField] private int maxFriends = 100;
        [SerializeField] private int friendListCacheTime = 300; // seconds

        [Header("UI Settings")]
        [SerializeField] private int friendsPerPage = 20;
        [SerializeField] private bool showOnlineStatusFirst = true;

        public string ServerUrl => serverUrl;
        public int RequestTimeout => requestTimeout;
        public int MaxFriends => maxFriends;
        public int FriendListCacheTime => friendListCacheTime;
        public int FriendsPerPage => friendsPerPage;
        public bool ShowOnlineStatusFirst => showOnlineStatusFirst;

        public string GetApiUrl(string endpoint)
        {
            return $"{serverUrl}/api{endpoint}";
        }
    }
}
