# Design Document - Hệ thống Clan (Guild)

## Overview

Hệ thống Clan được thiết kế theo kiến trúc module hóa và mở rộng theo giai đoạn, phù hợp với người chơi casual. Hệ thống bắt đầu với các tính năng cơ bản (tạo/tham gia Clan, chat, tặng vật phẩm) và dần dần mở khóa các tính năng phức tạp hơn (sự kiện hợp tác, phát triển công trình chung, chiến tranh Clan) khi người chơi đã quen thuộc với cơ chế cơ bản.

### Core Design Principles

1. **Progressive Disclosure**: Giới thiệu tính năng từng bước để tránh choáng ngợp
2. **Social Connection**: Ưu tiên xây dựng mối quan hệ trước khi yêu cầu cam kết
3. **Flexible Commitment**: Hỗ trợ cả người chơi casual và competitive
4. **Positive Reinforcement**: Thưởng cho sự tham gia, không phạt cho việc không tham gia
5. **Mobile-First**: Tối ưu cho thao tác một tay trên thiết bị di động

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Clan UI      │  │ Donation UI  │  │ Event UI     │      │
│  │ Manager      │  │ Manager      │  │ Manager      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │ Clan Manager    │                        │
│                   │ (Core Client)   │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    REST API / WebSocket
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                       Server Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Clan         │  │ Donation     │  │ Event        │       │
│  │ Service      │──│ Service      │──│ Service      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│  ┌──────────────┐  ┌───────▼──────┐  ┌──────────────┐      │
│  │ War          │  │ Fort         │  │ Notification │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │ Database Layer  │                        │
│                   │ (MongoDB/SQL)   │                        │
│                   └─────────────────┘                        │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Client Side (Unity)**:
- Unity UI System với tab navigation
- REST API client cho CRUD operations
- WebSocket client cho real-time updates (chat, notifications)
- Local caching cho Clan data
- Unity Addressables cho badge/emblem assets

**Server Side**:
- REST API (ASP.NET Core hoặc Node.js/Express)
- WebSocket Server cho real-time features
- Redis cho caching và session management
- MongoDB hoặc PostgreSQL cho persistent storage
- Background job scheduler cho event management và cleanup

## Components and Interfaces

### 1. Client Components

#### ClanManager (Core Client Component)

```csharp
public class ClanManager : MonoBehaviour
{
    // Singleton instance
    public static ClanManager Instance { get; private set; }
    
    // Events
    public event Action<Clan> OnClanJoined;
    public event Action OnClanLeft;
    public event Action<ClanMember> OnMemberJoined;
    public event Action<ClanMember> OnMemberLeft;
    public event Action<DonationRequest> OnDonationRequestCreated;
    public event Action<ClanEvent> OnEventStarted;
    public event Action<ClanEvent> OnEventMilestoneReached;
    public event Action<ClanWar> OnWarStarted;
    public event Action<ClanNotification> OnNotificationReceived;
    
    // Public Methods
    public void Initialize(string playerId);
    public Task<Clan> CreateClan(string name, string description, ClanJoinMode joinMode);
    public Task<List<Clan>> SearchClans(ClanSearchFilter filter);
    public Task<bool> RequestJoinClan(string clanId);
    public Task<bool> LeaveClan();
    public Task<Clan> GetCurrentClan();
    public Task<List<ClanMember>> GetClanMembers();
    public Task<bool> PromoteMember(string memberId, ClanRole newRole);
    public Task<bool> KickMember(string memberId);
    public Task<bool> TransferLeadership(string newLeaderId);
}
```

#### DonationManager

