# Implementation Plan - Hệ thống Bạn bè

## Tổng quan

Plan này chia nhỏ việc triển khai Friend System thành các task code cụ thể, xây dựng từng bước từ infrastructure đến features hoàn chỉnh. Mỗi task tập trung vào việc viết code có thể chạy được và tích hợp với các phần đã hoàn thành trước đó.

### ⚠️ Important: Unified Database Schema

**Friend System sử dụng bảng `users` đã được tạo bởi authentication-system.**
- KHÔNG tạo bảng `players` riêng
- Bảng `users` đã có tất cả profile fields: display_name, avatar_url, level, online_status, privacy_settings
- Foreign keys sử dụng `user_id` thay vì `player_id`
- Trong code có thể giữ tên `playerId` cho dễ hiểu (player = user trong game context)

---

## Server Implementation (Node.js + TypeScript)

- [ ] 1. Setup Server Infrastructure và Database
  - Khởi tạo Node.js project với TypeScript, Express.js
  - Cấu hình PostgreSQL connection pool và database provider
  - **UPDATED:** Tạo database migrations cho tables: friendships, friend_requests, blocked_users
  - **NOTE:** Bảng `users` đã được tạo bởi authentication-system với đầy đủ profile fields
  - Setup Redis connection cho caching
  - Implement shared middleware: error handler, authentication, validation
  - Import auth middleware từ authentication module
  - Cấu hình environment variables và config management
  - _Requirements: 6.4, 6.5_

- [ ] 2. Implement User Profile Module (extends auth User)
  - [ ] 2.1 Import User model từ auth module
    - **UPDATED:** Import User entity từ authentication module
    - Tạo type alias: `type PlayerAccount = Omit<User, 'passwordHash'>`
    - Viết TypeScript interfaces: UserBasicInfo (alias PlayerBasicInfo), PrivacySettings
    - Implement OnlineStatus enum
    - **NOTE:** Không tạo PlayerAccount model mới, sử dụng User từ auth
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 2.2 Implement UserProfileRepository
    - **UPDATED:** Viết methods: findById, findByUsername, updateProfile, updateOnlineStatus
    - **REMOVED:** Không có createUser (handled by auth module)
    - Query từ bảng `users` với tất cả profile fields
    - Implement parameterized queries để prevent SQL injection
    - _Requirements: 1.2, 1.3, 5.1_
  
  - [ ] 2.3 Implement UserProfileService
    - **UPDATED:** Viết business logic: getUserById, updateProfile, updateOnlineStatus, getUserBasicInfo
    - **REMOVED:** Không có createAccount (handled by auth module)
    - Implement data validation và encryption cho sensitive data
    - _Requirements: 1.2, 1.3, 1.4, 5.1_
  
  - [ ] 2.4 Implement User Profile API endpoints
    - **UPDATED:** Tạo UserProfileController với routes:
      - GET /api/v1/users/:id (get user profile)
      - PUT /api/v1/users/:id/profile (update profile: displayName, avatarUrl, privacySettings)
      - PATCH /api/v1/users/:id/status (update online status)
    - **REMOVED:** POST /users (user creation handled by auth: POST /api/auth/register)
    - Apply authentication middleware từ auth module và rate limiting
    - _Requirements: 1.2, 1.3_


