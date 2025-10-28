# Implementation Plan

- [ ] 1. Set up project structure for both Unity client and Node.js server
  - Create Unity project structure: Scripts/Leaderboard/{Managers, UI, Models, API, Cache}
  - Create Node.js server structure: src/{models, services, repositories, controllers, middleware}
  - Define C# data models for Unity (LeaderboardData, LeaderboardEntry, ScoreSubmission, LeagueInfo)
  - Define TypeScript interfaces for server (LeaderboardEntry, ScoreSubmission, LeagueInfo, and other core types)
  - Implement database schema creation scripts for players, leaderboard_scores, leagues, league_memberships, and score_submissions tables
  - _Requirements: 1.1, 2.5, 3.1_

- [ ] 2. Implement Unity client core components
  - [ ] 2.1 Create LeaderboardConfig ScriptableObject
    - Define configuration fields (API URL, cache settings, UI settings, refresh settings)
    - Create default config asset in Unity project
    - _Requirements: 1.1, 1.2_
  
  - [ ] 2.2 Implement LeaderboardCache for Unity
    - Create cache dictionary with TTL support
    - Implement Set, TryGet, InvalidateAll, and InvalidateByPrefix methods
    - Add cache expiration checking logic
    - _Requirements: 1.2, 2.1_
  
  - [ ] 2.3 Build LeaderboardAPIClient
    - Implement GetLeaderboard method with UnityWebRequest
    - Add GetPlayerRank method for individual player rank queries
    - Create SubmitScore method with POST request
    - Implement GetLeagueLeaderboard and GetEventLeaderboard methods
    - Add authentication header handling
    - Integrate with LeaderboardCache for caching responses
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_
  
  - [ ] 2.4 Create LeaderboardManager MonoBehaviour
    - Implement singleton pattern
    - Add Initialize method to set up API client
    - Create public methods: GetLeaderboard, GetLeaderboardAroundPlayer, GetPlayerRank, SubmitScore
    - Add league-related methods: GetPlayerLeague, GetLeagueLeaderboard
    - Implement event system for OnLeaderboardLoaded, OnPlayerRankUpdated, OnScoreSubmitted
    - Add error handling and OnError event
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 5.1_

- [ ] 3. Build Unity leaderboard UI system
  - [ ] 3.1 Create LeaderboardEntry UI component
    - Design prefab with rank text, avatar image, player name, score, clan emblem
    - Implement Setup method to populate entry data
    - Add highlight background for current player
    - Create top rank badge display for top 3 players
    - Implement profile button click handler
    - Add score formatting logic (K, M suffixes)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 3.2 Implement LeaderboardUIManager
    - Create leaderboard window UI with tab navigation
    - Implement DisplayLeaderboardData to populate entry list
    - Add HighlightPlayerEntry to emphasize current player
    - Create ScrollToPlayerPosition for auto-scrolling
    - Implement ShowLoadingState and ShowErrorState
    - Add leaderboard type selector UI
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 3.3 Create LeaderboardTypeSelector component
    - Design tab UI for Global, Regional, Friends, Clan, Event, League types
    - Implement tab switching with visual feedback
    - Add event to notify LeaderboardUIManager of type changes
    - _Requirements: 1.1, 1.3_
  
  - [ ] 3.4 Build PlayerRankDisplay component
    - Create UI to show player's current rank prominently
    - Display rank change indicator (up/down arrows)
    - Show player's score and position in leaderboard
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 3.5 Implement RefreshCycleTimer component
    - Display countdown timer for next leaderboard reset
    - Show current cycle information (weekly, monthly, etc.)
    - Add visual warning when reset is approaching (< 24 hours)
    - _Requirements: 3.3, 3.5_
  
  - [ ] 3.6 Create RewardTierDisplay component
    - Display reward tiers with rank thresholds
    - Show reward items with icons and quantities
    - Highlight player's current reward tier eligibility
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 3.7 Build LeagueInfoPanel component
    - Display player's current league tier with icon
    - Show promotion/demotion thresholds
    - Display time until next league transition
    - Add visual indicators for promotion/demotion zones
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4. Implement database layer and repositories (Server)
  - [ ] 4.1 Create base repository pattern with connection pooling
    - Implement database connection manager with pooling configuration
    - Create base repository interface with common CRUD operations
    - _Requirements: 1.2, 2.1_
  
  - [ ] 4.2 Implement LeaderboardScoreRepository
    - Write methods for score insertion, updates, and queries
    - Implement ranking queries with proper indexing for Global and Regional leaderboards
    - Add methods for retrieving player rank and nearby players
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_
  
  - [ ] 4.3 Implement LeagueRepository
    - Create methods for league creation, player assignment, and membership management
    - Implement queries for league standings and player league lookup
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 4.4 Implement ArchiveRepository
    - Create methods for archiving leaderboard data at cycle end
    - Implement queries for retrieving historical leaderboard data
    - _Requirements: 3.2, 3.4_

