# Requirements Document - Hệ thống Clan (Guild)

## Introduction

Hệ thống Clan (Guild) là nền tảng xã hội cốt lõi cho phép người chơi tạo lập và tham gia các cộng đồng, hợp tác trong các nhiệm vụ chung, và cạnh tranh với các Clan khác. Hệ thống được thiết kế theo mô hình "xây dựng theo giai đoạn", bắt đầu với các tính năng cơ bản (chat, tặng vật phẩm) và dần dần mở rộng sang các hoạt động phức tạp hơn (sự kiện hợp tác, chiến tranh Clan).

## Glossary

- **Clan**: Một nhóm người chơi tổ chức với cấu trúc quản lý và mục tiêu chung
- **ClanMember**: Thành viên của một Clan với vai trò và quyền hạn cụ thể
- **ClanRole**: Vai trò trong Clan (Leader, Co-leader, Elder, Member)
- **ClanChat**: Kênh chat riêng của Clan
- **ClanRequest**: Yêu cầu tham gia Clan từ người chơi
- **DonationSystem**: Hệ thống tặng/yêu cầu vật phẩm giữa các thành viên
- **ClanEvent**: Sự kiện hợp tác hoặc cạnh tranh của Clan
- **ClanWar**: Cuộc chiến giữa các Clan
- **ClanFort**: Công trình chung của Clan có thể nâng cấp
- **ClanTreasury**: Kho tài nguyên chung của Clan

## Requirements

### Requirement 1

**User Story:** Là một người chơi, tôi muốn tạo Clan của riêng mình, để có thể xây dựng cộng đồng theo phong cách và mục tiêu của tôi.

#### Acceptance Criteria

1. WHEN a player creates a Clan, THE ClanSystem SHALL require a unique Clan name with 3-20 characters
2. THE ClanSystem SHALL charge a creation fee of 1000 gold coins from the player's account
3. THE ClanSystem SHALL allow the creator to set Clan description (max 200 characters), badge/emblem, and join mode (Open/Closed)
4. WHEN a Clan is created, THE ClanSystem SHALL automatically assign the creator as Clan Leader
5. THE ClanSystem SHALL set the default maximum member limit to 50 players per Clan

### Requirement 2

**User Story:** Là một người chơi, tôi muốn tìm kiếm và tham gia Clan phù hợp, để kết nối với những người chơi có cùng sở thích và phong cách chơi.

#### Acceptance Criteria

1. THE ClanSystem SHALL provide a search function to find Clans by name, tag, or description keywords
2. THE ClanSystem SHALL display Clan list with information: name, badge, member count, join mode, activity level, and description preview
3. THE ClanSystem SHALL allow filtering Clans by: member count range, activity level (casual/competitive), language, and minimum level requirement
4. WHEN a player requests to join an Open Clan, THE ClanSystem SHALL add them immediately without approval
5. WHEN a player requests to join a Closed Clan, THE ClanSystem SHALL create a pending request for Leader/Co-leader approval

### Requirement 3

**User Story:** Là Trưởng Clan, tôi muốn quản lý thành viên và phân quyền, để duy trì trật tự và hiệu quả hoạt động của Clan.

#### Acceptance Criteria

1. THE ClanSystem SHALL support four role levels: Leader (1), Co-leader (unlimited), Elder (unlimited), and Member (default)
2. WHEN a Leader promotes a member, THE ClanSystem SHALL grant role-specific permissions immediately
3. THE ClanSystem SHALL allow Leader and Co-leader to approve/reject join requests within 7 days before auto-expiration
4. THE ClanSystem SHALL allow Leader and Co-leader to kick members with a confirmation dialog
5. THE ClanSystem SHALL allow Leader to transfer leadership to another member, requiring confirmation from both parties

### Requirement 4

**User Story:** Là thành viên Clan, tôi muốn yêu cầu và tặng vật phẩm cho đồng đội, để hỗ trợ lẫn nhau và tăng tốc độ tiến bộ.

#### Acceptance Criteria