- [ ] 3. Implement Friend Search Module
  - [ ] 3.1 Implement FriendSearchService
    - Viết searchByUsername method với ILIKE query và limit
    - Viết searchById method với UUID validation
    - **UPDATED:** Query từ bảng `users` thay vì `players`
    - Check isFriend status từ friendships table
    - Check hasPendingRequest từ friend_requests table
    - Implement getRecommendedFriends (optional feature)
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Implement search API endpoints
    - **UPDATED:** Tạo FriendSearchController với route: GET /api/v1/users/search
    - Query params: ?username=xxx hoặc ?id=xxx
    - Apply search rate limiting (30 requests/minute)
    - Implement input validation cho username và ID
    - Return PlayerSearchResult với isFriend và hasPendingRequest flags
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Implement Friend Request Module
  - [ ] 4.1 Tạo FriendRequest models
    - Viết TypeScript interfaces: FriendRequest, FriendRequestStatus enum
    - **UPDATED:** Use `fromUserId` và `toUserId` fields (database columns: from_user_id, to_user_id)
    - Include fromUserInfo: UserBasicInfo for display
    - _Requirements: 2.4, 2.5_
  
  - [ ] 4.2 Implement FriendRequestRepository
    - **UPDATED:** Viết methods với user_id columns:
      - create(fromUserId, toUserId, message?)
      - findById(requestId)
      - findPendingByUserId(userId) - get requests TO this user
      - findSentByUserId(userId) - get requests FROM this user
      - updateStatus(requestId, status)
      - delete(requestId)
    - JOIN với users table để lấy user info
    - Implement queries với proper indexes on from_user_id, to_user_id, status
    - _Requirements: 2.4, 2.5_
  
  - [ ] 4.3 Implement FriendRequestService
    - Viết sendFriendRequest với validation:
      - Check không tự gửi cho mình (fromUserId !== toUserId)
      - **UPDATED:** Check user existence từ bảng `users`
      - Check blocked status từ blocked_users table
      - Check privacy settings từ users.privacy_settings
      - Check không có pending request đã tồn tại
    - Viết acceptFriendRequest:
      - Tạo bidirectional friendship trong friendships table (user_id, friend_id)
      - Update request status to 'accepted'
    - Viết rejectFriendRequest và cancelFriendRequest
    - Viết getPendingRequests(userId)
    - _Requirements: 2.4, 2.5, 5.2, 5.3_
  
  - [ ] 4.4 Implement Friend Request API endpoints
    - Tạo FriendRequestController với routes:
      - POST /api/v1/friend-requests (body: { toUserId, message? })
      - GET /api/v1/friend-requests/pending
      - POST /api/v1/friend-requests/:id/accept
      - POST /api/v1/friend-requests/:id/reject
      - DELETE /api/v1/friend-requests/:id (cancel)
    - Apply friend request rate limiting (20 requests/hour per user)
    - _Requirements: 2.4, 2.5_

- [ ] 5. Implement Friend Management Module
  - [ ] 5.1 Tạo Friend models
    - Viết TypeScript interfaces: Friend, FriendListFilter
    - **UPDATED:** Friend interface có userId và friendId (database: user_id, friend_id)
    - Include friendInfo: UserBasicInfo for display
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 5.2 Implement FriendRepository
    - **UPDATED:** Viết findFriendsByUserId với JOIN to users table:
      - SELECT f.*, u.username, u.display_name, u.avatar_url, u.level, u.online_status
      - FROM friendships f JOIN users u ON f.friend_id = u.id
      - WHERE f.user_id = ?
    - Viết addFriend (bidirectional insert):
      - INSERT INTO friendships (user_id, friend_id) VALUES (userId, friendId)
      - INSERT INTO friendships (user_id, friend_id) VALUES (friendId, userId)
    - Viết removeFriend (bidirectional delete):
      - DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    - Viết isFriend(userId, friendId) check method
    - Viết getFriendCount(userId) method
    - Implement efficient queries với indexes on user_id, friend_id
    - _Requirements: 3.1, 3.4, 3.5_
  
  - [ ] 5.3 Implement FriendService
    - Viết getFriendList(userId, filter?) với filter support:
      - Search by username/displayName (ILIKE)
      - Sort by name, level, or online_status
      - Filter onlineOnly
    - **UPDATED:** Query user info từ bảng `users`
    - Viết removeFriend(userId, friendId) với bidirectional removal
    - Viết getFriendProfile(userId, friendId) với privacy filtering
    - Viết getFriendCount(userId)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 5.4 Implement Friend API endpoints
    - Tạo FriendController với routes:
      - GET /api/v1/friends (query params: search, sortBy, sortOrder, onlineOnly)
      - DELETE /api/v1/friends/:friendId
      - GET /api/v1/friends/:friendId/profile
      - GET /api/v1/friends/count
    - Apply query parameter validation cho filters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 6. Implement Caching Layer
  - [ ] 6.1 Implement FriendCacheService
    - Viết Redis cache methods: getFriendList, cacheFriendList, invalidateFriendCache
    - Set appropriate TTL (5 minutes cho friend list, 10 minutes cho friend count)
    - Implement cache invalidation khi có updates
    - _Requirements: 6.1, 6.2_
  
  - [ ] 6.2 Integrate caching vào FriendService
    - Update getFriendList để check cache trước khi query database
    - Update removeFriend, acceptFriendRequest để invalidate cache của cả 2 players
    - _Requirements: 6.1, 6.2_