- [ ] 5. Build caching layer with Redis (Server)
  - [ ] 5.1 Set up Redis connection and cache manager
    - Configure Redis client with connection pooling
    - Implement CacheManager interface with get, set, and invalidate methods
    - Define cache key patterns for different leaderboard types
    - _Requirements: 1.2, 2.1_
  
  - [ ] 5.2 Implement cache strategies for leaderboard queries
    - Add cache-aside pattern for leaderboard data retrieval
    - Implement TTL-based expiration (5 minutes for leaderboards, 1 minute for player ranks)
    - Create cache invalidation logic for score updates
    - _Requirements: 1.2, 2.1_
  
  - [ ] 5.3 Add cache warming for popular leaderboards
    - Implement background job to pre-populate cache for top 100 global leaderboard
    - Add cache warming for active event leaderboards
    - _Requirements: 1.2_

- [ ] 6. Create score validation and anti-cheat service (Server)
  - [ ] 6.1 Implement ScoreValidator with basic validation rules
    - Create validation logic for score range checks (minimum/maximum thresholds)
    - Implement session validation to match score with active game session
    - Add device fingerprint validation
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 6.2 Add statistical anomaly detection
    - Implement historical player performance tracking
    - Create statistical models to detect outlier scores (z-score analysis)
    - Add flagging logic for scores exceeding 3 standard deviations from player average
    - _Requirements: 7.2, 7.3_
  
  - [ ] 6.3 Build flagged score review system
    - Create flag queue for suspicious submissions
    - Implement admin review interface data structures
    - Add methods for approving or rejecting flagged scores
    - _Requirements: 7.3, 7.4_

- [ ] 7. Develop core ranking engine (Server)
  - [ ] 7.1 Implement RankingEngine for Global and Regional leaderboards
    - Create methods to calculate player rankings using database queries
    - Implement efficient rank lookup for individual players
    - Add logic to retrieve players around a specific rank (±3 positions)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 7.2 Add Friends leaderboard support
    - Implement ranking calculation filtered by friendship relationships
    - Integrate with friendships table to retrieve friend list
    - Handle edge case where player has no friends
    - _Requirements: 1.1, 1.2, 1.4, 6.5_
  
  - [ ] 7.3 Implement Clan leaderboard aggregation
    - Create aggregation logic to sum clan member scores
    - Implement clan ranking calculation with member count display
    - Add real-time clan rank updates on member score changes
    - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 7.4 Build player context retrieval
    - Implement method to get player's current rank across all leaderboard types
    - Add logic to retrieve nearby competitors (3 above, 3 below)
    - Create highlighted entry formatting for player's own position
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 8. Implement score submission service (Server)
  - [ ] 8.1 Create ScoreSubmissionService with validation pipeline
    - Build score submission handler that coordinates with ScoreValidator
    - Implement submission queuing for high-volume periods
    - Add transaction management for score updates
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 8.2 Add score update logic with cache invalidation
    - Implement logic to update or insert player scores in database
    - Trigger cache invalidation for affected leaderboard segments
    - Handle concurrent score submissions for same player
    - _Requirements: 2.1, 9.2_
  
  - [ ] 8.3 Integrate notification triggers for rank changes
    - Detect significant rank changes (±10 positions, reward tier changes)
    - Queue notification events for NotificationService
    - Implement friend overtake detection and notification
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 9. Build league management system (Server)
  - [ ] 9.1 Implement LeagueManager for player assignment
    - Create algorithm to assign new players to appropriate league tier
    - Implement league bracket creation with 50-player capacity
    - Add logic to balance league populations
    - _Requirements: 5.1_
  
  - [ ] 9.2 Create weekly league transition processor
    - Build batch job to process all league transitions at week end
    - Implement promotion logic for top 10 players
    - Implement demotion logic for bottom 10 players
    - Handle players in positions 11-40 (maintain current league)
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ] 9.3 Add league leaderboard queries
    - Implement ranking queries scoped to specific league brackets
    - Create league standings display with promotion/demotion indicators
    - Add highest tier achievement tracking
    - _Requirements: 5.1, 5.5_

- [ ] 10. Implement refresh cycle management (Server)
  - [ ] 10.1 Create refresh cycle configuration system
    - Define refresh cycle types (daily, weekly, monthly, seasonal, permanent)
    - Implement cycle identifier generation (e.g., "2025-W43", "2025-10")
    - Add cycle metadata storage and retrieval
    - _Requirements: 3.1, 3.2_
  
  - [ ] 10.2 Build leaderboard reset scheduler
    - Implement scheduled job to trigger leaderboard resets at cycle end
    - Create archiving process to save final standings before reset
    - Add logic to clear current cycle scores and start new cycle
    - _Requirements: 3.2, 3.4_
  
  - [ ] 10.3 Add countdown timer and notification system
    - Implement countdown calculation for time remaining in cycle
    - Create notification job to alert players 24 hours before reset
    - Add UI data for displaying refresh cycle information
    - _Requirements: 3.3, 3.5_

