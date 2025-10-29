# Friend System Tasks - Updates Needed

## Summary

Friend-system tasks cần được update để reflect unified database schema. Thay vì tạo bảng `players` riêng, hệ thống sẽ sử dụng bảng `users` đã được tạo bởi authentication-system.

## Key Changes Required

### 1. Database Schema Changes

**REMOVE:**
- Task tạo bảng `players` 
- Migration cho players table

**UPDATE:**
- Tất cả foreign keys từ `player_id` → `user_id`
- Bảng `blocked_players` → `blocked_users`
- References trong migrations

### 2. Module Name Changes

**RENAME:**
- `Player Module` → `User Profile Module`
- `PlayerService` → `UserProfileService`
- `PlayerRepository` → `UserProfileRepository`
- `PlayerController` → `UserProfileController`

**IMPORTANT:** Trong code có thể giữ tên `playerId` cho dễ hiểu (player = user trong game context)

### 3. Task Updates Needed

#### Task 1: Setup Server Infrastructure
```markdown
- [ ] 1. Setup Server Infrastructure và Database
  - Khởi tạo Node.js project với TypeScript, Express.js
  - Cấu hình PostgreSQL connection pool và database provider
  - **UPDATED:** Tạo database migrations cho tables: friendships, friend_requests, blocked_users
  - **NOTE:** Bảng users đã được tạo bởi authentication-system
  - Setup Redis connection cho caching
  - Implement shared middleware: error handler, authentication, validation
  - Cấu hình environment variables và config management
  - _Requirements: 6.4, 6.5_
```

#### Task 2: Player/Account Module → User Profile Module
```markdown
- [ ] 2. Implement User Profile Module (extends auth User)
  - [ ] 2.1 Import User model từ auth module
    - **REMOVED:** Không tạo PlayerAccount model mới
    - **UPDATED:** Import User entity từ authentication module
    - Tạo type alias: `type PlayerAccount = Omit<User, 'passwordHash'>`
    - Viết TypeScript interfaces: UserBasicInfo, PrivacySettings
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 2.2 Implement UserProfileRepository
    - **UPDATED:** Viết methods: findById, findByUsername, updateProfile, updateOnlineStatus
    - **REMOVED:** Không có createUser (handled by auth module)
    - Implement parameterized queries để prevent SQL injection
    - _Requirements: 1.2, 1.3, 5.1_
  
  - [ ] 2.3 Implement UserProfileService
    - **UPDATED:** Viết business logic: getUserById, updateProfile, updateOnlineStatus
    - **REMOVED:** Không có createAccount (handled by auth module)
    - Implement data validation và encryption cho sensitive data
    - _Requirements: 1.2, 1.3, 1.4, 5.1_
  
  - [ ] 2.4 Implement User Profile API endpoints
    - **UPDATED:** Tạo UserProfileController với routes:
      - GET /api/v1/users/:id (get profile)
      - PUT /api/v1/users/:id/profile (update profile)
      - PATCH /api/v1/users/:id/status (update online status)
    - **REMOVED:** POST /players (user creation handled by auth)
    - Apply authentication middleware và rate limiting
    - _Requirements: 1.2, 1.3_
```

#### Task 3: Friend Search Module
```markdown
- [ ] 3. Implement Friend Search Module
  - [ ] 3.1 Implement FriendSearchService
    - Viết searchByUsername method với ILIKE query và limit
    - Viết searchById method với UUID validation
    - **UPDATED:** Query từ bảng `users` thay vì `players`
    - Implement getRecommendedFriends (optional feature)
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Implement search API endpoints
    - **UPDATED:** Tạo FriendSearchController với route: GET /api/v1/users/search
    - Apply search rate limiting (30 requests/minute)
    - Implement input validation cho username và ID
    - Return PlayerSearchResult với isFriend và hasPendingRequest flags
    - _Requirements: 2.1, 2.2, 2.3_
```