```csharp
public class DonationManager : MonoBehaviour
{
    // Events
    public event Action<DonationRequest> OnRequestCreated;
    public event Action<DonationRequest> OnRequestFulfilled;
    public event Action<DonationRequest> OnRequestExpired;
    public event Action<int> OnDonationLimitUpdated;
    
    // Public Methods
    public Task<DonationRequest> CreateRequest(ItemType itemType, int quantity);
    public Task<bool> DonateToRequest(string requestId, int quantity);
    public Task<List<DonationRequest>> GetActiveRequests();
    public Task<int> GetRemainingDonations();
    public Task<DonationStats> GetMemberDonationStats(string memberId);
}
```

#### ClanEventManager

```csharp
public class ClanEventManager : MonoBehaviour
{
    // Events
    public event Action<ClanEvent> OnEventStarted;
    public event Action<ClanEvent> OnEventEnded;
    public event Action<EventMilestone> OnMilestoneReached;
    public event Action<int> OnPointsContributed;
    
    // Public Methods
    public Task<ClanEvent> GetActiveEvent();
    public Task<bool> ContributePoints(int points);
    public Task<List<EventContributor>> GetLeaderboard();
    public Task<EventProgress> GetEventProgress();
    public Task<List<EventReward>> GetAvailableRewards();
}
```

#### ClanFortManager

```csharp
public class ClanFortManager : MonoBehaviour
{
    // Events
    public event Action<int> OnFortUpgraded;
    public event Action<ResourceContribution> OnResourceContributed;
    public event Action<FortBonus> OnBonusUnlocked;
    
    // Public Methods
    public Task<ClanFort> GetFortStatus();
    public Task<bool> ContributeResources(ResourceType type, int amount);
    public Task<List<FortBonus>> GetActiveBonuses();
    public Task<UpgradeProgress> GetUpgradeProgress();
    public Task<List<ContributionRecord>> GetContributionHistory();
}
```

#### ClanWarManager

```csharp
public class ClanWarManager : MonoBehaviour
{
    // Events
    public event Action<ClanWar> OnWarStarted;
    public event Action<ClanWar> OnWarEnded;
    public event Action<WarChallenge> OnChallengeCompleted;
    public event Action<WarScore> OnScoreUpdated;
    
    // Public Methods
    public Task<List<Clan>> SearchOpponents(int memberCountRange);
    public Task<bool> InitiateWar(string opponentClanId);
    public Task<bool> AcceptWarChallenge(string warId);
    public Task<ClanWar> GetActiveWar();
    public Task<bool> CompleteWarChallenge(string challengeId);
    public Task<WarScore> GetWarScore();
    public Task<List<WarParticipant>> GetWarParticipants();
}
```

#### ClanUIManager

```csharp
public class ClanUIManager : MonoBehaviour
{
    // UI References
    [SerializeField] private ClanWindow clanWindow;
    [SerializeField] private ClanSearchPanel searchPanel;
    [SerializeField] private MemberListPanel memberListPanel;
    [SerializeField] private DonationPanel donationPanel;
    [SerializeField] private EventPanel eventPanel;
    [SerializeField] private FortPanel fortPanel;
    [SerializeField] private WarPanel warPanel;
    [SerializeField] private NotificationBadge notificationBadge;
    
    // Public Methods
    public void ShowClanWindow(ClanTab defaultTab = ClanTab.Chat);
    public void HideClanWindow();
    public void ShowClanSearch();
    public void ShowCreateClanDialog();
    public void ShowMemberProfile(string memberId);
    public void ShowDonationRequest();
    public void UpdateNotificationBadge(int unreadCount);
    public void ShowTutorial(TutorialStep step);
}
```

### 2. Server Components

#### ClanService

```csharp
public interface IClanService
{
    Task<Clan> CreateClan(string creatorId, ClanCreateRequest request);
    Task<List<Clan>> SearchClans(ClanSearchFilter filter);
    Task<Clan> GetClan(string clanId);
    Task<bool> UpdateClan(string clanId, ClanUpdateRequest request);
    Task<bool> DeleteClan(string clanId);
    Task<bool> AddMember(string clanId, string playerId);
    Task<bool> RemoveMember(string clanId, string playerId);
    Task<bool> UpdateMemberRole(string clanId, string memberId, ClanRole newRole);
    Task<List<ClanMember>> GetMembers(string clanId);
    Task<ClanStats> GetClanStats(string clanId);
    Task<List<ClanActivity>> GetActivityLog(string clanId, int limit);
}
```