- [ ] 11. Develop event leaderboard system (Server)
  - [ ] 11.1 Create EventLeaderboardManager
    - Implement event leaderboard creation with start/end times
    - Add event configuration storage (eligibility rules, reward tiers)
    - Create event leaderboard activation and deactivation logic
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [ ] 11.2 Add event-specific ranking and queries
    - Implement ranking calculation scoped to event participants
    - Create event countdown timer display
    - Add eligibility checking for event leaderboard access
    - _Requirements: 8.2, 8.3, 8.5_
  
  - [ ] 11.3 Build event finalization and reward distribution
    - Implement event end processor to finalize rankings within 15 minutes
    - Create reward distribution logic based on final standings
    - Add reward claim tracking and history
    - _Requirements: 8.4, 4.4_

- [ ] 12. Implement reward system integration (Server)
  - [ ] 12.1 Create reward tier configuration
    - Define reward tier data structures (rank thresholds, reward items)
    - Implement reward tier display logic for leaderboard UI
    - Add reward eligibility checking for player's current rank
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 12.2 Build automatic reward distribution
    - Implement reward distribution job triggered at cycle/event end
    - Create logic to grant highest applicable reward tier only
    - Add reward distribution logging and audit trail
    - _Requirements: 4.4, 4.5_

- [ ] 13. Build leaderboard API endpoints (Server)
  - [ ] 13.1 Create API Gateway with authentication and rate limiting
    - Set up Express/Fastify API server with routing
    - Implement JWT-based authentication middleware
    - Add rate limiting (100 queries/min, 10 submissions/min per player)
    - _Requirements: 1.1, 1.2_
  
  - [ ] 13.2 Implement leaderboard query endpoints
    - Create GET /leaderboards/:type endpoint with pagination
    - Add GET /leaderboards/:type/player/:playerId endpoint for player rank
    - Implement GET /leaderboards/:type/context endpoint for player context (nearby players)
    - Add query parameters for refresh cycle selection
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 13.3 Create score submission endpoint
    - Implement POST /scores endpoint with validation
    - Add request body validation for ScoreSubmission format
    - Return submission result with updated rank
    - _Requirements: 7.1, 7.2_
  
  - [ ] 13.4 Add league-specific endpoints
    - Create GET /leagues/player/:playerId endpoint for player's league info
    - Implement GET /leagues/:leagueId/leaderboard endpoint for league standings
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 13.5 Implement event leaderboard endpoints
    - Create POST /events/leaderboards endpoint for event creation (admin only)
    - Add GET /events/:eventId/leaderboard endpoint for event standings
    - Implement POST /events/:eventId/end endpoint for manual event finalization
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 13.6 Add player profile and archive endpoints
    - Create GET /players/:playerId/profile endpoint with privacy controls
    - Implement GET /leaderboards/:type/archive/:cycle endpoint for historical data
    - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 14. Implement notification service integration (Server)
  - [ ] 14.1 Create notification event queue
    - Set up message queue (RabbitMQ/Redis Pub-Sub) for notification events
    - Define notification event types (rank change, league transition, friend overtake)
    - Implement event publishing from RankingEngine and LeagueManager
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 14.2 Build notification preference management
    - Create player notification preferences data model
    - Implement preference storage and retrieval
    - Add notification filtering based on player preferences
    - _Requirements: 10.4_
  
  - [ ] 14.3 Add notification rate limiting
    - Implement daily notification cap (5 per day per player)
    - Create notification priority system to send most important notifications first
    - Add notification batching for multiple events
    - _Requirements: 10.5_

- [ ] 15. Create background job scheduler (Server)
  - [ ] 15.1 Set up job scheduler framework
    - Configure job scheduler (node-cron, Bull, or similar)
    - Define job execution logging and error handling
    - Implement retry logic with exponential backoff
    - _Requirements: 3.2, 5.2, 5.3, 5.4_
  
  - [ ] 15.2 Implement scheduled jobs
    - Create weekly league transition job (runs Sunday midnight)
    - Add daily/weekly/monthly leaderboard reset jobs based on configuration
    - Implement cache warming job (runs every 5 minutes)
    - Create leaderboard archiving job (runs at cycle end)
    - Add pre-reset notification job (runs 24 hours before reset)
    - _Requirements: 3.2, 3.4, 3.5, 5.2, 5.3, 5.4_

