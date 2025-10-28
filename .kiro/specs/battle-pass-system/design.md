# Battle Pass System - Design Document

## Overview

Battle Pass System là một hệ thống tiến trình theo mùa được thiết kế để tăng cường engagement và tạo doanh thu bền vững. Hệ thống sử dụng mô hình dual-track (hai luồng) với Free Track cho tất cả người chơi và Premium Track cho người chơi trả phí. Thiết kế tập trung vào việc cân bằng giữa giá trị cảm nhận cao, tính công bằng, và trải nghiệm người dùng mượt mà.

### Design Principles

1. **Transparency**: Người chơi luôn biết rõ họ sẽ nhận được gì và cần làm gì
2. **Flexibility**: Hỗ trợ nhiều loại gameplay và không ép buộc một lối chơi cụ thể
3. **Value**: Tổng giá trị phần thưởng phải cao hơn đáng kể so với giá Premium Pass
4. **Progression Clarity**: Tiến trình phải rõ ràng và dễ theo dõi
5. **Minimal Grind**: Tránh tạo cảm giác "công việc" cho người chơi casual

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Battle Pass  │  │   Mission    │  │  Reward      │      │
│  │     UI       │  │     UI       │  │  Claim UI    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼──────────────┐
│         │    Service Layer │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │
│  │ Battle Pass  │  │   Mission    │  │   Reward     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐     │
│  │           Progression Manager                      │     │
│  └──────┬─────────────────────────────────────────────┘     │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
┌─────────┼────────────────────────────────────────────────────┐
│         │         Data Layer                                 │
│  ┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Season     │  │    Player    │  │   Mission    │      │
│  │ Repository   │  │  Repository  │  │  Repository  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

- **UI Layer**: Hiển thị thông tin và xử lý tương tác người dùng
- **Service Layer**: Business logic và orchestration
- **Progression Manager**: Quản lý tính toán XP, tier advancement, và reward unlocking
- **Data Layer**: Persistence và data access

## Components and Interfaces

### 1. Season Configuration

Quản lý cấu hình của một mùa giải Battle Pass.

```typescript
interface SeasonConfig {
  seasonId: string;
  seasonNumber: number;
  startDate: Date;
  endDate: Date;
  totalTiers: number;
  premiumPassPrice: number;
  tierSkipPrice: number;
  bundlePrice: number;
  bundleTierSkips: number;
  tiers: TierConfig[];
  missions: MissionConfig[];
}

interface TierConfig {
  tierNumber: number;
  xpRequired: number;
  freeReward: RewardItem | null;
  premiumReward: RewardItem | null;
}

interface RewardItem {
  itemId: string;
  itemType: 'currency' | 'cosmetic' | 'booster' | 'resource';
  quantity: number;
  displayName: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MissionConfig {
  missionId: string;
  missionType: 'daily' | 'weekly' | 'seasonal';
  title: string;
  description: string;
  xpReward: number;
  objectives: MissionObjective[];
  availableFrom: Date;
  expiresAt: Date;
}

interface MissionObjective {
  objectiveId: string;
  description: string;
  targetValue: number;
  trackingKey: string; // e.g., "matches_played", "kills_with_weapon_x"
}
```

### 2. Player Progress

Theo dõi tiến trình của người chơi trong mùa giải hiện tại.

```typescript
interface PlayerSeasonProgress {
  playerId: string;
  seasonId: string;
  currentTier: number;
  currentXP: number;
  ownsPremiumPass: boolean;
  claimedRewards: ClaimedReward[];
  missionProgress: MissionProgress[];
  purchasedTierSkips: number;
  lastUpdated: Date;
}

interface ClaimedReward {
  tierNumber: number;
  trackType: 'free' | 'premium';
  claimedAt: Date;
}

interface MissionProgress {
  missionId: string;
  objectives: ObjectiveProgress[];
  completed: boolean;
  completedAt: Date | null;
  claimed: boolean;
}

interface ObjectiveProgress {
  objectiveId: string;
  currentValue: number;
  completed: boolean;
}
```

### 3. Battle Pass Service

Service chính quản lý logic Battle Pass.

