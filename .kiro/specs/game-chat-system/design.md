# Design Document - Game Chat System

## Overview

Hệ thống Chat trong Game được thiết kế theo kiến trúc client-server với Unity C# client, Node.js TypeScript server, và PostgreSQL database. Hệ thống sử dụng WebSocket để đảm bảo giao tiếp real-time với độ trễ thấp (<500ms), hỗ trợ nhiều loại kênh chat, và tích hợp các công cụ kiểm duyệt nội dung.

### Technology Stack

- **Client**: Unity 2021.3+ với C#
- **Server**: Node.js 18+ với TypeScript, Socket.IO
- **Database**: PostgreSQL 14+
- **Real-time Communication**: Socket.IO (WebSocket với fallback)
- **Caching**: Redis (cho session và message cache)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Unity Client (C#)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat UI      │  │ Message      │  │ Local Cache  │      │
│  │ Manager      │  │ Handler      │  │ Manager      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │ Socket.IO Client│                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ WebSocket/HTTP
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              Node.js Server (TypeScript)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Socket.IO    │  │ Message      │  │ Moderation   │      │
│  │ Gateway      │  │ Service      │  │ Service      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │ Channel      │  │ User         │  │ Report       │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │ Redis Cache     │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │ PostgreSQL        │
                   │ Database          │
                   └───────────────────┘
```

### Communication Flow

1. **Message Send Flow**:
   - Client → Socket.IO → Message Service → Moderation Service → Database
   - Message Service → Redis Cache → Socket.IO → Target Clients

2. **Message Receive Flow**:
   - Socket.IO Event → Client Message Handler → Local Cache → UI Update

3. **Channel Join Flow**:
   - Client → Channel Service → Permission Check → Subscribe to Socket Room

## Components and Interfaces

### Unity Client Components

#### 1. ChatManager (Singleton)
```csharp
public class ChatManager : MonoBehaviour
{
    // Core functionality
    public void Initialize(string serverUrl, string authToken);
    public void SendMessage(string channelId, string content, MessageType type);
    public void JoinChannel(string channelId, ChannelType type);
    public void LeaveChannel(string channelId);
    
    // Message operations
    public void SendQuickMessage(string channelId, int quickMessageId);
    public void ReportMessage(string messageId, string reason);
    public void BlockUser(string userId);
    
    // Settings
    public void UpdateNotificationSettings(NotificationSettings settings);
    public void MuteAllChannels(int durationMinutes);
    
    // Events
    public event Action<ChatMessage> OnMessageReceived;
    public event Action<string> OnChannelJoined;
    public event Action<string, int> OnUnreadCountChanged;
}
```

#### 2. ChatUIController
```csharp
public class ChatUIController : MonoBehaviour
{
    // UI State
    public void ShowChatWindow();
    public void HideChatWindow();
    public void MinimizeChatWindow();
    public void ToggleChatWindow();
    
    // Channel management
    public void SwitchChannel(string channelId);
    public void DisplayChannelList();
    
    // Message display
    public void AddMessageToView(ChatMessage message);
    public void LoadMessageHistory(string channelId, int offset);
    public void ClearMessageHistory();
    
    // Input handling
    public void OnSendButtonClicked();
    public void OnEmojiButtonClicked();
    public void OnQuickMessageButtonClicked();
}
```

#### 3. LocalCacheManager
```csharp
public class LocalCacheManager
{
    // Message caching
    public void CacheMessage(string channelId, ChatMessage message);
    public List<ChatMessage> GetCachedMessages(string channelId, int limit);
    public void ClearChannelCache(string channelId);
    public void ClearAllCache();
    
    // Settings persistence
    public void SaveNotificationSettings(NotificationSettings settings);
    public NotificationSettings LoadNotificationSettings();
    
    // Blocked users
    public void AddBlockedUser(string userId);
    public void RemoveBlockedUser(string userId);
    public bool IsUserBlocked(string userId);
}
```

#### 4. SocketIOClient (Wrapper)
```csharp
public class SocketIOClient
{
    // Connection
    public void Connect(string url, string authToken);
    public void Disconnect();
    public bool IsConnected { get; }
    
    // Event emission
    public void Emit(string eventName, object data);
    
    // Event listeners
    public void On(string eventName, Action<string> callback);
    public void Off(string eventName);
    
    // Room management
    public void JoinRoom(string roomId);
    public void LeaveRoom(string roomId);
}
```

### Server Components (Node.js TypeScript)

#### 1. Socket Gateway
```typescript
export class SocketGateway {
  // Connection handling
  handleConnection(socket: Socket): void;
  handleDisconnect(socket: Socket): void;
  
  // Message events
  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, payload: SendMessageDto): Promise<void>;
  
  @SubscribeMessage('join_channel')
  async handleJoinChannel(client: Socket, payload: JoinChannelDto): Promise<void>;
  
  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(client: Socket, payload: LeaveChannelDto): Promise<void>;
  
  // User actions
  @SubscribeMessage('report_message')
  async handleReportMessage(client: Socket, payload: ReportMessageDto): Promise<void>;
  
  @SubscribeMessage('block_user')
  async handleBlockUser(client: Socket, payload: BlockUserDto): Promise<void>;
  
  // Broadcast helpers
  broadcastToChannel(channelId: string, event: string, data: any): void;
  sendToUser(userId: string, event: string, data: any): void;
}
```

#### 2. Message Service
```typescript
export class MessageService {
  // Message operations
  async createMessage(data: CreateMessageDto): Promise<Message>;
  async getMessages(channelId: string, limit: number, offset: number): Promise<Message[]>;
  async deleteMessage(messageId: string, userId: string): Promise<void>;
  
