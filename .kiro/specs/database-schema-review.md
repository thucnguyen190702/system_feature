# Database Schema Review - Tránh Duplicate giữa Authentication và Friend System

## Vấn đề hiện tại

### Authentication System
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Friend System
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    online_status VARCHAR(20) DEFAULT 'offline',
    last_online_at TIMESTAMP,
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT valid_status CHECK (online_status IN ('online', 'offline', 'away', 'busy'))
);
```

## Phân tích

**Duplicate fields:**
- `id` - UUID primary key (giống nhau)
- `username` - Unique identifier (giống nhau, nhưng khác độ dài: 20 vs 50)
- `created_at`, `updated_at` - Timestamps (giống nhau)

**Vấn đề:**
1. Hai bảng lưu cùng một thông tin người dùng
2. Có thể gây inconsistency nếu username được update ở một bảng mà không update bảng kia
3. Tốn storage và phức tạp trong việc maintain data integrity

## Giải pháp đề xuất

### Option 1: Unified Table (Khuyến nghị) ⭐

Merge hai bảng thành một bảng `users` với đầy đủ thông tin:

```sql
-- Unified users table
CREATE TABLE users (
    -- Authentication fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile fields (for friend system)
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    
    -- Status fields
    online_status VARCHAR(20) DEFAULT 'offline',
    last_online_at TIMESTAMP,
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "allowFriendRequests": true,
        "showOnlineStatus": true,
        "showLevel": true
    }',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT valid_status CHECK (online_status IN ('online', 'offline', 'away', 'busy'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(online_status);
```

**Ưu điểm:**
- Single source of truth
- Không có data duplication
- Dễ maintain và query
- Consistent data

**Nhược điểm:**
- Authentication module phụ thuộc vào friend system fields (nhưng có thể để NULL ban đầu)

---

### Option 2: Separate Tables with Foreign Key

Giữ bảng `users` cho authentication, tạo bảng `user_profiles` cho friend system:

```sql
-- Authentication table (minimal)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50)
);

CREATE INDEX idx_users_username ON users(username);

-- Profile table (for friend system and other features)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    online_status VARCHAR(20) DEFAULT 'offline',
    last_online_at TIMESTAMP,
    privacy_settings JSONB DEFAULT '{
        "allowFriendRequests": true,
        "showOnlineStatus": true,
        "showLevel": true
    }',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (online_status IN ('online', 'offline', 'away', 'busy'))
);

CREATE INDEX idx_user_profiles_online_status ON user_profiles(online_status);
```

**Ưu điểm:**
- Separation of concerns rõ ràng
- Authentication module độc lập
- Có thể thêm profile sau khi user đăng ký

**Nhược điểm:**
- Cần JOIN khi query user info đầy đủ
- Phức tạp hơn một chút trong code

---

## Khuyến nghị Implementation

### Chọn Option 1 (Unified Table) vì:

1. **Simplicity**: Dễ query và maintain
2. **Performance**: Không cần JOIN
3. **Consistency**: Single source of truth
4. **Scalability**: Dễ thêm fields mới

### Migration Strategy:

#### Phase 1: Authentication System
```sql
-- Create unified users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile fields (nullable initially)
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    online_status VARCHAR(20) DEFAULT 'offline',
    last_online_at TIMESTAMP,
    privacy_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT valid_status CHECK (online_status IN ('online', 'offline', 'away', 'busy'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(online_status);
```

#### Phase 2: Friend System
- Sử dụng bảng `users` thay vì tạo bảng `players`
- Update foreign keys trong `friendships`, `friend_requests`, `blocked_players` để reference `users(id)`

```sql
-- Friendships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);

-- Friend requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_request CHECK (from_user_id != to_user_id),
    CONSTRAINT valid_request_status CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    CONSTRAINT unique_pending_request UNIQUE (from_user_id, to_user_id, status)
);

CREATE INDEX idx_friend_requests_to_user ON friend_requests(to_user_id, status);
CREATE INDEX idx_friend_requests_from_user ON friend_requests(from_user_id, status);

-- Blocked users table
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_block CHECK (user_id != blocked_user_id),
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id)
);

CREATE INDEX idx_blocked_users_user_id ON blocked_users(user_id);
```

---

## Code Changes Required

### Authentication System

**User Entity** (TypeORM):
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true, length: 50 })
  username: string;
  
  @Column()
  passwordHash: string;
  
  // Profile fields (nullable for backward compatibility)
  @Column({ nullable: true, length: 100 })
  displayName?: string;
  
  @Column({ nullable: true })
  avatarUrl?: string;
  
  @Column({ default: 1 })
  level: number;
  
  @Column({ default: 'offline', length: 20 })
  onlineStatus: string;
  
  @Column({ nullable: true })
  lastOnlineAt?: Date;
  
  @Column({ type: 'jsonb', default: {} })
  privacySettings: object;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Registration Logic Update**:
```typescript
async register(dto: RegisterDto): Promise<AuthResponseDto> {
  // ... validation ...
  
  const hashedPassword = await this.passwordUtil.hash(dto.password);
  
  const user = await this.authRepository.createUser({
    username: dto.username,
    passwordHash: hashedPassword,
    displayName: dto.username, // Default display name = username
    level: 1,
    onlineStatus: 'offline',
    privacySettings: {
      allowFriendRequests: true,
      showOnlineStatus: true,
      showLevel: true
    }
  });
  
  // ... generate token ...
}
```

### Friend System

**Rename all references**:
- `players` → `users`
- `player_id` → `user_id`
- `PlayerAccount` → `User` (or keep PlayerAccount as alias)
- `playerId` → `userId`

**PlayerService** becomes **UserProfileService**:
```typescript
export class UserProfileService {
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
    // Update display_name, avatar_url, etc.
  }
  
  async updateOnlineStatus(userId: string, status: OnlineStatus): Promise<void> {
    // Update online_status
  }
  
  async getUserBasicInfo(userId: string): Promise<UserBasicInfo> {
    // Get user info for friend list
  }
}
```

---

## Action Items

### 1. Update Authentication System Design
- [ ] Modify `user.entity.ts` schema to include profile fields
- [ ] Update migration to create unified users table
- [ ] Update registration logic to set default profile values
- [ ] Update username validation to allow up to 50 characters

### 2. Update Friend System Design
- [ ] Remove `players` table, use `users` table instead
- [ ] Rename all `player_id` to `user_id` in foreign keys
- [ ] Rename `PlayerAccount` interface to `User` or create alias
- [ ] Update all API endpoints to use `/users` instead of `/players`
- [ ] Rename `PlayerService` to `UserProfileService`

### 3. Update Both Systems' Requirements
- [ ] Clarify that authentication creates base user account
- [ ] Friend system extends user with profile information
- [ ] Document that display_name defaults to username on registration

### 4. Update Tasks
- [ ] Authentication: Include profile fields in User entity creation
- [ ] Friend System: Remove player account creation tasks
- [ ] Friend System: Add user profile update tasks

---

## Summary

**Recommended approach**: Unified `users` table với đầy đủ authentication và profile fields.

**Benefits**:
- ✅ No data duplication
- ✅ Single source of truth
- ✅ Simpler queries
- ✅ Better performance
- ✅ Easier to maintain

**Next steps**:
1. Update authentication-system design với unified schema
2. Update friend-system design để sử dụng `users` table
3. Review và approve changes
4. Proceed với implementation