```typescript
interface IBattlePassService {
  // Season Management
  getCurrentSeason(): Promise<SeasonConfig>;
  getSeasonById(seasonId: string): Promise<SeasonConfig>;
  
  // Player Progress
  getPlayerProgress(playerId: string): Promise<PlayerSeasonProgress>;
  
  // XP and Progression
  awardXP(playerId: string, amount: number, source: string): Promise<XPAwardResult>;
  
  // Purchases
  purchasePremiumPass(playerId: string): Promise<PurchaseResult>;
  purchaseTierSkips(playerId: string, tierCount: number): Promise<PurchaseResult>;
  purchaseSeasonBundle(playerId: string): Promise<PurchaseResult>;
  
  // Rewards
  claimReward(playerId: string, tierNumber: number, trackType: 'free' | 'premium'): Promise<ClaimResult>;
  claimAllAvailableRewards(playerId: string): Promise<ClaimResult[]>;
  
  // Notifications
  getUnclaimedRewardCount(playerId: string): Promise<number>;
  shouldShowSeasonEndWarning(playerId: string): Promise<boolean>;
}

interface XPAwardResult {
  success: boolean;
  xpAwarded: number;
  newTotalXP: number;
  previousTier: number;
  newTier: number;
  tiersGained: number;
}

interface PurchaseResult {
  success: boolean;
  errorMessage?: string;
  newPremiumStatus?: boolean;
  newTier?: number;
}

interface ClaimResult {
  success: boolean;
  errorMessage?: string;
  rewardItem?: RewardItem;
}
```

### 4. Mission Service

Quản lý nhiệm vụ và tracking tiến trình.

```typescript
interface IMissionService {
  // Mission Retrieval
  getActiveMissions(playerId: string): Promise<MissionWithProgress[]>;
  getDailyMissions(playerId: string): Promise<MissionWithProgress[]>;
  getWeeklyMissions(playerId: string): Promise<MissionWithProgress[]>;
  
  // Progress Tracking
  trackEvent(playerId: string, eventKey: string, value: number): Promise<void>;
  updateMissionProgress(playerId: string, missionId: string): Promise<MissionProgress>;
  
  // Mission Completion
  checkMissionCompletion(playerId: string, missionId: string): Promise<boolean>;
  completeMission(playerId: string, missionId: string): Promise<MissionCompletionResult>;
  
  // Mission Reset
  resetDailyMissions(): Promise<void>;
  resetWeeklyMissions(): Promise<void>;
}

interface MissionWithProgress {
  config: MissionConfig;
  progress: MissionProgress;
}

interface MissionCompletionResult {
  success: boolean;
  xpAwarded: number;
  missionTitle: string;
}
```

### 5. Progression Manager

Core logic để tính toán tier advancement và XP requirements.

```typescript
interface IProgressionManager {
  // XP Calculations
  calculateTierForXP(xp: number, seasonConfig: SeasonConfig): number;
  calculateXPRequiredForTier(tier: number, seasonConfig: SeasonConfig): number;
  calculateXPToNextTier(currentXP: number, seasonConfig: SeasonConfig): number;
  
  // Tier Advancement
  advanceTier(progress: PlayerSeasonProgress, tiersToAdvance: number): PlayerSeasonProgress;
  
  // Reward Availability
  getAvailableRewards(progress: PlayerSeasonProgress, seasonConfig: SeasonConfig): AvailableReward[];
  canClaimReward(progress: PlayerSeasonProgress, tierNumber: number, trackType: 'free' | 'premium'): boolean;
  
  // Validation
  validateTierSkipPurchase(progress: PlayerSeasonProgress, tierCount: number, seasonConfig: SeasonConfig): ValidationResult;
}

interface AvailableReward {
  tierNumber: number;
  trackType: 'free' | 'premium';
  reward: RewardItem;
  canClaim: boolean;
  reason?: string;
}

interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
}
```

## Data Models

## Database Architecture

### Technology Stack

**Primary Database**: PostgreSQL 14+
- ACID transactions critical for XP awards and reward claims
- Excellent support for hierarchical data (Season → Tiers → Rewards)
- JSONB for flexible reward configurations
- Efficient indexing for player progress queries