#### DonationService

```csharp
public interface IDonationService
{
    Task<DonationRequest> CreateRequest(string clanId, string requesterId, ItemType itemType, int quantity);
    Task<bool> FulfillRequest(string requestId, string donorId, int quantity);
    Task<List<DonationRequest>> GetActiveRequests(string clanId);
    Task<bool> ExpireRequest(string requestId);
    Task<int> GetRemainingDonations(string playerId);
    Task<DonationStats> GetMemberStats(string playerId);
    Task RewardDonor(string donorId, int goldCoins, int experience);
}
```

#### EventService

```csharp
public interface IEventService
{
    Task<ClanEvent> CreateEvent(string clanId, EventType type, DateTime startTime, DateTime endTime);
    Task<ClanEvent> GetActiveEvent(string clanId);
    Task<bool> ContributePoints(string eventId, string playerId, int points);
    Task<EventProgress> GetProgress(string eventId);
    Task<List<EventContributor>> GetLeaderboard(string eventId, int limit);
    Task<bool> DistributeRewards(string eventId, EventMilestone milestone);
    Task<bool> EndEvent(string eventId);
}
```

#### FortService

```csharp
public interface IFortService
{
    Task<ClanFort> GetFort(string clanId);
    Task<bool> ContributeResources(string clanId, string playerId, ResourceType type, int amount);
    Task<bool> UpgradeFort(string clanId);
    Task<List<FortBonus>> GetActiveBonuses(string clanId);
    Task<UpgradeProgress> GetUpgradeProgress(string clanId);
    Task<List<ContributionRecord>> GetContributions(string clanId);
}
```

#### WarService

```csharp
public interface IWarService
{
    Task<List<Clan>> FindOpponents(string clanId, int memberCountRange);
    Task<ClanWar> InitiateWar(string initiatorClanId, string opponentClanId);
    Task<bool> AcceptWar(string warId, string acceptingClanId);
    Task<ClanWar> GetActiveWar(string clanId);
    Task<bool> CompleteChallenge(string warId, string playerId, string challengeId);
    Task<WarScore> GetScore(string warId);
    Task<bool> EndWar(string warId);
    Task<bool> DistributeWarRewards(string warId);
}
```

#### NotificationService

```csharp
public interface INotificationService
{
    Task SendNotification(string playerId, ClanNotification notification);
    Task SendBulkNotification(List<string> playerIds, ClanNotification notification);
    Task<List<ClanNotification>> GetNotifications(string playerId, int limit);
    Task<bool> MarkAsRead(string notificationId);
    Task<int> GetUnreadCount(string playerId);
    Task<bool> UpdatePreferences(string playerId, NotificationPreferences preferences);
}
```

## Database Architecture

### Technology Stack

**Primary Database**: PostgreSQL 14+
- ACID transactions critical for donations, wars, and fort upgrades
- Strong referential integrity for clan-member relationships
- JSONB support for flexible clan metadata
- Excellent support for complex queries (clan rankings, member statistics)

**Cache Layer**: Redis 7+
- Clan member online status (TTL: 1 minute)
- Clan leaderboards (TTL: 5 minutes)
- Active donation requests (TTL: 30 seconds)
- Real-time chat via pub/sub

**WebSocket Server**: For real-time chat and notifications

**Connection Pooling**: PgBouncer

### Database Schema

