using NUnit.Framework;
using UnityEngine;
using Authentication.Core;

namespace Authentication.Tests
{
    /// <summary>
    /// Tests for TokenStorage class
    /// Tests save, retrieve, and clear operations
    /// </summary>
    public class TokenStorageTests
    {
        private TokenStorage tokenStorage;

        [SetUp]
        public void Setup()
        {
            // Clear PlayerPrefs before each test
            PlayerPrefs.DeleteAll();
            tokenStorage = new TokenStorage();
        }

        [TearDown]
        public void TearDown()
        {
            // Clean up after each test
            PlayerPrefs.DeleteAll();
        }

        [Test]
        public void TokenStorage_SaveToken_StoresAllValues()
        {
            // Arrange
            string testToken = "test_jwt_token_12345";
            string testUserId = "user_123";
            string testUsername = "testuser";

            // Act
            tokenStorage.SaveToken(testToken, testUserId, testUsername);

            // Assert
            Assert.AreEqual(testToken, tokenStorage.GetToken(), "Token should be saved correctly");
            Assert.AreEqual(testUserId, tokenStorage.GetUserId(), "UserId should be saved correctly");
            Assert.AreEqual(testUsername, tokenStorage.GetUsername(), "Username should be saved correctly");
        }

        [Test]
        public void TokenStorage_HasToken_ReturnsTrueWhenTokenExists()
        {
            // Arrange
            tokenStorage.SaveToken("test_token", "user_id", "username");

            // Act
            bool hasToken = tokenStorage.HasToken();

            // Assert
            Assert.IsTrue(hasToken, "HasToken should return true when token exists");
        }

        [Test]
        public void TokenStorage_HasToken_ReturnsFalseWhenNoToken()
        {
            // Act
            bool hasToken = tokenStorage.HasToken();

            // Assert
            Assert.IsFalse(hasToken, "HasToken should return false when no token exists");
        }

        [Test]
        public void TokenStorage_GetToken_ReturnsNullWhenNoToken()
        {
            // Act
            string token = tokenStorage.GetToken();

            // Assert
            Assert.IsNull(token, "GetToken should return null when no token is stored");
        }

        [Test]
        public void TokenStorage_ClearToken_RemovesAllStoredData()
        {
            // Arrange
            tokenStorage.SaveToken("test_token", "user_id", "username");
            Assert.IsTrue(tokenStorage.HasToken(), "Token should exist before clearing");

            // Act
            tokenStorage.ClearToken();

            // Assert
            Assert.IsFalse(tokenStorage.HasToken(), "HasToken should return false after clearing");
            Assert.IsNull(tokenStorage.GetToken(), "Token should be null after clearing");
            Assert.IsNull(tokenStorage.GetUserId(), "UserId should be null after clearing");
            Assert.IsNull(tokenStorage.GetUsername(), "Username should be null after clearing");
        }

        [Test]
        public void TokenStorage_SaveToken_OverwritesExistingToken()
        {
            // Arrange
            tokenStorage.SaveToken("old_token", "old_user", "olduser");

            // Act
            tokenStorage.SaveToken("new_token", "new_user", "newuser");

            // Assert
            Assert.AreEqual("new_token", tokenStorage.GetToken(), "Token should be overwritten");
            Assert.AreEqual("new_user", tokenStorage.GetUserId(), "UserId should be overwritten");
            Assert.AreEqual("newuser", tokenStorage.GetUsername(), "Username should be overwritten");
        }

        [Test]
        public void TokenStorage_GetUserId_ReturnsNullWhenNoData()
        {
            // Act
            string userId = tokenStorage.GetUserId();

            // Assert
            Assert.IsNull(userId, "GetUserId should return null when no data is stored");
        }

        [Test]
        public void TokenStorage_GetUsername_ReturnsNullWhenNoData()
        {
            // Act
            string username = tokenStorage.GetUsername();

            // Assert
            Assert.IsNull(username, "GetUsername should return null when no data is stored");
        }
    }
}