**Cache Layer**: Redis 7+
- Season config caching (TTL: 1 hour)
- Player progress caching (TTL: 5 minutes, write-through)
- Mission list caching (TTL: 15 minutes)
- XP transaction buffering for batch processing

**Connection Pooling**: PgBouncer
- Handle high concurrent XP updates efficiently

### Database Schema

```sql
-- Battle Pass schema
CREATE SCHEMA IF NOT EXISTS battle_pass;

#### seasons Table
CREATE TABLE battle_pass.seasons (
  season_id VARCHAR(50) PRIMARY KEY,
  season_number INT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_tiers INT NOT NULL,
  premium_pass_price INT NOT NULL,
  tier_skip_price INT NOT NULL,
  bundle_price INT NOT NULL,
  bundle_tier_skips INT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_season (is_active, start_date, end_date),
  INDEX idx_season_dates (start_date, end_date)
);
```

#### season_tiers Table
CREATE TABLE battle_pass.season_tiers (
  tier_id VARCHAR(50) PRIMARY KEY,
  season_id VARCHAR(50) NOT NULL,
  tier_number INT NOT NULL,
  xp_required INT NOT NULL,
  free_reward_item_id VARCHAR(50),
  premium_reward_item_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (season_id) REFERENCES battle_pass.seasons(season_id) ON DELETE CASCADE,
  UNIQUE (season_id, tier_number),
  INDEX idx_season_tiers (season_id, tier_number)
);
```

#### player_season_progress Table
CREATE TABLE battle_pass.player_season_progress (
  progress_id VARCHAR(50) PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season_id VARCHAR(50) NOT NULL,
  current_tier INT DEFAULT 0,
  current_xp INT DEFAULT 0,
  owns_premium_pass BOOLEAN DEFAULT false,
  purchased_tier_skips INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (season_id) REFERENCES battle_pass.seasons(season_id) ON DELETE CASCADE,
  UNIQUE (player_id, season_id),
  INDEX idx_player_progress (player_id, season_id),
  INDEX idx_season_progress (season_id, current_tier DESC)
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION battle_pass.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_progress_updated_at BEFORE UPDATE
ON battle_pass.player_season_progress FOR EACH ROW
EXECUTE FUNCTION battle_pass.update_updated_at_column();
```

#### claimed_rewards Table
CREATE TABLE battle_pass.claimed_rewards (
  claim_id VARCHAR(50) PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season_id VARCHAR(50) NOT NULL,
  tier_number INT NOT NULL,
  track_type VARCHAR(10) NOT NULL CHECK (track_type IN ('free', 'premium')),
  reward_item_id VARCHAR(50) NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (season_id) REFERENCES battle_pass.seasons(season_id) ON DELETE CASCADE,
  INDEX idx_player_claims (player_id, season_id),
  UNIQUE (player_id, season_id, tier_number, track_type)
);
```

#### missions Table
CREATE TABLE battle_pass.missions (
  mission_id VARCHAR(50) PRIMARY KEY,
  season_id VARCHAR(50) NOT NULL,
  mission_type VARCHAR(20) NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'seasonal')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  xp_reward INT NOT NULL,
  available_from TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (season_id) REFERENCES battle_pass.seasons(season_id) ON DELETE CASCADE,
  INDEX idx_active_missions (season_id, mission_type, is_active, available_from, expires_at),
  INDEX idx_mission_type_time (mission_type, available_from, expires_at) WHERE is_active = true
);
```

#### mission_objectives Table
CREATE TABLE battle_pass.mission_objectives (
  objective_id VARCHAR(50) PRIMARY KEY,
  mission_id VARCHAR(50) NOT NULL,
  description VARCHAR(200) NOT NULL,
  target_value INT NOT NULL,
  tracking_key VARCHAR(100) NOT NULL,
  objective_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES battle_pass.missions(mission_id) ON DELETE CASCADE,
  INDEX idx_mission_objectives (mission_id, objective_order)
);
```

#### player_mission_progress Table
CREATE TABLE battle_pass.player_mission_progress (
  progress_id VARCHAR(50) PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  mission_id VARCHAR(50) NOT NULL,
  objective_id VARCHAR(50) NOT NULL,
  current_value INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES battle_pass.missions(mission_id) ON DELETE CASCADE,
  FOREIGN KEY (objective_id) REFERENCES battle_pass.mission_objectives(objective_id) ON DELETE CASCADE,
  UNIQUE (player_id, objective_id),
  INDEX idx_player_mission (player_id, mission_id),
  INDEX idx_mission_progress (mission_id, completed)
);

CREATE TRIGGER update_mission_progress_updated_at BEFORE UPDATE
ON battle_pass.player_mission_progress FOR EACH ROW
EXECUTE FUNCTION battle_pass.update_updated_at_column();
```