#### Task 4: Friend Request Module
```markdown
- [ ] 4. Implement Friend Request Module
  - [ ] 4.1 Tạo FriendRequest models
    - Viết TypeScript interfaces: FriendRequest, FriendRequestStatus enum
    - **UPDATED:** Use `fromUserId` và `toUserId` thay vì `fromPlayerId`, `toPlayerId`
    - _Requirements: 2.4, 2.5_
  
  - [ ] 4.2 Implement FriendRequestRepository
    - **UPDATED:** Viết methods với user_id columns:
      - create, findById, findPendingByUserId, updateStatus, delete
    - Implement queries với proper indexes
    - _Requirements: 2.4, 2.5_
  
  - [ ] 4.3 Implement FriendRequestService
    - Viết sendFriendRequest với validation
    - **UPDATED:** Check user existence từ bảng `users`
    - Viết acceptFriendRequest (tạo bidirectional friendship)
    - Viết rejectFriendRequest và cancelFriendRequest
    - Viết getPendingRequests
    - _Requirements: 2.4, 2.5, 5.2, 5.3_
  
  - [ ] 4.4 Implement Friend Request API endpoints
    - Tạo FriendRequestController với routes (unchanged)
    - Apply friend request rate limiting
    - _Requirements: 2.4, 2.5_
```

#### Task 5: Friend Management Module
```markdown
- [ ] 5. Implement Friend Management Module
  - [ ] 5.1 Tạo Friend models
    - Viết TypeScript interfaces: Friend, FriendListFilter
    - **UPDATED:** Use `userId` và `friendId` thay vì `playerId`
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 5.2 Implement FriendRepository
    - **UPDATED:** Viết findFriendsByUserId với JOIN to users table
    - Viết addFriend (bidirectional insert to friendships table)
    - Viết removeFriend (bidirectional delete)
    - Viết isFriend check method
    - Viết getFriendCount method
    - Implement efficient queries với proper indexes
    - _Requirements: 3.1, 3.4, 3.5_
  
  - [ ] 5.3 Implement FriendService
    - Viết getFriendList với filter support
    - **UPDATED:** Query user info từ bảng `users`
    - Viết removeFriend với bidirectional removal
    - Viết getFriendProfile với privacy filtering
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 5.4 Implement Friend API endpoints
    - Tạo FriendController với routes (unchanged)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
```

#### Task 8: Block/Privacy Features
```markdown
- [ ] 8. Implement Block/Privacy Features
  - [ ] 8.1 Implement BlockRepository
    - **UPDATED:** Viết methods với user_id columns:
      - blockUser, unblockUser, isBlocked, getBlockedList
    - **UPDATED:** Query từ bảng `blocked_users` thay vì `blocked_players`
    - _Requirements: 5.3_
  
  - [ ] 8.2 Implement PrivacyService
    - Viết canSendFriendRequest check
    - **UPDATED:** Check privacy_settings từ users table
    - Viết filterUserInfo để respect privacy settings
    - _Requirements: 5.2, 5.3_
  
  - [ ] 8.3 Implement Block API endpoints
    - **UPDATED:** Tạo BlockController với routes:
      - POST /api/v1/blocks
      - DELETE /api/v1/blocks/:blockedUserId
      - GET /api/v1/blocks
    - _Requirements: 5.3_
  
  - [ ] 8.4 Integrate privacy checks
    - Update FriendRequestService để check privacy
    - Update FriendSearchService để filter blocked users
    - _Requirements: 5.2, 5.3_
```

### 4. Client-side Changes

**Minimal changes needed:**
- Client models có thể giữ nguyên tên `PlayerAccount`, `playerId` cho dễ hiểu
- Chỉ cần update API endpoints URLs nếu có thay đổi
- Internal logic không cần thay đổi nhiều

### 5. Migration Strategy

**Phase 1: Authentication System**
1. Deploy authentication-system với unified users table
2. Verify users table có đầy đủ profile fields

**Phase 2: Friend System**
1. Create migrations cho: friendships, friend_requests, blocked_users
2. Tất cả foreign keys reference users(id)
3. Deploy friend-system module

**Phase 3: Testing**
1. Test user registration tạo profile fields
2. Test friend system sử dụng user data
3. Verify no data duplication

## Action Items

- [ ] Review và approve unified schema approach
- [ ] Update friend-system/tasks.md với changes above
- [ ] Update friend-system/design.md (DONE ✓)
- [ ] Update authentication-system/design.md (DONE ✓)
- [ ] Update authentication-system/tasks.md (DONE ✓)
- [ ] Proceed với implementation

## Benefits Recap

✅ No data duplication
✅ Single source of truth for user data
✅ Simpler database schema
✅ Better data consistency
✅ Easier to maintain
✅ Better performance (no JOINs between users and players)