  // Message validation
  validateMessageContent(content: string): ValidationResult;
  validateMessageLength(content: string): boolean;
  
  // Cache operations
  async cacheMessage(channelId: string, message: Message): Promise<void>;
  async getCachedMessages(channelId: string, limit: number): Promise<Message[]>;
}
```

#### 3. Moderation Service
```typescript
export class ModerationService {
  // Content filtering
  async filterProfanity(content: string): Promise<FilterResult>;
  async checkSpam(userId: string, content: string): Promise<boolean>;
  
  // User actions
  async reportMessage(reportData: ReportMessageDto): Promise<Report>;
  async blockUser(blockerId: string, blockedId: string): Promise<void>;
  async unblockUser(blockerId: string, blockedId: string): Promise<void>;
  
  // Moderation queries
  async getBlockedUsers(userId: string): Promise<string[]>;
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  
  // Profanity list management
  async loadProfanityList(): Promise<string[]>;
  async addProfanityWord(word: string): Promise<void>;
}
```

#### 4. Channel Service
```typescript
export class ChannelService {
  // Channel operations
  async createChannel(data: CreateChannelDto): Promise<Channel>;
  async getChannel(channelId: string): Promise<Channel>;
  async deleteChannel(channelId: string): Promise<void>;
  
  // Member management
  async addMember(channelId: string, userId: string): Promise<void>;
  async removeMember(channelId: string, userId: string): Promise<void>;
  async getChannelMembers(channelId: string): Promise<string[]>;
  
  // Permission checks
  async canUserAccessChannel(userId: string, channelId: string): Promise<boolean>;
  async canUserSendMessage(userId: string, channelId: string): Promise<boolean>;
}
```

#### 5. User Service
```typescript
export class UserService {
  // User operations
  async getUser(userId: string): Promise<User>;
  async updateUserSettings(userId: string, settings: UserSettings): Promise<void>;
  
  // Notification settings
  async getNotificationSettings(userId: string): Promise<NotificationSettings>;
  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<void>;
  
  // Mute operations
  async muteAllChannels(userId: string, durationMinutes: number): Promise<void>;
  async unmuteAllChannels(userId: string): Promise<void>;
  async isMuted(userId: string): Promise<boolean>;
}
```

## Data Models

### Database Schema (PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

#### Channels Table
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'group', 'private')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_channels_type ON channels(type);
```

