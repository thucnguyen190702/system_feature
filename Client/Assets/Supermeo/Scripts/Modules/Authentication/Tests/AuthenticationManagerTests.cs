using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using Authentication.Core;

namespace Authentication.Tests
{
    /// <summary>
    /// Play Mode tests for AuthenticationManager
    /// Tests initialization, singleton pattern, and core authentication flows
    /// </summary>
    public class AuthenticationManagerTests
    {
        private GameObject managerObject;
        private AuthenticationManager manager;

        [SetUp]
        public void Setup()
        {
            // Clean up any existing instances
            var existingManager = GameObject.FindObjectOfType<AuthenticationManager>();
            if (existingManager != null)
            {
                GameObject.DestroyImmediate(existingManager.gameObject);
            }

            // Create a new AuthenticationManager instance
            managerObject = new GameObject("AuthenticationManager");
            manager = managerObject.AddComponent<AuthenticationManager>();
        }

        [TearDown]
        public void TearDown()
        {
            // Clean up
            if (managerObject != null)
            {
                GameObject.DestroyImmediate(managerObject);
            }

            // Clear any stored tokens
            PlayerPrefs.DeleteAll();
        }

        [UnityTest]
        public IEnumerator AuthenticationManager_Initialization_CreatesSingletonInstance()
        {
            // Wait for Awake to be called
            yield return null;

            // Assert
            Assert.IsNotNull(AuthenticationManager.Instance, "Instance should be set after initialization");
            Assert.AreEqual(manager, AuthenticationManager.Instance, "Instance should reference the created manager");
        }

        [UnityTest]
        public IEnumerator AuthenticationManager_MultiplInstances_OnlyOneInstanceExists()
        {
            // Wait for first instance to initialize
            yield return null;

            // Create a second instance
            var secondManagerObject = new GameObject("AuthenticationManager2");
            var secondManager = secondManagerObject.AddComponent<AuthenticationManager>();

            yield return null;

            // Assert - only one instance should exist
            Assert.IsNotNull(AuthenticationManager.Instance, "Instance should exist");
            
            // The second instance should have been destroyed
            Assert.IsTrue(secondManager == null || !secondManager.gameObject.activeInHierarchy,
                "Second instance should be destroyed or inactive");

            // Clean up
            if (secondManagerObject != null)
            {
                GameObject.DestroyImmediate(secondManagerObject);
            }
        }

        [UnityTest]
        public IEnumerator AuthenticationManager_InitialState_IsNotAuthenticated()
        {
            yield return null;

            // Assert
            Assert.IsFalse(manager.IsAuthenticated, "Should not be authenticated initially");
            Assert.IsNull(manager.CurrentUserId, "CurrentUserId should be null initially");
            Assert.IsNull(manager.CurrentUsername, "CurrentUsername should be null initially");
        }

        [Test]
        public void AuthenticationManager_Logout_ClearsAuthenticationState()
        {
            // Arrange - simulate authenticated state
            PlayerPrefs.SetString("auth_token", "test_token");
            PlayerPrefs.SetString("user_id", "test_user_id");
            PlayerPrefs.SetString("username", "test_username");

            // Act
            manager.Logout();

            // Assert
            Assert.IsFalse(manager.IsAuthenticated, "Should not be authenticated after logout");
            Assert.IsNull(manager.CurrentUserId, "CurrentUserId should be null after logout");
            Assert.IsNull(manager.CurrentUsername, "CurrentUsername should be null after logout");
            Assert.IsFalse(PlayerPrefs.HasKey("auth_token"), "Token should be cleared from storage");
        }
    }
}
