# Implementation Plan - Hệ thống Bạn bè

## Tổng quan

Kế hoạch triển khai hệ thống bạn bè với Unity C# client, Node.js TypeScript server, và PostgreSQL database. Mỗi task được thiết kế để xây dựng tăng dần và tích hợp với các task trước đó.

## Tasks

- [x] 1. Thiết lập cơ sở hạ tầng dự án




  - Tạo cấu trúc thư mục cho Unity client và Node.js server
  - Cấu hình TypeScript, TypeORM cho server
  - Thiết lập PostgreSQL database và connection
  - Cấu hình environment variables
  - _Requirements: 1.1, 1.2, 1.4_


- [x] 2. Triển khai Database Schema





  - [x] 2.1 Tạo Accounts table với migrations

    - Viết migration script cho accounts table


    - Thêm indexes cho username, status, is_online
    - _Requirements: 1.1, 1.2_
  


  - [x] 2.2 Tạo Friend Requests table

    - Viết migration script cho friend_requests table
    - Thêm foreign keys và indexes

    - _Requirements: 2.4_
  
  - [x] 2.3 Tạo Friend Relationships table

    - Viết migration script cho friend_relationships table
    - Thêm unique constraint và indexes
    - _Requirements: 3.1, 3.4_
  
  - [x] 2.4 Chạy migrations và verify schema

    - Chạy tất cả migrations
    - Verify tables và indexes được tạo đúng
    - _Requirements: 1.4, 6.1_

- [x] 3. Triển khai TypeORM Entities (Server)



  - [x] 3.1 Tạo InGameAccount entity


    - Định nghĩa InGameAccount entity với decorators
    - Thêm validation rules
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 3.2 Tạo FriendRequest entity


    - Định nghĩa FriendRequest entity
    - Thêm relationships với InGameAccount
    - _Requirements: 2.4_
  


  - [ ] 3.3 Tạo FriendRelationship entity
    - Định nghĩa FriendRelationship entity






    - Thêm relationships với InGameAccount
    - _Requirements: 3.1, 3.4_

- [x] 4. Triển khai Account Service (Server)


  - [ ] 4.1 Implement createAccount method
    - Viết logic tạo account với unique ID
    - Validate username uniqueness

    - Hash sensitive data
    - _Requirements: 1.1, 1.2, 5.1_
  
  - [ ] 4.2 Implement getAccount method
    - Viết logic lấy account by ID
    - Handle account not found error
    - _Requirements: 1.1_
  
  - [ ] 4.3 Implement updateAccount method
    - Viết logic cập nhật account info
    - Validate update data
    - _Requirements: 1.3, 1.4_

- [x] 5. Triển khai Friend Service (Server)



  - [x] 5.1 Implement getFriendList method


    - Query friend relationships bidirectional
    - Join với accounts để lấy thông tin bạn bè
    - Return danh sách InGameAccount
    - _Requirements: 3.1, 3.2, 3.3_
  

  - [x] 5.2 Implement sendFriendRequest method

    - Validate cả hai accounts tồn tại
    - Check không phải đã là bạn bè
    - Check không có pending request
    - Tạo friend request với status pending
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  


  - [x] 5.3 Implement acceptFriendRequest method
    - Validate request tồn tại và pending
    - Tạo bidirectional friend relationship
    - Update request status thành accepted
    - _Requirements: 2.5_
  
  - [x] 5.4 Implement removeFriend method

    - Validate friendship tồn tại
    - Xóa friend relationship
    - _Requirements: 3.4_
  


  - [x] 5.5 Implement getPendingRequests method
    - Query pending requests cho account
    - Sort by created date descending
    - _Requirements: 2.4_


  
  - [x] 5.6 Implement updateOnlineStatus method
    - Update is_online field
    - Update last_seen_at timestamp


    - _Requirements: 3.1, 3.3_
  
  - [x] 5.7 Implement getFriendsOnlineStatus method

    - Query online status cho list of account IDs
    - Return map of accountId to isOnline
    - _Requirements: 3.1, 3.3_

- [x] 6. Triển khai Authentication Middleware (Server)

  - [x] 6.1 Implement JWT token generation
    - Tạo generateToken function
    - Set expiration time 7 days
    - _Requirements: 5.2_
  
  - [x] 6.2 Implement JWT token verification
    - Tạo verifyToken function
    - Handle expired tokens
    - _Requirements: 5.2_
  
  - [x] 6.3 Implement auth middleware
    - Extract token from Authorization header
    - Verify token và attach user to request
    - Return 401 nếu invalid
    - _Requirements: 5.2, 5.4_