1. THE DonationSystem SHALL allow each member to create one active donation request at a time
2. WHEN a member creates a request, THE DonationSystem SHALL display it in the Clan feed for 8 hours before expiration
3. THE DonationSystem SHALL allow each member to donate to requests up to 5 times per day
4. WHEN a member donates, THE DonationSystem SHALL reward the donor with 5 gold coins and 1 experience point
5. THE DonationSystem SHALL notify the requester when their request is fulfilled or expires

### Requirement 5

**User Story:** Là thành viên Clan, tôi muốn tham gia các nhiệm vụ hợp tác, để cùng đồng đội đạt được phần thưởng chung.

#### Acceptance Criteria

1. THE ClanEvent SHALL run weekly co-op tasks where members contribute points by completing game objectives
2. WHEN a member completes an objective, THE ClanEvent SHALL add their points to the Clan's total progress
3. THE ClanEvent SHALL display a progress bar showing current points and milestone rewards (Bronze, Silver, Gold, Platinum)
4. WHEN a milestone is reached, THE ClanEvent SHALL distribute rewards to all members who contributed at least 100 points
5. THE ClanEvent SHALL display a leaderboard showing top 10 contributors within the Clan

### Requirement 6

**User Story:** Là thành viên Clan, tôi muốn đóng góp vào phát triển công trình chung, để mở khóa lợi ích cho toàn bộ Clan.

#### Acceptance Criteria

1. THE ClanFort SHALL have 5 upgrade levels, each requiring collective resource contributions from members
2. WHEN a member donates resources, THE ClanFort SHALL add them to the upgrade progress bar
3. WHEN an upgrade level is completed, THE ClanFort SHALL unlock passive bonuses for all members (e.g., +5% gold gain, +10% XP)
4. THE ClanSystem SHALL track and display each member's total contribution to the ClanFort
5. THE ClanFort SHALL reset upgrade progress if the Clan disbands

### Requirement 7

**User Story:** Là Trưởng Clan, tôi muốn tổ chức Clan War với các Clan khác, để tạo ra trải nghiệm cạnh tranh và gắn kết thành viên.

#### Acceptance Criteria

1. THE ClanWar SHALL allow Leader and Co-leader to search for opponent Clans with similar member count (±10 members)
2. WHEN a war is initiated, THE ClanWar SHALL require confirmation from both Clan leaders within 24 hours
3. THE ClanWar SHALL last for 48 hours, during which members earn war points by completing designated challenges
4. WHEN the war ends, THE ClanWar SHALL calculate total points and declare the winning Clan
5. THE ClanWar SHALL distribute rewards based on war result: winner gets 1000 gems per member, loser gets 500 gems per member

### Requirement 8

**User Story:** Là thành viên Clan, tôi muốn xem thống kê và lịch sử hoạt động, để theo dõi sự phát triển và đóng góp của mình và đồng đội.

#### Acceptance Criteria

1. THE ClanSystem SHALL display Clan statistics: total members, average level, total donations, total war wins/losses
2. THE ClanSystem SHALL display member list with: name, level, role, last active time, total donations, and reputation
3. THE ClanSystem SHALL provide an activity log showing recent events: joins, leaves, promotions, donations, and war results
4. THE ClanSystem SHALL track individual member statistics: join date, total donations given/received, event contributions, war participation
5. THE ClanSystem SHALL allow sorting members by: name, level, role, last active, donations, or reputation

### Requirement 9

**User Story:** Là một người chơi casual, tôi muốn tham gia Clan mà không bị áp lực phải hoạt động liên tục, để tận hưởng lợi ích xã hội mà không cảm thấy như một "công việc".

#### Acceptance Criteria

1. THE ClanSystem SHALL allow Clans to self-identify as "Casual" or "Competitive" during creation
2. WHEN searching for Clans, THE ClanSystem SHALL display the Clan's activity expectation level prominently
3. THE ClanSystem SHALL NOT penalize members for not participating in optional events
4. THE ClanSystem SHALL provide rewards for participation but NOT require minimum activity thresholds for basic membership
5. THE ClanSystem SHALL allow members to opt-out of Clan Wars without affecting their membership status

### Requirement 10

**User Story:** Là Trưởng Clan, tôi muốn có công cụ quản lý thành viên không hoạt động, để duy trì sức sống và hiệu quả của Clan.