```sql
-- Clan schema
CREATE SCHEMA IF NOT EXISTS clan;

-- Clans table
CREATE TABLE clan.clans (
    clan_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    tag VARCHAR(5) NOT NULL UNIQUE,
    description TEXT,
    badge_id VARCHAR(50),
    join_mode VARCHAR(20) NOT NULL DEFAULT 'open',
    minimum_level INT DEFAULT 1,
    custom_tags TEXT[],
    activity_level VARCHAR(20) DEFAULT 'casual',
    member_count INT DEFAULT 0,
    max_members INT DEFAULT 50,
    leader_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_donations INT DEFAULT 0,
    total_war_wins INT DEFAULT 0,
    total_war_losses INT DEFAULT 0,
    events_completed INT DEFAULT 0,
    fort_level INT DEFAULT 0,
    INDEX idx_join_mode (join_mode, minimum_level),
    INDEX idx_activity (activity_level),
    INDEX idx_last_active (last_active_at DESC),
    CHECK (join_mode IN ('open', 'closed')),
    CHECK (activity_level IN ('casual', 'competitive'))
);

-- Clan members table
CREATE TABLE clan.members (
    member_id VARCHAR(36) PRIMARY KEY,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    level INT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_donations_given INT DEFAULT 0,
    total_donations_received INT DEFAULT 0,
    event_contributions INT DEFAULT 0,
    war_participations INT DEFAULT 0,
    fort_contributions INT DEFAULT 0,
    reputation_score INT DEFAULT 0,
    UNIQUE (player_id),
    INDEX idx_clan_members (clan_id, role),
    INDEX idx_player_clan (player_id),
    INDEX idx_reputation (clan_id, reputation_score DESC),
    CHECK (role IN ('member', 'elder', 'co_leader', 'leader'))
);

-- Donation requests table
CREATE TABLE clan.donation_requests (
    request_id VARCHAR(36) PRIMARY KEY,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id) ON DELETE CASCADE,
    requester_id VARCHAR(36) NOT NULL,
    requester_name VARCHAR(50) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    requested_quantity INT NOT NULL,
    fulfilled_quantity INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_clan_active_requests (clan_id, status, created_at) WHERE status = 'active',
    INDEX idx_expiring_requests (expires_at) WHERE status = 'active',
    CHECK (status IN ('active', 'fulfilled', 'expired')),
    CHECK (item_type IN ('lives', 'coins', 'boosters', 'resources'))
);

-- Donations table
CREATE TABLE clan.donations (
    donation_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL REFERENCES clan.donation_requests(request_id) ON DELETE CASCADE,
    donor_id VARCHAR(36) NOT NULL,
    donor_name VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_request_donations (request_id, donated_at),
    INDEX idx_donor_donations (donor_id, donated_at DESC)
);

-- Clan events table
CREATE TABLE clan.events (
    event_id VARCHAR(36) PRIMARY KEY,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming',
    total_points INT DEFAULT 0,
    milestones JSONB NOT NULL,
    INDEX idx_clan_events (clan_id, status, start_time),
    INDEX idx_active_events (status, start_time, end_time) WHERE status = 'active',
    CHECK (event_type IN ('coop_challenge', 'collection_event', 'team_chest')),
    CHECK (status IN ('upcoming', 'active', 'completed'))
);

-- Event contributions table
CREATE TABLE clan.event_contributions (
    contribution_id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL REFERENCES clan.events(event_id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    points_contributed INT NOT NULL,
    contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_contributions (event_id, points_contributed DESC),
    INDEX idx_player_contributions (player_id, event_id)
);

-- Clan fort table
CREATE TABLE clan.forts (
    fort_id VARCHAR(36) PRIMARY KEY,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id) ON DELETE CASCADE,
    current_level INT DEFAULT 0,
    max_level INT DEFAULT 10,
    upgrade_progress JSONB NOT NULL,
    active_bonuses JSONB NOT NULL,
    last_upgraded_at TIMESTAMP,
    UNIQUE (clan_id)
);

-- Fort contributions table
CREATE TABLE clan.fort_contributions (
    contribution_id VARCHAR(36) PRIMARY KEY,
    fort_id VARCHAR(36) NOT NULL REFERENCES clan.forts(fort_id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    resource_type VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fort_contributions (fort_id, contributed_at DESC),
    INDEX idx_player_fort_contributions (player_id, fort_id),
    CHECK (resource_type IN ('wood', 'stone', 'gold', 'gems'))
);

-- Clan wars table
CREATE TABLE clan.wars (
    war_id VARCHAR(36) PRIMARY KEY,
    initiator_clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id),
    opponent_clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id),
    status VARCHAR(20) DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    initiator_score INT DEFAULT 0,
    opponent_score INT DEFAULT 0,
    winner_clan_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clan_wars (initiator_clan_id, status),
    INDEX idx_active_wars (status, start_time, end_time) WHERE status = 'active',
    CHECK (status IN ('pending', 'active', 'completed'))
);

-- War participants table
CREATE TABLE clan.war_participants (
    participant_id VARCHAR(36) PRIMARY KEY,
    war_id VARCHAR(36) NOT NULL REFERENCES clan.wars(war_id) ON DELETE CASCADE,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id),
    player_id VARCHAR(36) NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    points_earned INT DEFAULT 0,
    challenges_completed INT DEFAULT 0,
    INDEX idx_war_participants (war_id, clan_id, points_earned DESC),
    INDEX idx_player_wars (player_id, war_id)
);

-- Clan activity log table
CREATE TABLE clan.activity_log (
    activity_id VARCHAR(36) PRIMARY KEY,
    clan_id VARCHAR(36) NOT NULL REFERENCES clan.clans(clan_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(36),
    actor_name VARCHAR(50),
    target_id VARCHAR(36),
    target_name VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clan_activities (clan_id, created_at DESC)
);
```