- [ ] 7. Implement Real-time Notification Module
  - [ ] 7.1 Setup Socket.io server
    - Cấu hình Socket.io với Express server
    - Implement JWT authentication cho WebSocket connections
    - _Requirements: 2.4, 3.1_
  
  - [ ] 7.2 Implement NotificationGateway
    - Viết sendFriendRequestNotification(toUserId, request) method
    - Viết sendFriendAcceptedNotification(toUserId, friend) method
    - Viết sendFriendOnlineNotification(toUserId, friendId) method
    - Viết sendFriendOfflineNotification(toUserId, friendId) method
    - **UPDATED:** Maintain user socket mapping (userId -> socketId)
    - _Requirements: 2.4, 4.2_
  
  - [ ] 7.3 Integrate notifications vào services
    - Update FriendRequestService để gửi notification khi send/accept/reject request
    - **UPDATED:** Update UserProfileService để broadcast online/offline status changes
    - Notify all friends khi user changes online status
    - _Requirements: 2.4, 4.2_

- [ ] 8. Implement Block/Privacy Features
  - [ ] 8.1 Implement BlockRepository
    - **UPDATED:** Viết methods với user_id columns:
      - blockUser(userId, blockedUserId, reason?)
      - unblockUser(userId, blockedUserId)
      - isBlocked(userId, blockedUserId)
      - getBlockedList(userId)
    - **UPDATED:** Query từ bảng `blocked_users` thay vì `blocked_players`
    - JOIN với users table để lấy blocked user info
    - _Requirements: 5.3_
  
  - [ ] 8.2 Implement PrivacyService
    - Viết canSendFriendRequest(fromUserId, toUserId) check:
      - **UPDATED:** Check privacy_settings.allowFriendRequests từ users table
      - Check isBlocked từ blocked_users table (both directions)
    - Viết filterUserInfo(userId, targetUserId, userInfo) để respect privacy:
      - Check privacy_settings.showOnlineStatus
      - Check privacy_settings.showLevel
    - _Requirements: 5.2, 5.3_
  
  - [ ] 8.3 Implement Block API endpoints
    - **UPDATED:** Tạo BlockController với routes:
      - POST /api/v1/blocks (body: { blockedUserId, reason? })
      - DELETE /api/v1/blocks/:blockedUserId
      - GET /api/v1/blocks
    - _Requirements: 5.3_
  
  - [ ] 8.4 Integrate privacy checks vào existing services
    - Update FriendRequestService để check privacy trước khi send request
    - **UPDATED:** Update FriendSearchService để filter blocked users
    - Remove existing friendship khi user blocks another user
    - _Requirements: 5.2, 5.3_


- [ ] 9. Implement Security Features
  - [ ] 9.1 Import và use JWT authentication middleware
    - **UPDATED:** Import authenticateJWT middleware từ authentication module
    - Viết authorizeUserAction middleware để check ownership (userId matches authenticated user)
    - Apply middleware to all protected endpoints
    - _Requirements: 5.1_
  
  - [ ] 9.2 Implement rate limiting
    - Apply general API rate limiter (100 requests/15 minutes)
    - Apply friend request specific limiter (20 requests/hour per user)
    - Apply search limiter (30 requests/minute)
    - _Requirements: 6.3_
  
  - [ ] 9.3 Implement input validation
    - Tạo validation rules cho tất cả endpoints
    - Implement sanitization cho user inputs
    - _Requirements: 5.1, 5.4_
  
  - [ ] 9.4 Use encryption from auth module
    - **UPDATED:** Import EncryptionService từ authentication module nếu cần
    - **NOTE:** Sensitive data encryption đã được handle bởi auth module
    - Privacy settings stored as JSONB in users table
    - _Requirements: 5.1_