- [x] 7. Triển khai API Controllers (Server)







  - [ ] 7.1 Implement AccountController
    - createAccount endpoint
    - getAccount endpoint
    - updateAccount endpoint


    - Error handling
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 7.2 Implement FriendController
    - getFriendList endpoint
    - sendFriendRequest endpoint
    - acceptFriendRequest endpoint
    - removeFriend endpoint
    - getPendingRequests endpoint


    - updateOnlineStatus endpoint
    - getFriendsOnlineStatus endpoint
    - Error handling
    - _Requirements: 2.1, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 7.3 Implement SearchController
    - searchByUsername endpoint
    - searchById endpoint
    - Error handling
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 8. Thiết lập Express Routes (Server)



  - Định nghĩa tất cả API routes
  - Apply auth middleware cho protected routes
  - Setup error handling middleware
  - Configure CORS
  - _Requirements: 5.2, 6.1, 6.2_

- [x] 9. Triển khai Unity Data Models (Client)



  - [x] 9.1 Tạo InGameAccount class


    - Định nghĩa fields với Serializable
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 9.2 Tạo FriendRequest class


    - Định nghĩa fields với Serializable
    - _Requirements: 2.4_


  



  - [x] 9.3 Tạo ApiResponse class


    - Định nghĩa Success và Message fields
    - _Requirements: 6.5_

- [-] 10. Triển khai ApiClient (Client)



  - [-] 10.1 Implement GetAsync method

    - Sử dụng UnityWebRequest.Get
    - Add Authorization header
    - Deserialize JSON response
    - Handle errors
    - _Requirements: 6.1, 6.2_
  

  - [x] 10.2 Implement PostAsync method




    - Sử dụng UnityWebRequest.Post
    - Serialize request body to JSON
    - Add Authorization header
    - Deserialize JSON response
    - Handle errors
    - _Requirements: 6.1, 6.2_
  
  - [ ] 10.3 Implement DeleteAsync method
    - Sử dụng UnityWebRequest.Delete
    - Add Authorization header
    - Handle errors
    - _Requirements: 6.1, 6.2_



- [x] 11. Triển khai AccountManager (Client)



  - [x] 11.1 Implement CreateAccount method

    - Call POST /api/accounts
    - Store current account
    - _Requirements: 1.1, 1.2_
  
  - [x] 11.2 Implement GetAccount method

    - Call GET /api/accounts/:id
    - _Requirements: 1.1_
  
  - [x] 11.3 Implement UpdateAccount method

    - Call PUT /api/accounts/:id
    - _Requirements: 1.3_

- [x] 12. Triển khai FriendManager (Client)





  - [x] 12.1 Implement GetFriendList method


    - Call GET /api/friends/:accountId
    - Cache friend list locally
    - _Requirements: 3.1, 3.2, 3.3, 6.1_
  
  - [x] 12.2 Implement SendFriendRequest method


    - Call POST /api/friend-requests
    - Return success status
    - _Requirements: 2.4, 6.2_
  
  - [x] 12.3 Implement AcceptFriendRequest method


    - Call POST /api/friend-requests/:id/accept
    - Refresh friend list
    - _Requirements: 2.5_
  
  - [x] 12.4 Implement RemoveFriend method


    - Call DELETE /api/friends/:id
    - Update local friend list
    - _Requirements: 3.4_
  
  - [x] 12.5 Implement GetPendingRequests method


    - Call GET /api/friend-requests/:accountId/pending
    - _Requirements: 2.4_
  
  - [x] 12.6 Implement UpdateOnlineStatus method


    - Call POST /api/friends/status
    - Update khi player login/logout
    - _Requirements: 3.1, 3.3_
  
  - [x] 12.7 Implement GetFriendsOnlineStatus method


    - Call POST /api/friends/status/batch
    - Update UI với online status
    - _Requirements: 3.1, 3.3_

- [x] 13. Triển khai SearchManager (Client)





  - [x] 13.1 Implement SearchByUsername method


    - Call GET /api/search/username
    - Return list of accounts
    - _Requirements: 2.1_
  

  - [ ] 13.2 Implement SearchById method
    - Call GET /api/search/id/:accountId



    - Return single account


    - _Requirements: 2.2_

- [x] 14. Triển khai Friend List UI (Client)


  - [ ] 14.1 Tạo FriendListPanel prefab
    - Design UI layout với scroll view
    - Tạo friend item prefab
    - _Requirements: 4.1, 4.5_
  

  - [ ] 14.2 Implement FriendListUI script
    - Load và display friend list
    - Show online/offline status
    - Implement search trong friend list
    - Implement sort options (name, level, online status)
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.5_
  
  - [ ] 14.3 Implement friend item interactions
    - Click để xem profile
    - Button để remove friend
    - Show friend count và limit
    - _Requirements: 3.4, 3.5, 4.3, 4.4_