### Redis Cache Structure

```
# Clan data cache
clan:data:{clan_id} -> JSON (TTL: 5 minutes)

# Clan member list cache
clan:members:{clan_id} -> JSON Array (TTL: 5 minutes)

# Member online status
clan:online:{clan_id} -> Set of player_ids (TTL: 1 minute)

# Active donation requests
clan:donations:{clan_id} -> JSON Array (TTL: 30 seconds)

# Clan leaderboard cache
clan:leaderboard:global -> Sorted Set (TTL: 5 minutes)

# Clan chat pub/sub
clan:chat:{clan_id} -> Pub/Sub channel
```

## Data Models

### Clan

```csharp
public class Clan
{
    public string ClanId { get; set; }
    public string Name { get; set; }
    public string Tag { get; set; } // 2-5 character unique tag
    public string Description { get; set; }
    public string BadgeId { get; set; }
    public ClanJoinMode JoinMode { get; set; }
    public int MinimumLevel { get; set; }
    public List<string> CustomTags { get; set; }
    public ActivityLevel ActivityLevel { get; set; } // Casual, Competitive
    public int MemberCount { get; set; }
    public int MaxMembers { get; set; }
    public string LeaderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public ClanStats Stats { get; set; }
}

public enum ClanJoinMode
{
    Open,      // Anyone can join
    Closed     // Requires approval
}

public enum ActivityLevel
{
    Casual,
    Competitive
}
```

### ClanMember

```csharp
public class ClanMember
{
    public string MemberId { get; set; }
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public string AvatarUrl { get; set; }
    public int Level { get; set; }
    public ClanRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public MemberStats Stats { get; set; }
}

public enum ClanRole
{
    Member,
    Elder,
    CoLeader,
    Leader
}

public class MemberStats
{
    public int TotalDonationsGiven { get; set; }
    public int TotalDonationsReceived { get; set; }
    public int EventContributions { get; set; }
    public int WarParticipations { get; set; }
    public int FortContributions { get; set; }
    public int ReputationScore { get; set; }
}
```

### DonationRequest