- [ ] 10. Server Testing và Documentation
  - [ ] 10.1 Viết unit tests cho services
    - **UPDATED:** Test FriendService, FriendRequestService, UserProfileService
    - Mock repositories và dependencies
    - Test với unified users table schema
    - _Requirements: All_
  
  - [ ] 10.2 Viết integration tests cho API endpoints
    - Test tất cả REST endpoints với real database
    - Test WebSocket events
    - _Requirements: All_
  
  - [ ] 10.3 Viết performance tests
    - Load test với k6 (1000 concurrent users)
    - Verify response time requirements (< 2s)
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 10.4 Tạo API documentation
    - Generate OpenAPI/Swagger documentation
    - Document tất cả endpoints, models, error codes

---

## Client Implementation (Unity C#)

- [ ] 11. Setup Unity Friend Module Structure
  - Tạo folder structure: Scripts/Core, Scripts/Models, Scripts/Services, Scripts/Network, Scripts/UI, Scripts/Data, Scripts/Events
  - Tạo Assembly Definition file (FriendSystem.asmdef)
  - Setup dependencies (Newtonsoft.Json, UnityWebRequest utilities)
  - _Requirements: All_


- [ ] 12. Implement Client Data Models
  - [ ] 12.1 Tạo core model classes
    - Viết PlayerAccount, PlayerBasicInfo, PrivacySettings classes
    - Viết OnlineStatus enum
    - Add [Serializable] attributes cho JSON serialization
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 12.2 Tạo Friend và FriendRequest models
    - Viết FriendData, FriendRequest classes
    - Viết FriendRequestStatus enum
    - Viết PlayerSearchResult class
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1_
  
  - [ ] 12.3 Tạo filter và utility models
    - Viết FriendListFilter class với SortBy, SortOrder enums
    - Viết ApiResponse<T> wrapper class
    - Viết FriendProfile class
    - _Requirements: 3.2, 3.3_

- [ ] 13. Implement Network Layer
  - [ ] 13.1 Implement AuthTokenManager
    - Viết token storage và retrieval
    - Implement token expiry check và auto-refresh
    - _Requirements: 5.1_
  
  - [ ] 13.2 Implement FriendApiClient (REST)
    - Viết base HTTP client với UnityWebRequest
    - Implement request/response serialization
    - Add authentication headers
    - Implement timeout handling (30 seconds)
    - _Requirements: 6.1, 6.2_
  
  - [ ] 13.3 Implement FriendService API methods
    - Viết GetFriendListAsync với filter support
    - Viết RemoveFriendAsync, GetFriendProfileAsync
    - Viết SendFriendRequestAsync, AcceptFriendRequestAsync, RejectFriendRequestAsync
    - Viết GetPendingRequestsAsync
    - Viết SearchPlayersByUsernameAsync, SearchPlayerByIdAsync
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 3.1, 3.4_
  
  - [ ] 13.4 Implement FriendSocketClient (WebSocket)
    - Setup Socket.io client cho Unity
    - Implement Connect/Disconnect với JWT authentication
    - Implement event listeners: friend-request:received, friend-request:accepted, friend:online, friend:offline, friend:added, friend:removed
    - Implement auto-reconnect logic
    - _Requirements: 2.4, 4.2_

- [ ] 14. Implement Data Management Layer
  - [ ] 14.1 Implement FriendDataManager
    - Viết local cache: CacheFriendList, GetCachedFriendList
    - Implement cache validation với timestamp (5 minutes TTL)
    - Viết UpdateFriendStatus, AddFriend, RemoveFriend methods
    - Viết ClearCache method
    - _Requirements: 6.1_
  
  - [ ] 14.2 Implement FriendDataStore (persistent storage)
    - Viết SaveFriendListToFile và LoadFriendListFromFile
    - Use JSON serialization với PlayerPrefs hoặc file system
    - _Requirements: 6.1_