#### Channel Members Table
```sql
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 500),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'emoji', 'sticker', 'quick')),
  is_filtered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

#### Blocked Users Table
```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
```

#### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  sound_notifications_public BOOLEAN DEFAULT TRUE,
  sound_notifications_group BOOLEAN DEFAULT TRUE,
  sound_notifications_private BOOLEAN DEFAULT TRUE,
  visual_notifications_public BOOLEAN DEFAULT TRUE,
  visual_notifications_group BOOLEAN DEFAULT TRUE,
  visual_notifications_private BOOLEAN DEFAULT TRUE,
  muted_until TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
```

#### Profanity List Table
```sql
CREATE TABLE profanity_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profanity_words_word ON profanity_words(word);
```

#### Quick Messages Table
```sql
CREATE TABLE quick_messages (
  id SERIAL PRIMARY KEY,
  content VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_quick_messages_active ON quick_messages(is_active, display_order);
```

### TypeScript Interfaces

#### Message Models
```typescript
export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  messageType: MessageType;
  isFiltered: boolean;
  createdAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  EMOJI = 'emoji',
  STICKER = 'sticker',
  QUICK = 'quick'
}

export interface SendMessageDto {
  channelId: string;
  content: string;
  messageType: MessageType;
}
```

#### Channel Models
```typescript
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  createdBy: string;
  memberCount?: number;
  createdAt: Date;
}

export enum ChannelType {
  PUBLIC = 'public',
  GROUP = 'group',
  PRIVATE = 'private'
}

export interface JoinChannelDto {
  channelId: string;
  channelType: ChannelType;
}
```

#### User Models
```typescript
export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  createdAt: Date;
}

export interface NotificationSettings {
  soundNotifications: {
    public: boolean;
    group: boolean;
    private: boolean;
  };
  visualNotifications: {
    public: boolean;
    group: boolean;
    private: boolean;
  };
  mutedUntil: Date | null;
}
```

#### Moderation Models
```typescript
export interface Report {
  id: string;
  messageId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved'
}

export interface FilterResult {
  isFiltered: boolean;
  filteredContent: string;
  violationCount: number;
}
```

### Unity C# Data Models

```csharp
[Serializable]
public class ChatMessage
{
    public string Id;
    public string ChannelId;
    public string SenderId;
    public string SenderName;
    public string SenderAvatar;
    public string Content;
    public MessageType Type;
    public bool IsFiltered;
    public DateTime CreatedAt;
}

public enum MessageType
{
    Text,
    Emoji,
    Sticker,
    Quick
}

[Serializable]
public class ChatChannel
{
    public string Id;
    public string Name;
    public ChannelType Type;
    public int MemberCount;
    public int UnreadCount;
}

public enum ChannelType
{
    Public,
    Group,
    Private
}

[Serializable]
public class NotificationSettings
{
    public ChannelNotificationSettings SoundNotifications;
    public ChannelNotificationSettings VisualNotifications;
    public DateTime? MutedUntil;
}

[Serializable]
public class ChannelNotificationSettings
{
    public bool Public = true;
    public bool Group = true;
    public bool Private = true;
}
```

## Error Handling

### Client-Side Error Handling

```csharp
public class ChatErrorHandler
{
    public void HandleConnectionError(string error)
    {
        // Show reconnection UI
        // Attempt exponential backoff reconnection
        // Cache messages for retry
    }
    
    public void HandleMessageSendError(string messageId, string error)
    {
        // Mark message as failed in UI
        // Provide retry option
        // Log error for debugging
    }
    
    public void HandleAuthenticationError()
    {
        // Clear auth token
        // Redirect to login
        // Clear local cache
    }
}
```

### Server-Side Error Handling

```typescript
export class ErrorHandler {
  handleSocketError(socket: Socket, error: Error): void {
    logger.error('Socket error:', error);
    socket.emit('error', {
      code: this.getErrorCode(error),
      message: this.getUserFriendlyMessage(error)
    });
  }
  
  handleDatabaseError(error: Error): void {
    logger.error('Database error:', error);
    // Implement retry logic
    // Alert monitoring system
  }
  
  handleValidationError(error: ValidationError): void {
    // Return specific validation messages
    // Log validation failures for analysis
  }
}
```

### Error Codes