#### Acceptance Criteria

1. THE ClanSystem SHALL track and display the last active time for each member
2. THE ClanSystem SHALL provide a filter to show members inactive for more than 7, 14, or 30 days
3. THE ClanSystem SHALL allow Leader and Co-leader to send a "wake-up" notification to inactive members
4. THE ClanSystem SHALL provide a bulk kick option for members inactive for more than 30 days, with confirmation
5. THE ClanSystem SHALL send a warning notification to members who have been inactive for 14 days

### Requirement 11

**User Story:** Là thành viên Clan, tôi muốn nhận thông báo về các hoạt động quan trọng, để không bỏ lỡ sự kiện và cơ hội đóng góp.

#### Acceptance Criteria

1. THE ClanSystem SHALL send push notifications for: new donation requests, event milestones reached, war started/ended, and role promotions
2. THE ClanSystem SHALL allow members to customize notification preferences for each event type
3. WHEN a Clan event starts, THE ClanSystem SHALL display an in-game banner notification
4. THE ClanSystem SHALL display a badge counter on the Clan icon showing unread notifications
5. THE ClanSystem SHALL store notification history for the past 7 days

### Requirement 12

**User Story:** Là một người chơi, tôi muốn rời Clan một cách dễ dàng, để có thể tìm kiếm môi trường phù hợp hơn nếu cần.

#### Acceptance Criteria

1. THE ClanSystem SHALL allow any member (except Leader) to leave the Clan at any time with a confirmation dialog
2. WHEN a member leaves, THE ClanSystem SHALL remove them from all Clan channels and activities immediately
3. THE ClanSystem SHALL impose a 24-hour cooldown before the player can join another Clan
4. WHEN the Leader leaves, THE ClanSystem SHALL automatically transfer leadership to the highest-ranking Co-leader, or disband the Clan if no Co-leader exists
5. THE ClanSystem SHALL notify all members when someone leaves the Clan

### Requirement 13

**User Story:** Là thành viên Clan, tôi muốn giao diện Clan được tối ưu cho thiết bị di động, để dễ dàng tương tác và quản lý mọi lúc mọi nơi.

#### Acceptance Criteria

1. THE ClanUI SHALL display member list in a scrollable view with touch-friendly list items (minimum 60px height)
2. THE ClanUI SHALL provide swipe gestures to access quick actions: view profile (swipe right), kick/promote (swipe left for leaders)
3. THE ClanUI SHALL use tab navigation for main sections: Chat, Members, Events, Fort, and Settings
4. THE ClanUI SHALL display all interactive buttons with minimum 48x48 pixel touch targets
5. THE ClanUI SHALL adapt layout for portrait and landscape orientations on mobile devices

### Requirement 14

**User Story:** Là Trưởng Clan, tôi muốn tùy chỉnh hình ảnh và thông tin Clan, để thể hiện bản sắc và thu hút thành viên phù hợp.

#### Acceptance Criteria

1. THE ClanSystem SHALL provide a library of at least 50 badge/emblem designs for Clan customization
2. THE ClanSystem SHALL allow Leader to change Clan description, badge, and join mode at any time
3. THE ClanSystem SHALL allow Leader to set minimum level requirement for joining (0-100)
4. THE ClanSystem SHALL allow Leader to add up to 5 custom tags to describe the Clan (e.g., "English", "Competitive", "Adults Only")
5. THE ClanSystem SHALL display a preview of how the Clan appears in search results before saving changes

### Requirement 15

**User Story:** Là một người chơi, tôi muốn hệ thống Clan được giới thiệu từng bước, để không bị choáng ngợp bởi quá nhiều tính năng cùng lúc.

#### Acceptance Criteria

1. THE ClanSystem SHALL unlock at player level 20 with a tutorial explaining basic benefits
2. WHEN a player first joins a Clan, THE ClanSystem SHALL show a guided tour of: Chat, Donation, and Member List features only
3. THE ClanSystem SHALL unlock Clan Events feature after the player has been a member for 3 days
4. THE ClanSystem SHALL unlock Clan Fort feature after the player has made 5 donations
5. THE ClanSystem SHALL unlock Clan War feature after the player has participated in 2 Clan Events