#### xp_transactions Table
CREATE TABLE battle_pass.xp_transactions (
  transaction_id VARCHAR(50) PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season_id VARCHAR(50) NOT NULL,
  xp_amount INT NOT NULL,
  source VARCHAR(100) NOT NULL, -- 'match', 'mission', 'bonus', etc.
  source_id VARCHAR(50), -- mission_id or match_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (season_id) REFERENCES battle_pass.seasons(season_id) ON DELETE CASCADE,
  INDEX idx_player_xp (player_id, season_id, created_at DESC),
  INDEX idx_season_xp (season_id, created_at DESC)
);

-- Partitioning strategy for xp_transactions (by season_id)
-- For high-volume seasons, consider partitioning by season_id
```

### Redis Cache Structure

```
# Season config cache
bp:season:{season_id} -> JSON (TTL: 1 hour)

# Active season cache
bp:season:active -> season_id (TTL: 1 hour)

# Player progress cache
bp:progress:{player_id}:{season_id} -> JSON (TTL: 5 minutes, write-through)

# Mission list cache
bp:missions:{season_id}:{type} -> JSON Array (TTL: 15 minutes)

# XP transaction buffer (for batch processing)
bp:xp:buffer:{player_id} -> List (Process every 30 seconds)
```

### Performance Optimizations

**Batch XP Updates**:
```sql
-- Batch update player progress
WITH xp_updates AS (
  SELECT player_id, season_id, SUM(xp_amount) as total_xp
  FROM battle_pass.xp_transactions
  WHERE created_at > NOW() - INTERVAL '30 seconds'
  GROUP BY player_id, season_id
)
UPDATE battle_pass.player_season_progress p
SET current_xp = current_xp + u.total_xp,
    current_tier = calculate_tier(current_xp + u.total_xp),
    updated_at = CURRENT_TIMESTAMP
FROM xp_updates u
WHERE p.player_id = u.player_id AND p.season_id = u.season_id;
```

**Materialized View for Leaderboards**:
```sql
CREATE MATERIALIZED VIEW battle_pass.season_leaderboard AS
SELECT 
  p.player_id,
  p.season_id,
  p.current_tier,
  p.current_xp,
  RANK() OVER (PARTITION BY p.season_id ORDER BY p.current_tier DESC, p.current_xp DESC) as rank
FROM battle_pass.player_season_progress p
WHERE p.current_xp > 0;

CREATE UNIQUE INDEX ON battle_pass.season_leaderboard (season_id, player_id);
CREATE INDEX ON battle_pass.season_leaderboard (season_id, rank);

-- Refresh every 5 minutes
REFRESH MATERIALIZED VIEW CONCURRENTLY battle_pass.season_leaderboard;
```

## Error Handling

### Error Categories

1. **Validation Errors**: Input không hợp lệ hoặc vi phạm business rules
2. **Authorization Errors**: Người chơi không có quyền thực hiện hành động
3. **Resource Not Found**: Season, mission, hoặc reward không tồn tại
4. **Insufficient Resources**: Không đủ tiền tệ để mua
5. **System Errors**: Database errors, network issues

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  errorCode: string;
  errorMessage: string;
  errorDetails?: any;
  timestamp: Date;
}

// Error Codes
enum BattlePassErrorCode {
  // Validation
  INVALID_TIER_NUMBER = 'BP_INVALID_TIER',
  INVALID_XP_AMOUNT = 'BP_INVALID_XP',
  SEASON_NOT_ACTIVE = 'BP_SEASON_INACTIVE',
  
  // Authorization
  PREMIUM_REQUIRED = 'BP_PREMIUM_REQUIRED',
  REWARD_ALREADY_CLAIMED = 'BP_REWARD_CLAIMED',
  TIER_NOT_REACHED = 'BP_TIER_NOT_REACHED',
  
  // Resources
  INSUFFICIENT_CURRENCY = 'BP_INSUFFICIENT_CURRENCY',
  SEASON_NOT_FOUND = 'BP_SEASON_NOT_FOUND',
  MISSION_NOT_FOUND = 'BP_MISSION_NOT_FOUND',
  
  // System
  DATABASE_ERROR = 'BP_DB_ERROR',
  UNKNOWN_ERROR = 'BP_UNKNOWN_ERROR'
}
```