```csharp
public class DonationRequest
{
    public string RequestId { get; set; }
    public string ClanId { get; set; }
    public string RequesterId { get; set; }
    public string RequesterName { get; set; }
    public ItemType ItemType { get; set; }
    public int RequestedQuantity { get; set; }
    public int FulfilledQuantity { get; set; }
    public List<Donation> Donations { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class Donation
{
    public string DonorId { get; set; }
    public string DonorName { get; set; }
    public int Quantity { get; set; }
    public DateTime DonatedAt { get; set; }
}

public enum ItemType
{
    Lives,
    Coins,
    Boosters,
    Resources
}

public enum RequestStatus
{
    Active,
    Fulfilled,
    Expired
}
```

### ClanEvent

```csharp
public class ClanEvent
{
    public string EventId { get; set; }
    public string ClanId { get; set; }
    public EventType Type { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public EventStatus Status { get; set; }
    public int TotalPoints { get; set; }
    public List<EventMilestone> Milestones { get; set; }
    public List<EventContributor> Contributors { get; set; }
}

public enum EventType
{
    CoopChallenge,
    CollectionEvent,
    TeamChest
}

public enum EventStatus
{
    Upcoming,
    Active,
    Completed
}

public class EventMilestone
{
    public string MilestoneId { get; set; }
    public string Name { get; set; } // Bronze, Silver, Gold, Platinum
    public int RequiredPoints { get; set; }
    public bool IsReached { get; set; }
    public List<Reward> Rewards { get; set; }
}

public class EventContributor
{
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public int PointsContributed { get; set; }
    public int Rank { get; set; }
}
```

### ClanFort

```csharp
public class ClanFort
{
    public string FortId { get; set; }
    public string ClanId { get; set; }
    public int CurrentLevel { get; set; }
    public int MaxLevel { get; set; }
    public UpgradeProgress UpgradeProgress { get; set; }
    public List<FortBonus> ActiveBonuses { get; set; }
    public List<ContributionRecord> ContributionHistory { get; set; }
}

public class UpgradeProgress
{
    public int NextLevel { get; set; }
    public Dictionary<ResourceType, int> RequiredResources { get; set; }
    public Dictionary<ResourceType, int> CurrentResources { get; set; }
    public float ProgressPercentage { get; set; }
}

public enum ResourceType
{
    Wood,
    Stone,
    Gold,
    Gems
}

public class FortBonus
{
    public string BonusId { get; set; }
    public BonusType Type { get; set; }
    public float Value { get; set; }
    public int UnlockedAtLevel { get; set; }
}

public enum BonusType
{
    GoldGainBonus,
    XPBonus,
    DonationLimitIncrease,
    MemberCapacityIncrease
}

public class ContributionRecord
{
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public ResourceType ResourceType { get; set; }
    public int Amount { get; set; }
    public DateTime ContributedAt { get; set; }
}
```

### ClanWar

```csharp
public class ClanWar
{
    public string WarId { get; set; }
    public string InitiatorClanId { get; set; }
    public string OpponentClanId { get; set; }
    public WarStatus Status { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public WarScore InitiatorScore { get; set; }
    public WarScore OpponentScore { get; set; }
    public List<WarChallenge> Challenges { get; set; }
    public string WinnerClanId { get; set; }
}

public enum WarStatus
{
    Pending,      // Waiting for opponent acceptance
    Active,       // War in progress
    Completed     // War ended
}

public class WarScore
{
    public string ClanId { get; set; }
    public int TotalPoints { get; set; }
    public int ParticipantCount { get; set; }
    public List<WarParticipant> Participants { get; set; }
}

public class WarParticipant
{
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public int PointsEarned { get; set; }
    public int ChallengesCompleted { get; set; }
}

public class WarChallenge
{
    public string ChallengeId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int PointValue { get; set; }
    public ChallengeType Type { get; set; }
}

public enum ChallengeType
{
    WinMatches,
    CollectItems,
    CompleteObjectives
}
```

### ClanNotification