```typescript
export enum ErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'E1001',
  AUTHENTICATION_FAILED = 'E1002',
  
  // Message errors
  MESSAGE_TOO_LONG = 'E2001',
  MESSAGE_EMPTY = 'E2002',
  CHANNEL_NOT_FOUND = 'E2003',
  PERMISSION_DENIED = 'E2004',
  
  // User errors
  USER_BLOCKED = 'E3001',
  USER_MUTED = 'E3002',
  
  // Server errors
  INTERNAL_ERROR = 'E5000',
  DATABASE_ERROR = 'E5001'
}
```

## Testing Strategy

### Unit Testing

#### Unity Client Tests
```csharp
[TestFixture]
public class ChatManagerTests
{
    [Test]
    public void SendMessage_ValidContent_Success()
    {
        // Arrange
        var chatManager = new ChatManager();
        var channelId = "test-channel";
        var content = "Hello world";
        
        // Act
        chatManager.SendMessage(channelId, content, MessageType.Text);
        
        // Assert
        Assert.IsTrue(chatManager.IsSending);
    }
    
    [Test]
    public void SendMessage_ContentTooLong_ThrowsException()
    {
        // Arrange
        var chatManager = new ChatManager();
        var content = new string('a', 501);
        
        // Act & Assert
        Assert.Throws<ArgumentException>(() => 
            chatManager.SendMessage("channel", content, MessageType.Text));
    }
}
```

#### Server Tests
```typescript
describe('MessageService', () => {
  let messageService: MessageService;
  
  beforeEach(() => {
    messageService = new MessageService();
  });
  
  it('should create message with valid content', async () => {
    const dto: CreateMessageDto = {
      channelId: 'test-channel',
      senderId: 'user-1',
      content: 'Hello',
      messageType: MessageType.TEXT
    };
    
    const message = await messageService.createMessage(dto);
    
    expect(message).toBeDefined();
    expect(message.content).toBe('Hello');
  });
  
  it('should filter profanity in message', async () => {
    const content = 'This contains badword';
    const result = await messageService.filterProfanity(content);
    
    expect(result.isFiltered).toBe(true);
    expect(result.filteredContent).toContain('***');
  });
});
```

### Integration Testing

```typescript
describe('Chat Integration Tests', () => {
  it('should send and receive message end-to-end', async () => {
    // Setup: Connect two clients
    const client1 = io('http://localhost:3000');
    const client2 = io('http://localhost:3000');
    
    // Both join same channel
    await client1.emit('join_channel', { channelId: 'test' });
    await client2.emit('join_channel', { channelId: 'test' });
    
    // Client 1 sends message
    const messagePromise = new Promise((resolve) => {
      client2.on('message_received', resolve);
    });
    
    client1.emit('send_message', {
      channelId: 'test',
      content: 'Hello',
      messageType: 'text'
    });
    
    // Client 2 should receive
    const receivedMessage = await messagePromise;
    expect(receivedMessage.content).toBe('Hello');
  });
});
```

### Performance Testing

```typescript
describe('Performance Tests', () => {
  it('should handle 1000 concurrent connections', async () => {
    const clients = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      clients.push(io('http://localhost:3000'));
    }
    
    await Promise.all(clients.map(c => c.connect()));
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
  
  it('should deliver message within 500ms', async () => {
    const client1 = io('http://localhost:3000');
    const client2 = io('http://localhost:3000');
    
    const startTime = Date.now();
    
    const messagePromise = new Promise((resolve) => {
      client2.on('message_received', () => {
        const latency = Date.now() - startTime;
        resolve(latency);
      });
    });
    
    client1.emit('send_message', { /* ... */ });
    
    const latency = await messagePromise;
    expect(latency).toBeLessThan(500);
  });
});
```

### UI Testing (Unity)

```csharp
[TestFixture]
public class ChatUITests
{
    [UnityTest]
    public IEnumerator ChatWindow_Opens_WithinOneSecond()
    {
        var chatUI = CreateChatUI();
        var startTime = Time.time;
        
        chatUI.ShowChatWindow();
        
        yield return new WaitUntil(() => chatUI.IsVisible);
        
        var duration = Time.time - startTime;
        Assert.Less(duration, 1.0f);
    }
    
    [Test]
    public void MessageList_ScrollUp_LoadsHistory()
    {
        var chatUI = CreateChatUI();
        var initialCount = chatUI.MessageCount;
        
        chatUI.ScrollToTop();
        
        Assert.Greater(chatUI.MessageCount, initialCount);
    }
}
```