### Error Handling Strategy

1. **Client-Side Validation**: Validate input trước khi gửi request
2. **Service-Level Validation**: Validate business rules tại service layer
3. **Graceful Degradation**: Hiển thị cached data nếu server không available
4. **User-Friendly Messages**: Convert technical errors thành messages dễ hiểu
5. **Retry Logic**: Tự động retry cho transient errors (network issues)
6. **Logging**: Log tất cả errors với context đầy đủ để debugging

## Testing Strategy

### Unit Testing

**Target Coverage**: 80% code coverage

**Focus Areas**:
- Progression Manager calculations (XP to tier, tier advancement)
- Mission completion logic
- Reward eligibility checks
- Validation functions

**Test Cases**:
```typescript
describe('ProgressionManager', () => {
  describe('calculateTierForXP', () => {
    it('should return tier 0 for 0 XP');
    it('should return correct tier for XP at tier boundary');
    it('should return correct tier for XP between tiers');
    it('should return max tier when XP exceeds all requirements');
  });
  
  describe('canClaimReward', () => {
    it('should allow claiming free track reward when tier reached');
    it('should prevent claiming premium reward without premium pass');
    it('should prevent claiming already claimed reward');
    it('should prevent claiming reward for unreached tier');
  });
});
```

### Integration Testing

**Focus Areas**:
- Service interactions (BattlePassService ↔ MissionService)
- Database operations (CRUD operations)
- XP award flow (event → mission progress → XP award → tier advancement)
- Purchase flow (validation → payment → unlock)

**Test Scenarios**:
```typescript
describe('Battle Pass Integration', () => {
  it('should award XP and advance tier when mission completed');
  it('should unlock premium rewards when premium pass purchased');
  it('should advance multiple tiers when tier skips purchased');
  it('should persist progress across sessions');
});
```

### End-to-End Testing

**User Flows**:
1. **New Season Flow**: Player views new season → sees rewards → decides to purchase
2. **Progression Flow**: Player completes match → earns XP → levels up → claims reward
3. **Mission Flow**: Player views missions → completes objectives → earns XP
4. **Purchase Flow**: Player purchases premium pass → unlocks rewards → claims them

### Performance Testing

**Metrics to Monitor**:
- API response time (target: < 200ms for 95th percentile)
- Database query performance (target: < 50ms for simple queries)
- Concurrent user load (target: support 10,000 concurrent users)
- XP calculation time (target: < 10ms)

