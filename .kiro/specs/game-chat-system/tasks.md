# Implementation Plan

- [ ] 1. Setup project structure and dependencies
  - Create Unity project structure with folders: Scripts/Chat, UI/Chat, Resources/Chat
  - Initialize Node.js TypeScript project with Socket.IO, Express, TypeORM
  - Setup PostgreSQL database and create initial migration files
  - Configure Redis connection for caching
  - _Requirements: 1.1, 1.2_

- [ ] 2. Implement database schema and models
  - [ ] 2.1 Create PostgreSQL tables and indexes
    - Write migration scripts for all 9 tables (users, channels, channel_members, messages, blocked_users, reports, user_settings, profanity_words, quick_messages)
    - Add indexes for performance optimization
    - Seed initial data for quick_messages and profanity_words
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 2.4, 3.1, 3.2, 3.4, 4.1, 4.2, 4.5, 6.1_
  
  - [ ] 2.2 Create TypeScript entity models
    - Implement TypeORM entities for all database tables
    - Define relationships between entities
    - Add validation decorators
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 2.4, 3.1, 3.2, 3.4, 4.1, 4.2, 4.5, 6.1_

- [ ] 3. Build server-side core services
  - [ ] 3.1 Implement User Service
    - Create user CRUD operations
    - Implement notification settings management
    - Add mute/unmute functionality with duration support
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 3.2 Implement Channel Service
    - Create channel CRUD operations for public, group, and private types
    - Implement member management (add, remove, list)
    - Add permission checking logic
    - _Requirements: 1.1, 1.2_
  
  - [ ] 3.3 Implement Message Service
    - Create message creation with 500 character limit validation
    - Implement message retrieval with pagination (20 messages per page)
    - Add message caching to Redis with 100 message limit per channel
    - Implement message deletion for moderators
    - _Requirements: 1.2, 1.3, 1.4, 6.1, 6.2, 6.3_
  
  - [ ] 3.4 Implement Moderation Service
    - Create profanity filter using word list from database
    - Implement automatic content filtering with asterisk replacement
    - Add report message functionality with logging
    - Implement block/unblock user operations
    - Add violation logging
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Build Socket.IO gateway and real-time communication
  - [ ] 4.1 Setup Socket.IO server with authentication
    - Configure Socket.IO with CORS and authentication middleware
    - Implement JWT token validation
    - Add connection/disconnection handlers
    - _Requirements: 1.2_
  
  - [ ] 4.2 Implement message event handlers
    - Create 'send_message' event handler with validation
    - Implement 'join_channel' event with permission checks
    - Add 'leave_channel' event handler
    - Implement room-based broadcasting for channels
    - Ensure message delivery within 500ms
    - _Requirements: 1.2, 1.3, 2.4_
  
  - [ ] 4.3 Implement user action event handlers
    - Create 'report_message' event handler
    - Implement 'block_user' event handler
    - Add 'update_settings' event handler
    - _Requirements: 3.1, 3.2, 4.4_
  
  - [ ] 4.4 Add rate limiting and spam prevention
    - Implement rate limiter (20 messages per minute, 200 per hour)
    - Add spam detection logic
    - Create error responses for rate limit violations
    - _Requirements: 1.2_

- [ ] 5. Implement Unity client data models and networking
  - [ ] 5.1 Create C# data models
    - Implement ChatMessage, ChatChannel, NotificationSettings classes
    - Add MessageType and ChannelType enums
    - Create serializable DTOs for network communication
    - _Requirements: 1.1, 1.4, 4.1, 4.2_
  
  - [ ] 5.2 Implement SocketIOClient wrapper
    - Create Socket.IO client wrapper for Unity
    - Implement connection/disconnection with exponential backoff
    - Add event emission and listener methods
    - Implement room join/leave functionality
    - _Requirements: 1.2_
  
  - [ ] 5.3 Build ChatManager singleton
    - Create singleton ChatManager with initialization
    - Implement SendMessage with type support (text, emoji, sticker, quick)
    - Add JoinChannel and LeaveChannel methods
    - Implement SendQuickMessage with 200ms delivery target
    - Add ReportMessage and BlockUser methods
    - Create UpdateNotificationSettings method
    - Implement MuteAllChannels with duration support
    - Add event system for OnMessageReceived, OnChannelJoined, OnUnreadCountChanged
    - _Requirements: 1.2, 1.3, 1.5, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Implement Unity client local caching
  - [ ] 6.1 Create LocalCacheManager
    - Implement message caching with 100 message limit per channel
    - Add GetCachedMessages with limit parameter
    - Implement ClearChannelCache and ClearAllCache
    - Add cache clearing on logout
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [ ] 6.2 Implement settings persistence
    - Create SaveNotificationSettings to PlayerPrefs
    - Implement LoadNotificationSettings on startup
    - Add blocked users list persistence
    - _Requirements: 4.5_
  
  - [ ] 6.3 Add offline message queue
    - Implement queue for messages sent while offline
    - Add retry logic when connection restored
    - Create failed message tracking
    - _Requirements: 1.2_