- [ ] 16. Build admin tools and monitoring (Server)
  - [ ] 16.1 Create admin API endpoints
    - Implement GET /admin/scores/flagged endpoint to view flagged submissions
    - Add POST /admin/scores/:submissionId/review endpoint for manual review
    - Create POST /admin/players/:playerId/ban endpoint for cheater bans
    - Implement GET /admin/metrics endpoint for system health metrics
    - _Requirements: 7.3, 7.4_
  
  - [ ] 16.2 Add monitoring and alerting
    - Implement metrics collection (query latency, cache hit rate, submission success rate)
    - Create health check endpoint for service monitoring
    - Add logging for all critical operations (score submissions, rank changes, league transitions)
    - Set up alert thresholds (latency > 500ms, cache hit < 80%, failure rate > 5%)
    - _Requirements: 1.2, 7.5_

- [ ] 17. Implement error handling and resilience (Server)
  - [ ] 17.1 Add comprehensive error handling
    - Create standardized error response format with error codes
    - Implement error handling middleware for API endpoints
    - Add specific error types (ValidationError, AuthenticationError, RateLimitError, etc.)
    - _Requirements: 1.2, 7.1, 7.2_
  
  - [ ] 17.2 Build graceful degradation mechanisms
    - Implement fallback to database when cache is unavailable
    - Add provisional ranking when anti-cheat service is down
    - Create stale data indicators when database read fails
    - _Requirements: 1.2, 2.1_
  
  - [ ] 17.3 Add retry mechanisms
    - Implement client retry logic for score submissions (3 attempts with exponential backoff)
    - Add automatic retry for background jobs (5 attempts)
    - Create dead letter queue for failed operations
    - _Requirements: 7.1_

- [ ] 18. Write integration tests (Server)
  - [ ] 18.1 Test score submission flow
    - Write tests for valid score submission with anti-cheat validation
    - Test flagged score handling and review process
    - Verify cache invalidation after score update
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 18.2 Test leaderboard query operations
    - Write tests for all leaderboard types (Global, Regional, Friends, Clan, Event, League)
    - Test pagination and player context retrieval
    - Verify cache hit and cache miss scenarios
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 18.3 Test league transition process
    - Write tests for weekly league transitions with promotions and demotions
    - Test edge cases (highest tier, lowest tier, new players)
    - Verify league bracket balancing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 18.4 Test refresh cycle management
    - Write tests for leaderboard reset at cycle end
    - Test archiving process and historical data retrieval
    - Verify notification triggers before reset
    - _Requirements: 3.2, 3.4, 3.5_
  
  - [ ] 18.5 Test event leaderboard lifecycle
    - Write tests for event creation, active period, and finalization
    - Test reward distribution based on final rankings
    - Verify event eligibility checking
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 19. Perform load and performance testing (Server)
  - [ ] 19.1 Run load tests for score submissions
    - Simulate 10,000 concurrent score submissions
    - Measure submission processing time (target: < 500ms p95)
    - Verify system stability under load
    - _Requirements: 7.1_
  
  - [ ] 19.2 Run load tests for leaderboard queries
    - Simulate 50,000 queries per minute
    - Measure query response time (target: < 200ms p95)
    - Verify cache hit rate (target: > 95%)
    - _Requirements: 1.2, 2.1_
  
  - [ ] 19.3 Test league transition performance
    - Process 1 million player league transitions
    - Measure completion time (target: < 10 minutes)
    - Verify data consistency after transition
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 20. Integrate Unity client with server API
  - [ ] 20.1 Test end-to-end score submission from Unity
    - Submit scores from Unity client to server
    - Verify score validation and ranking updates
    - Test error handling for invalid submissions
    - _Requirements: 7.1, 7.2_
  
  - [ ] 20.2 Test leaderboard display in Unity
    - Load and display all leaderboard types in Unity UI
    - Verify player highlighting and nearby player display
    - Test pagination and scrolling performance
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 20.3 Test league system integration
    - Display player's league info in Unity
    - Show league leaderboard with promotion/demotion indicators
    - Test league transition notifications
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 20.4 Test event leaderboard in Unity
    - Display event leaderboards with countdown timers
    - Test event participation and ranking updates
    - Verify reward display and distribution
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 21. Create documentation
  - [ ] 21.1 Write Unity integration guide
    - Document how to set up LeaderboardManager in Unity
    - Provide code examples for common operations
    - Add troubleshooting section for Unity-specific issues
    - _Requirements: 1.1, 1.2_
  
  - [ ] 21.2 Write API documentation
    - Document all API endpoints with request/response examples
    - Create integration guide for game clients
    - Add code examples for common use cases (submit score, query leaderboard, view player rank)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 21.3 Create developer documentation
    - Write architecture overview and component descriptions
    - Document database schema and indexing strategy
    - Add troubleshooting guide for common issues
    - _Requirements: 1.1_