- [x] 15. Triển khai Search UI (Client)





  - [x] 15.1 Tạo SearchPanel prefab


    - Design search input field
    - Tạo search result item prefab
    - _Requirements: 4.1, 4.5_
  
  - [x] 15.2 Implement SearchUI script

    - Search by username
    - Search by ID
    - Display search results với basic info
    - _Requirements: 2.1, 2.2, 2.3, 4.2, 4.5_
  
  - [x] 15.3 Implement send friend request từ search

    - Button để send friend request
    - Show notification khi sent
    - _Requirements: 2.4, 4.2_
-

- [x] 16. Triển khai Friend Request UI (Client)



  - [x] 16.1 Tạo FriendRequestPanel prefab


    - Design UI cho pending requests
    - Tạo request item prefab
    - _Requirements: 4.1, 4.5_
  
  - [x] 16.2 Implement FriendRequestUI script


    - Load và display pending requests
    - Accept button
    - Reject button
    - _Requirements: 2.4, 2.5, 4.2, 4.5_
  
  - [x] 16.3 Implement notification badge


    - Show số lượng pending requests
    - Update real-time
    - _Requirements: 4.2_

- [x] 17. Triển khai Profile UI (Client)





  - Tạo ProfilePanel prefab
  - Display account info (name, avatar, level)
  - Show online status và last seen
  - Button để send friend request (nếu chưa là bạn)
  - Button để remove friend (nếu đã là bạn)
  - _Requirements: 2.3, 4.4, 4.5_

- [x] 18. Triển khai Error Handling (Client)





  - [x] 18.1 Implement ErrorHandler class


    - Handle different HTTP status codes
    - Show user-friendly error messages
    - _Requirements: 6.5_
  
  - [x] 18.2 Implement error UI


    - Tạo error popup prefab


    - Display error messages
    - _Requirements: 4.2, 6.5_



- [x] 19. Implement Caching Strategy (Server)



  - [ ] 19.1 Setup Redis connection (optional)
    - Configure Redis client
    - _Requirements: 6.3_
  
  - [ ] 19.2 Implement friend list caching
    - Cache friend list for 5 minutes
    - Invalidate cache on friend add/remove
    - _Requirements: 6.1, 6.3_

- [x] 20. Implement Security Features (Server)




  - [x] 20.1 Implement data encryption


    - Encrypt sensitive data in database
    - Use HTTPS for all API calls
    - _Requirements: 5.1, 5.4_
  
  - [x] 20.2 Implement rate limiting


    - Limit friend requests per day
    - Prevent spam
    - _Requirements: 5.2_
  
  - [x] 20.3 Implement block list


    - Add blocked_accounts table
    - Prevent blocked users from sending requests
    - _Requirements: 5.3_

- [x] 21. Implement Logging và Monitoring (Server)





  - Setup Winston logger
  - Log all API requests
  - Log errors với stack traces
  - Setup metrics collection
  - _Requirements: 6.5_

- [x] 22. Integration Testing





  - [x] 22.1 Test account creation flow


    - Test tạo account thành công
    - Test duplicate username error
    - _Requirements: 1.1, 1.2_
  

  - [ ] 22.2 Test friend request flow
    - Test send friend request
    - Test accept friend request
    - Test reject friend request
    - Test duplicate request prevention
    - _Requirements: 2.4, 2.5_

  
  - [ ] 22.3 Test friend list operations
    - Test get friend list
    - Test remove friend
    - Test search in friend list
    - Test sort friend list

    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 22.4 Test online status
    - Test update online status

    - Test get friends online status
    - _Requirements: 3.1, 3.3_
  
  - [ ] 22.5 Test search functionality
    - Test search by username
    - Test search by ID
    - _Requirements: 2.1, 2.2_

- [x] 23. Performance Testing




  - [x] 23.1 Test friend list load time


    - Verify load time < 2 seconds
    - _Requirements: 6.1_
  


  - [ ] 23.2 Test friend request processing time
    - Verify processing time < 1 second


    - _Requirements: 6.2_
  
  - [ ] 23.3 Test concurrent requests
    - Test với 1000+ concurrent users
    - _Requirements: 6.3_

- [x] 24. Documentation và Deployment





  - [x] 24.1 Write API documentation
    - Document all endpoints
    - Include request/response examples
    - _Requirements: All_
  
  - [x] 24.2 Setup deployment scripts


    - Docker configuration
    - Environment setup
    - Database migrations
    - _Requirements: 6.4_
  


  - [x] 24.3 Create user guide

    - How to add friends
    - How to manage friend list
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