- [ ] 15. Implement Core Friend Manager
  - [ ] 15.1 Implement FriendManager singleton
    - Viết singleton pattern với DontDestroyOnLoad
    - Implement Initialize method với FriendSystemConfig
    - Setup dependencies: FriendService, FriendDataManager, FriendSocketClient
    - _Requirements: All_
  
  - [ ] 15.2 Implement Friend List operations
    - Viết GetFriendListAsync với cache-first strategy
    - Viết RemoveFriendAsync với cache invalidation
    - Viết GetFriendProfileAsync
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 15.3 Implement Friend Request operations
    - Viết SendFriendRequestAsync
    - Viết AcceptFriendRequestAsync, RejectFriendRequestAsync
    - Viết GetPendingRequestsAsync
    - _Requirements: 2.4, 2.5_
  
  - [ ] 15.4 Implement Search operations
    - Viết SearchPlayersByUsernameAsync
    - Viết SearchPlayerByIdAsync
    - _Requirements: 2.1, 2.2_
  
  - [ ] 15.5 Implement Event System
    - Define events: OnFriendAdded, OnFriendRemoved, OnFriendRequestReceived, OnFriendStatusChanged
    - Wire WebSocket events to C# events
    - _Requirements: 2.4, 4.2_

- [ ] 16. Implement Error Handling
  - [ ] 16.1 Implement FriendSystemException
    - Viết custom exception class với ErrorCode và Details
    - _Requirements: 6.5_
  
  - [ ] 16.2 Implement FriendErrorHandler
    - Viết HandleError method với error code mapping
    - Implement user-friendly error messages (tiếng Việt)
    - _Requirements: 6.5_
  
  - [ ] 16.3 Implement RetryPolicy
    - Viết ExecuteWithRetryAsync với exponential backoff
    - Implement IsRetryable check cho network errors
    - Max 3 retries với 1s initial delay
    - _Requirements: 6.1, 6.2_


- [ ] 17. Implement UI Components
  - [ ] 17.1 Tạo FriendListPanel
    - Design UI layout với ScrollView cho friend list
    - Viết FriendListPanel.cs: Initialize, DisplayFriendList, OnFriendItemClicked
    - Implement search bar và filter controls
    - Implement sort dropdown (by name, level, status)
    - Wire up với FriendManager events
    - _Requirements: 3.1, 3.2, 3.3, 4.1_
  
  - [ ] 17.2 Tạo FriendListItem component
    - Design item prefab với avatar, name, level, online status indicator
    - Viết FriendListItem.cs: SetData, OnRemoveButtonClicked, OnProfileButtonClicked
    - Implement online status color coding
    - _Requirements: 3.1, 4.1, 4.5_
  
  - [ ] 17.3 Tạo FriendSearchPanel
    - Design search UI với input field và search button
    - Viết FriendSearchPanel.cs: OnSearchClicked, DisplaySearchResults
    - Implement search by username và by ID tabs
    - Display search results với "Add Friend" buttons
    - _Requirements: 2.1, 2.2, 2.3, 4.1_
  
  - [ ] 17.4 Tạo FriendRequestPanel
    - Design UI cho pending requests list
    - Viết FriendRequestPanel.cs: DisplayPendingRequests, OnAcceptClicked, OnRejectClicked
    - Implement notification badge cho pending count
    - _Requirements: 2.4, 2.5, 4.2_
  
  - [ ] 17.5 Tạo FriendRequestItem component
    - Design item prefab với sender info và Accept/Reject buttons
    - Viết FriendRequestItem.cs: SetData, OnAcceptClicked, OnRejectClicked
    - _Requirements: 2.4, 2.5, 4.2_
  
  - [ ] 17.6 Tạo FriendProfilePanel
    - Design profile view với detailed player info
    - Viết FriendProfilePanel.cs: DisplayProfile, OnRemoveFriendClicked, OnCloseClicked
    - Display: avatar, username, display name, level, online status
    - _Requirements: 3.1, 4.4_
  
  - [ ] 17.7 Implement notification system
    - Tạo NotificationManager cho toast messages
    - Display notifications cho: friend request received, friend accepted, friend online/offline
    - Implement notification sound effects (optional)
    - _Requirements: 4.2_
  
  - [ ] 17.8 Implement "Add Friend" button integration
    - Add "Thêm bạn" button vào main screen
    - Add "Thêm bạn" button sau khi hoàn thành màn chơi
    - Wire buttons để open FriendSearchPanel
    - _Requirements: 4.1_