- [ ] 7. Build Unity chat UI system
  - [ ] 7.1 Create ChatUIController
    - Implement ShowChatWindow, HideChatWindow, MinimizeChatWindow, ToggleChatWindow
    - Add collapsible overlay with minimize to icon
    - Implement auto-minimize after 3 seconds of inactivity
    - Ensure chat window occupies max 30% screen height on mobile
    - Add semi-transparent background with 80% opacity
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 7.2 Implement message display system
    - Create message list with scroll view
    - Implement AddMessageToView with sender avatar, name, timestamp, content
    - Add LoadMessageHistory with pagination (20 messages initially, 20 more on scroll up)
    - Implement message pooling for performance
    - Add visual notification badge on chat icon for new messages
    - _Requirements: 1.4, 1.5, 6.2, 6.3_
  
  - [ ] 7.3 Build message input system
    - Create text input field with 500 character limit
    - Add send button handler
    - Implement emoji picker with 50+ emoji icons
    - Create sticker selector with 20+ sticker images
    - Add QuickMessage button with radial menu
    - Ensure QuickMessage button is 48+ pixels diameter
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.5, 7.2, 7.3_
  
  - [ ] 7.4 Implement channel switching UI
    - Create channel list display
    - Add SwitchChannel functionality
    - Implement swipe gestures to switch between channels
    - Add unread count indicators per channel
    - _Requirements: 1.1, 7.4_
  
  - [ ] 7.5 Add mobile-optimized controls
    - Position primary buttons within 120 pixels from bottom edge
    - Implement drag-and-reposition functionality for chat window
    - Use minimum 14 pixel font size for message text
    - Optimize layout for one-handed operation
    - _Requirements: 7.1, 5.3, 7.5_

- [ ] 8. Implement content moderation features
  - [ ] 8.1 Add client-side message actions
    - Create context menu on message long-press
    - Add "Report" option with reason input
    - Implement "Block User" option with confirmation
    - _Requirements: 3.1, 3.2_
  
  - [ ] 8.2 Implement blocked user filtering
    - Filter out messages from blocked users in all channels
    - Update UI to hide blocked user messages
    - Persist blocked user list locally
    - _Requirements: 3.3_
  
  - [ ] 8.3 Add filtered message display
    - Display filtered messages with asterisks replacing profanity
    - Show indicator when message was filtered
    - _Requirements: 3.4, 3.5_

- [ ] 9. Implement notification system
  - [ ] 9.1 Create notification settings UI
    - Build settings panel with toggles for each channel type
    - Add separate controls for sound and visual notifications
    - Implement mute all channels option with duration selector (15, 30, 60 minutes)
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 9.2 Implement notification handlers
    - Create sound notification player for each channel type
    - Implement visual notification badge system
    - Add notification filtering based on user settings
    - Apply settings immediately without restart
    - Check mute status before showing notifications
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 10. Add error handling and reconnection logic
  - [ ] 10.1 Implement client-side error handling
    - Create ChatErrorHandler for connection errors
    - Add message send failure handling with retry option
    - Implement authentication error handling
    - Show user-friendly error messages
    - _Requirements: 1.2_
  
  - [ ] 10.2 Add automatic reconnection
    - Implement exponential backoff reconnection strategy
    - Cache unsent messages during disconnection
    - Restore channel subscriptions on reconnect
    - Show connection status indicator
    - _Requirements: 1.2_
  
  - [ ] 10.3 Implement server-side error handling
    - Add error middleware for Socket.IO
    - Implement database error handling with retry
    - Create validation error responses
    - Add error logging and monitoring
    - _Requirements: 1.2, 1.3_

- [ ] 11. Performance optimization
  - [ ] 11.1 Optimize client performance
    - Implement UI virtualization for message list
    - Create texture atlasing for emoji/stickers
    - Add object pooling for message UI elements
    - Optimize memory usage for large chat histories
    - _Requirements: 6.2, 6.3_
  
  - [ ] 11.2 Optimize server performance
    - Implement message batching for database writes
    - Add database connection pooling
    - Optimize Redis caching strategy
    - Implement query optimization with proper indexes
    - _Requirements: 1.2, 6.1_

- [ ] 12. Testing and quality assurance
  - [ ] 12.1 Write Unity unit tests
    - Test ChatManager message sending and receiving
    - Test LocalCacheManager caching logic
    - Test message validation (length, content)
    - Test notification settings persistence
    - _Requirements: 1.2, 1.3, 4.5, 6.1_
  
  - [ ] 12.2 Write server unit tests
    - Test MessageService CRUD operations
    - Test ModerationService profanity filtering
    - Test ChannelService permission checks
    - Test UserService settings management
    - _Requirements: 1.2, 3.4, 4.1_
  
  - [ ] 12.3 Write integration tests
    - Test end-to-end message flow from client to server to client
    - Test channel join/leave with multiple clients
    - Test block user functionality across channels
    - Test notification settings propagation
    - _Requirements: 1.2, 3.3, 4.4_
  
  - [ ] 12.4 Perform performance testing
    - Test message delivery latency (target <500ms)
    - Test concurrent connection handling (1000+ users)
    - Test message throughput under load
    - Verify UI responsiveness on mobile devices
    - _Requirements: 1.2, 2.4_