## Performance Optimization

### Client-Side Optimizations

1. **Message Pooling**: Reuse message UI elements instead of instantiating new ones
2. **Lazy Loading**: Load message history on demand
3. **Local Caching**: Cache recent messages to reduce server requests
4. **Texture Atlasing**: Combine emoji/sticker sprites into atlases
5. **UI Virtualization**: Only render visible messages in scroll view

### Server-Side Optimizations

1. **Redis Caching**: Cache recent messages and active channels
2. **Connection Pooling**: Reuse database connections
3. **Message Batching**: Batch database writes for better throughput
4. **Room-based Broadcasting**: Use Socket.IO rooms for efficient message distribution
5. **Rate Limiting**: Prevent spam with per-user rate limits

### Database Optimizations

1. **Indexing**: Proper indexes on frequently queried columns
2. **Partitioning**: Partition messages table by date for better query performance
3. **Archiving**: Move old messages to archive tables
4. **Query Optimization**: Use prepared statements and avoid N+1 queries

## Security Considerations

### Authentication & Authorization

```typescript
// JWT-based authentication
export class AuthMiddleware {
  async validateToken(socket: Socket, next: Function): Promise<void> {
    const token = socket.handshake.auth.token;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }
}

// Permission checks
export class PermissionGuard {
  async canAccessChannel(userId: string, channelId: string): Promise<boolean> {
    // Check if user is member of channel
    // Check if channel is public
    // Check if user is blocked
  }
}
```

### Input Validation

```typescript
export class MessageValidator {
  validate(dto: SendMessageDto): ValidationResult {
    const errors: string[] = [];
    
    // Length validation
    if (dto.content.length > 500) {
      errors.push('Message too long');
    }
    
    // XSS prevention
    if (this.containsScriptTags(dto.content)) {
      errors.push('Invalid content');
    }
    
    // SQL injection prevention (handled by ORM)
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### Rate Limiting

```typescript
export class RateLimiter {
  private readonly limits = {
    messagesPerMinute: 20,
    messagesPerHour: 200
  };
  
  async checkLimit(userId: string): Promise<boolean> {
    const key = `rate:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 60);
    }
    
    return count <= this.limits.messagesPerMinute;
  }
}
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│ Node.js│      │ Node.js │
│ Server │      │ Server  │
│   #1   │      │   #2    │
└───┬────┘      └────┬────┘
    │                │
    └────────┬───────┘
             │
    ┌────────▼────────┐
    │  Redis Cluster  │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   PostgreSQL    │
    │   Primary +     │
    │   Replicas      │
    └─────────────────┘
```

### Scaling Strategy

1. **Horizontal Scaling**: Multiple Node.js instances behind load balancer
2. **Redis for Session Sharing**: Share socket sessions across instances
3. **Database Read Replicas**: Distribute read queries
4. **CDN for Static Assets**: Serve emoji/sticker assets from CDN

## Monitoring and Logging

### Metrics to Track

```typescript
export class MetricsCollector {
  // Performance metrics
  trackMessageLatency(latency: number): void;
  trackConnectionCount(count: number): void;
  trackMessageThroughput(messagesPerSecond: number): void;
  
  // Business metrics
  trackActiveUsers(count: number): void;
  trackMessagesPerChannel(channelId: string, count: number): void;
  trackModerationActions(action: string): void;
  
  // Error metrics
  trackErrorRate(errorType: string): void;
  trackFailedConnections(): void;
}
```

### Logging Strategy

```typescript
export class Logger {
  info(message: string, context?: any): void {
    // Log to console and file
    // Send to centralized logging (e.g., ELK stack)
  }
  
  error(message: string, error: Error, context?: any): void {
    // Log error with stack trace
    // Alert on critical errors
    // Send to error tracking (e.g., Sentry)
  }
  
  audit(action: string, userId: string, details: any): void {
    // Log user actions for compliance
    // Store in separate audit log
  }
}
```