```csharp
public class ClanNotification
{
    public string NotificationId { get; set; }
    public string PlayerId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public Dictionary<string, object> Data { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum NotificationType
{
    DonationRequest,
    DonationFulfilled,
    EventStarted,
    EventMilestone,
    WarStarted,
    WarEnded,
    MemberJoined,
    MemberLeft,
    RolePromoted,
    FortUpgraded
}

public class NotificationPreferences
{
    public bool DonationRequestsEnabled { get; set; }
    public bool EventNotificationsEnabled { get; set; }
    public bool WarNotificationsEnabled { get; set; }
    public bool MemberActivityEnabled { get; set; }
    public bool PushNotificationsEnabled { get; set; }
}
```

### ClanStats

```csharp
public class ClanStats
{
    public int TotalMembers { get; set; }
    public float AverageLevel { get; set; }
    public int TotalDonations { get; set; }
    public int TotalWarWins { get; set; }
    public int TotalWarLosses { get; set; }
    public int EventsCompleted { get; set; }
    public int FortLevel { get; set; }
    public DateTime LastUpdated { get; set; }
}
```

## Communication Protocol

### REST API Endpoints

**Clan Management**:
- `POST /api/clans` - Create clan
- `GET /api/clans/search` - Search clans
- `GET /api/clans/{clanId}` - Get clan details
- `PUT /api/clans/{clanId}` - Update clan
- `DELETE /api/clans/{clanId}` - Delete clan
- `POST /api/clans/{clanId}/join` - Request to join
- `POST /api/clans/{clanId}/leave` - Leave clan
- `GET /api/clans/{clanId}/members` - Get members
- `PUT /api/clans/{clanId}/members/{memberId}/role` - Update role
- `DELETE /api/clans/{clanId}/members/{memberId}` - Kick member

**Donation System**:
- `POST /api/clans/{clanId}/donations/requests` - Create request
- `POST /api/donations/{requestId}/donate` - Donate to request
- `GET /api/clans/{clanId}/donations/active` - Get active requests
- `GET /api/players/{playerId}/donations/stats` - Get donation stats

**Events**:
- `GET /api/clans/{clanId}/events/active` - Get active event
- `POST /api/events/{eventId}/contribute` - Contribute points
- `GET /api/events/{eventId}/leaderboard` - Get leaderboard
- `GET /api/events/{eventId}/progress` - Get progress

**Fort**:
- `GET /api/clans/{clanId}/fort` - Get fort status
- `POST /api/clans/{clanId}/fort/contribute` - Contribute resources
- `GET /api/clans/{clanId}/fort/bonuses` - Get active bonuses

**War**:
- `GET /api/clans/{clanId}/wars/opponents` - Find opponents
- `POST /api/wars/initiate` - Initiate war
- `POST /api/wars/{warId}/accept` - Accept war
- `GET /api/wars/{warId}` - Get war details
- `POST /api/wars/{warId}/challenges/{challengeId}/complete` - Complete challenge

### WebSocket Events

**Real-time Updates**:
- `clan:member_joined` - New member joined
- `clan:member_left` - Member left
- `clan:donation_request` - New donation request
- `clan:donation_fulfilled` - Request fulfilled
- `clan:event_milestone` - Event milestone reached
- `clan:war_started` - War started
- `clan:war_ended` - War ended
- `clan:notification` - General notification

## Error Handling

### Common Error Codes

```csharp
public enum ClanErrorCode
{
    ClanNotFound = 1001,
    ClanNameTaken = 1002,
    InsufficientFunds = 1003,
    AlreadyInClan = 1004,
    NotInClan = 1005,
    InsufficientPermissions = 1006,
    MemberLimitReached = 1007,
    MinimumLevelNotMet = 1008,
    DonationLimitReached = 1009,
    RequestAlreadyExists = 1010,
    WarAlreadyActive = 1011,
    InvalidClanRole = 1012,
    CannotKickLeader = 1013,
    LeadershipTransferFailed = 1014
}
```