- [ ] 18. Implement Configuration và Module Entry Point
  - [ ] 18.1 Tạo FriendSystemConfig ScriptableObject
    - Define config fields: ServerUrl, ApiVersion, WebSocketUrl, timeout settings, cache settings, UI settings
    - Tạo config asset trong Resources folder
    - _Requirements: All_
  
  - [ ] 18.2 Implement FriendModule entry point
    - Viết FriendModule.cs MonoBehaviour
    - Implement Initialize method để setup tất cả dependencies
    - Wire up FriendManager, services, và UI panels
    - Implement lifecycle management (OnApplicationQuit để disconnect WebSocket)
    - _Requirements: All_

- [ ] 19. Client Testing
  - [ ] 19.1 Viết unit tests cho FriendManager
    - Test GetFriendListAsync với cache scenarios
    - Test SendFriendRequestAsync với error scenarios
    - Mock FriendService và FriendDataManager
    - _Requirements: All_
  
  - [ ] 19.2 Viết integration tests (Play Mode)
    - Test full flow: search -> send request -> accept -> friend list update
    - Test WebSocket reconnection
    - _Requirements: All_
  
  - [ ] 19.3 Viết UI tests
    - Test FriendListPanel display và interactions
    - Test FriendSearchPanel search functionality
    - Test FriendRequestPanel accept/reject
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

---

## Integration và End-to-End

- [ ] 20. Integration Testing
  - [ ] 20.1 Setup test environment
    - Deploy server với test database
    - Configure Unity client với test server URL
    - _Requirements: All_
  
  - [ ] 20.2 Test complete friend request flow
    - Player A search Player B
    - Player A send friend request
    - Player B receive notification
    - Player B accept request
    - Both players see each other in friend list
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1_
  
  - [ ] 20.3 Test real-time features
    - Player A goes online -> Player B sees status update
    - Player A removes friend -> Player B's list updates
    - _Requirements: 3.1, 4.2_
  
  - [ ] 20.4 Test error scenarios
    - Network disconnection và reconnection
    - Invalid requests và error messages
    - Rate limiting behavior
    - _Requirements: 6.3, 6.5_

- [ ] 21. Performance Optimization
  - [ ] 21.1 Optimize database queries
    - Review và optimize slow queries
    - Verify indexes are being used
    - _Requirements: 6.1_
  
  - [ ] 21.2 Optimize caching strategy
    - Tune cache TTL values
    - Implement cache warming for common queries
    - _Requirements: 6.1_
  
  - [ ] 21.3 Optimize client performance
    - Implement object pooling cho UI items
    - Optimize texture loading cho avatars
    - _Requirements: 6.1_


- [ ] 22. Security Hardening
  - [ ] 22.1 Security audit
    - Review tất cả authentication và authorization checks
    - Verify input validation và sanitization
    - Test SQL injection prevention
    - _Requirements: 5.1, 5.4_
  
  - [ ] 22.2 Implement additional security measures
    - Add HTTPS enforcement
    - Implement CORS properly
    - Add request signing (optional)
    - _Requirements: 5.1_
  
  - [ ] 22.3 Privacy compliance check
    - Verify GDPR compliance (data encryption, right to deletion)
    - Implement data export functionality
    - _Requirements: 5.4_

- [ ] 23. Deployment Preparation
  - [ ] 23.1 Setup production environment
    - Configure production database với proper security
    - Setup Redis cluster cho high availability
    - Configure load balancer (optional)
    - _Requirements: 6.4_
  
  - [ ] 23.2 Setup monitoring và logging
    - Configure Winston logger với proper log levels
    - Setup Prometheus metrics
    - Configure health check endpoint
    - _Requirements: 6.4, 6.5_
  
  - [ ] 23.3 Create deployment scripts
    - Write Docker build và deployment scripts
    - Setup CI/CD pipeline
    - Create database migration scripts
    - _Requirements: All_
  
  - [ ] 23.4 Build Unity client
    - Configure production build settings
    - Set production server URL trong config
    - Build với IL2CPP và code stripping
    - Test production build
    - _Requirements: All_

---

## Notes

- Tất cả tasks bao gồm cả testing và documentation đều là required để đảm bảo chất lượng comprehensive
- Mỗi task nên được implement và test độc lập trước khi chuyển sang task tiếp theo
- Server tasks (1-10) có thể develop song song với Client tasks (11-19) sau khi API contract được define
- Integration tasks (20-23) chỉ nên bắt đầu sau khi cả Server và Client đã hoàn thành core features