**Load Testing Scenarios**:
- Season start surge (many players viewing new season simultaneously)
- Daily mission reset (all players' missions reset at same time)
- Season end rush (many players claiming rewards before expiration)

## UI/UX Design Considerations

### Battle Pass Main Screen

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  SEASON 1: COSMIC ODYSSEY        [Premium Pass] [$9.99]    │
│  Ends in: 23 days 14 hours                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Progress: Tier 15 / 100                               │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  1,250 / 1,500 XP to next tier                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Premium │ [Reward] [Reward] [Reward] [Reward] [Reward]    │
│  Track   │    ✓        ✓        ✓       🔒       🔒        │
│          │   Tier 1   Tier 2   Tier 3  Tier 4  Tier 5     │
├──────────┼─────────────────────────────────────────────────┤
│  Free    │ [Reward] [Reward] [Reward] [Reward] [Reward]    │
│  Track   │    ✓        ✓        ✓       🔒       🔒        │
│          │   Tier 1   Tier 2   Tier 3  Tier 4  Tier 5     │
└─────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Dual-track visualization with clear separation
- Progress bar showing current XP and next tier requirement
- Visual indicators for claimed (✓) and locked (🔒) rewards
- Prominent Premium Pass purchase button
- Season timer with countdown

### Mission Screen

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  MISSIONS                                    [Refresh: 12h] │
├─────────────────────────────────────────────────────────────┤
│  DAILY MISSIONS                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Play 3 Matches                          [2/3] +100 XP │  │
│  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Deal 5000 Damage                     [3420/5000] +150│  │
│  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  WEEKLY MISSIONS                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Win 10 Matches                         [7/10] +500 XP │  │
│  │ ████████████████████████████████████░░░░░░░░░░░░░░░░ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Separate sections for daily and weekly missions
- Progress bars for each mission objective
- XP reward clearly displayed
- Countdown timer for mission refresh
- Visual completion indicators

### Reward Claim Animation

**Sequence**:
1. User clicks "Claim" button
2. Reward icon scales up with glow effect
3. Particle effects burst from reward
4. Reward flies to inventory icon
5. Success toast notification appears
6. Tier updates with checkmark

**Timing**: Total animation ~2 seconds for satisfying feedback

### Premium Pass Purchase Flow

**Steps**:
1. User clicks "Buy Premium Pass" button
2. Modal appears showing:
   - All premium rewards preview (scrollable)
   - Price and payment options
   - "Instant unlock" message for current tier rewards
   - Confirm/Cancel buttons
3. After purchase confirmation:
   - Success animation
   - All unlocked rewards highlighted
   - "Claim All" button appears

## Performance Optimizations

### Caching Strategy

1. **Season Config**: Cache for 1 hour (rarely changes)
2. **Player Progress**: Cache for 5 minutes, invalidate on updates
3. **Mission List**: Cache for 15 minutes
4. **Reward Items**: Cache indefinitely (static data)

### Database Optimizations

1. **Indexes**: Create indexes on frequently queried columns (player_id, season_id, mission_id)
2. **Batch Operations**: Batch insert/update for mission progress tracking
3. **Read Replicas**: Use read replicas for heavy read operations (viewing rewards)
4. **Connection Pooling**: Maintain connection pool to reduce connection overhead

### API Optimizations

1. **Pagination**: Paginate tier list for seasons with many tiers
2. **Lazy Loading**: Load reward details only when user scrolls to them
3. **Compression**: Enable gzip compression for API responses
4. **CDN**: Serve reward images and icons from CDN

## Security Considerations

### Anti-Cheat Measures

1. **Server-Side Validation**: All XP awards and tier advancements validated server-side
2. **Rate Limiting**: Limit API calls per player to prevent abuse
3. **Transaction Logging**: Log all XP transactions for audit trail
4. **Anomaly Detection**: Flag suspicious patterns (e.g., impossible XP gains)

### Payment Security

1. **Secure Payment Gateway**: Use trusted payment providers
2. **Transaction Verification**: Verify all purchases with payment provider
3. **Idempotency**: Prevent duplicate purchases with idempotency keys
4. **Audit Trail**: Log all purchase transactions

### Data Privacy

1. **Data Encryption**: Encrypt sensitive player data at rest and in transit
2. **Access Control**: Implement role-based access control for admin functions
3. **GDPR Compliance**: Allow players to export/delete their Battle Pass data
4. **Minimal Data Collection**: Only collect data necessary for functionality

## Scalability Considerations

### Horizontal Scaling

- **Stateless Services**: Design services to be stateless for easy horizontal scaling
- **Load Balancing**: Distribute traffic across multiple service instances
- **Database Sharding**: Shard player data by player_id for large player bases

### Vertical Scaling

- **Resource Allocation**: Allocate more resources during peak times (season start, daily reset)
- **Auto-Scaling**: Configure auto-scaling based on CPU/memory usage

### Future Expansion

- **Multi-Season Support**: Design to support multiple concurrent seasons (e.g., Battle Pass + Event Pass)
- **Cross-Platform**: Ensure progress syncs across platforms (PC, mobile, console)
- **Localization**: Support multiple languages for mission descriptions and UI text