### Error Response Format

```json
{
  "success": false,
  "errorCode": 1002,
  "errorMessage": "Clan name is already taken",
  "timestamp": "2025-10-26T23:00:00Z"
}
```

## Testing Strategy

### Unit Tests

**Client Components**:
- ClanManager CRUD operations
- DonationManager request/donate logic
- EventManager contribution calculations
- FortManager resource tracking
- WarManager score calculations

**Server Components**:
- ClanService validation logic
- DonationService cooldown enforcement
- EventService milestone detection
- FortService upgrade logic
- WarService matchmaking algorithm

### Integration Tests

- End-to-end clan creation and joining flow
- Donation request lifecycle (create → donate → fulfill)
- Event participation and reward distribution
- Fort upgrade with multiple contributors
- War initiation, participation, and completion

### Performance Tests

- **Load Testing**: 1000 concurrent clans with 50 members each
- **Donation System**: 100 requests per second
- **Event System**: 500 point contributions per second
- **Search Performance**: Sub-500ms response for clan search

### UI/UX Tests

- Mobile responsiveness on various screen sizes
- Swipe gesture recognition for member actions
- Tab navigation performance
- Touch target sizes (minimum 48x48 pixels)
- Tutorial flow completion

## Performance Considerations

### Client Optimization

1. **Data Caching**: Cache clan data, member list, and event progress locally
2. **Lazy Loading**: Load member details on-demand when viewing profiles
3. **Asset Bundling**: Bundle badge/emblem assets by category
4. **Pagination**: Load members in batches of 20

### Server Optimization

1. **Database Indexing**: Index on clanId, playerId, createdAt, lastActiveAt
2. **Caching Strategy**: Cache clan data, member lists, and active events in Redis
3. **Background Jobs**: Process event rewards, war results, and cleanup tasks asynchronously
4. **Query Optimization**: Use aggregation pipelines for statistics

### Network Optimization

1. **Delta Updates**: Send only changed data for member list updates
2. **Batch Notifications**: Group notifications within 5-second windows
3. **Compression**: Gzip compression for API responses
4. **CDN**: Serve badge/emblem assets from CDN

## Security Considerations

### Authorization

- Role-based access control (RBAC) for clan operations
- Validate permissions on every action (kick, promote, update)
- Rate limiting: 10 API calls per minute per user
- Prevent self-promotion and self-kicking

### Data Validation

- Sanitize clan name, description, and tags
- Validate resource amounts and point contributions
- Prevent negative values and overflow attacks
- Check minimum level requirements

### Anti-Abuse Measures

- Cooldown on clan creation (24 hours after leaving)
- Limit clan hopping (24-hour cooldown between joins)
- Detect and prevent donation farming
- Monitor for coordinated war manipulation

## Progressive Feature Unlock

### Phase 1: Foundation (Level 20)
- Create/Join Clan
- Clan Chat
- Member List
- Basic Donation System

### Phase 2: Cooperation (3 days + 5 donations)
- Clan Events
- Event Leaderboard
- Milestone Rewards

### Phase 3: Development (2 events participated)
- Clan Fort
- Resource Contributions
- Fort Bonuses

### Phase 4: Competition (Fort Level 2)
- Clan Wars
- War Challenges
- War Rewards

## Future Enhancements

1. **Clan Alliances**: Multiple clans forming alliances for mega-events
2. **Clan Seasons**: Seasonal rankings and exclusive rewards
3. **Custom Roles**: Allow leaders to create custom roles with specific permissions
4. **Clan Shop**: Exclusive items purchasable with clan currency
5. **Clan Tournaments**: Bracket-style tournaments between clans
6. **Clan Achievements**: Collective achievements for milestone accomplishments
7. **Cross-Server Wars**: Wars between clans on different servers
8. **Clan Replay System**: Record and replay memorable war moments
