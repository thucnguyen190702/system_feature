# Requirements Document

## Introduction

Battle Pass System là một hệ thống tiến trình theo mùa (season-based progression system) được thiết kế để tăng cường sự tương tác của người chơi và tạo nguồn doanh thu bền vững. Hệ thống cung cấp hai luồng phần thưởng song song (miễn phí và trả phí), cho phép người chơi kiếm phần thưởng thông qua việc hoàn thành nhiệm vụ và tích lũy điểm kinh nghiệm trong một khoảng thời gian giới hạn.

## Glossary

- **Battle Pass System**: Hệ thống tiến trình theo mùa cho phép người chơi mở khóa phần thưởng thông qua việc chơi game và hoàn thành nhiệm vụ
- **Season**: Một chu kỳ thời gian giới hạn (30-60 ngày) trong đó một Battle Pass cụ thể có hiệu lực
- **Free Track**: Luồng phần thưởng miễn phí mà tất cả người chơi có thể truy cập
- **Premium Track**: Luồng phần thưởng trả phí yêu cầu mua Premium Pass để mở khóa
- **Premium Pass**: Vật phẩm có thể mua cho phép truy cập vào Premium Track
- **Pass XP**: Điểm kinh nghiệm dùng để thăng cấp trong Battle Pass
- **Tier**: Cấp độ trong Battle Pass, mỗi cấp độ chứa phần thưởng cụ thể
- **Mission**: Nhiệm vụ hoặc thử thách mà người chơi có thể hoàn thành để nhận Pass XP
- **Tier Skip**: Tính năng cho phép người chơi mua cấp độ bằng tiền thật
- **Season Bundle**: Gói bao gồm Premium Pass và một số cấp độ được mở khóa ngay lập tức
- **Reward Claim**: Hành động nhận phần thưởng sau khi đạt đến một cấp độ cụ thể
- **Player Profile**: Hồ sơ người chơi chứa thông tin về tiến trình và sở hữu

## Requirements

### Requirement 1

**User Story:** Là một người chơi, tôi muốn xem tất cả phần thưởng có sẵn trong cả hai luồng miễn phí và trả phí, để tôi có thể quyết định có nên mua Premium Pass hay không.

#### Acceptance Criteria

1. WHEN a player opens the Battle Pass interface, THE Battle Pass System SHALL display all tiers with their corresponding rewards for both Free Track and Premium Track
2. THE Battle Pass System SHALL render reward items with visual previews including icons and names
3. THE Battle Pass System SHALL indicate which rewards are locked behind the Premium Track with a distinct visual marker
4. THE Battle Pass System SHALL display the current season end date with countdown timer in days and hours
5. THE Battle Pass System SHALL highlight the player's current tier position within the reward progression view

### Requirement 2

**User Story:** Là một người chơi, tôi muốn kiếm Pass XP thông qua việc chơi game và hoàn thành nhiệm vụ, để tôi có thể thăng cấp trong Battle Pass.

#### Acceptance Criteria

1. WHEN a player completes a match, THE Battle Pass System SHALL award Pass XP based on match performance metrics
2. WHEN a player completes a daily mission, THE Battle Pass System SHALL grant the specified Pass XP amount to the player's season progress
3. WHEN a player completes a weekly mission, THE Battle Pass System SHALL grant the specified Pass XP amount to the player's season progress
4. WHEN a player's accumulated Pass XP reaches the threshold for the next tier, THE Battle Pass System SHALL advance the player to that tier
5. THE Battle Pass System SHALL display a visual notification with animation when a player levels up to a new tier

### Requirement 3

**User Story:** Là một người chơi, tôi muốn xem các nhiệm vụ có sẵn và tiến trình của chúng, để tôi biết cần làm gì để kiếm thêm Pass XP.

#### Acceptance Criteria

1. THE Battle Pass System SHALL display a list of all active daily missions with their descriptions and Pass XP rewards
2. THE Battle Pass System SHALL display a list of all active weekly missions with their descriptions and Pass XP rewards
3. WHEN a player makes progress toward a mission objective, THE Battle Pass System SHALL update the mission progress indicator in real-time
4. WHEN a mission is completed, THE Battle Pass System SHALL mark the mission as complete with a distinct visual state
5. WHEN the daily reset time occurs, THE Battle Pass System SHALL replace completed daily missions with new daily missions

### Requirement 4

**User Story:** Là một người chơi, tôi muốn mua Premium Pass để mở khóa phần thưởng cao cấp hơn, để tôi có thể nhận được giá trị tốt hơn từ thời gian chơi của mình.

#### Acceptance Criteria

1. THE Battle Pass System SHALL provide a purchase button for the Premium Pass with clearly displayed price
2. WHEN a player initiates a Premium Pass purchase, THE Battle Pass System SHALL verify the player has sufficient premium currency
3. WHEN a Premium Pass purchase is confirmed, THE Battle Pass System SHALL grant Premium Track access to the player for the current season
4. WHEN a player owns the Premium Pass, THE Battle Pass System SHALL unlock all Premium Track rewards up to the player's current tier immediately
5. THE Battle Pass System SHALL persist the Premium Pass ownership status in the Player Profile

### Requirement 5

**User Story:** Là một người chơi, tôi muốn nhận phần thưởng khi tôi đạt đến các cấp độ mới, để tôi cảm thấy sự tiến bộ của mình được công nhận.

#### Acceptance Criteria

1. WHEN a player reaches a new tier, THE Battle Pass System SHALL mark the tier's rewards as available for claim
2. WHEN a player claims a Free Track reward, THE Battle Pass System SHALL add the reward item to the player's inventory
3. WHEN a player who owns Premium Pass claims a Premium Track reward, THE Battle Pass System SHALL add the reward item to the player's inventory
4. IF a player attempts to claim a Premium Track reward without owning Premium Pass, THEN THE Battle Pass System SHALL display an error message and prevent the claim
5. THE Battle Pass System SHALL display a visual effect and play a sound effect when a reward is successfully claimed

### Requirement 6

**User Story:** Là một người chơi có ít thời gian, tôi muốn mua các cấp độ để bỏ qua tiến trình, để tôi có thể đạt được phần thưởng mà tôi muốn trước khi mùa giải kết thúc.

#### Acceptance Criteria

1. THE Battle Pass System SHALL provide a tier skip purchase option with price per tier displayed
2. WHEN a player initiates a tier skip purchase, THE Battle Pass System SHALL verify the player has sufficient premium currency for the requested number of tiers
3. WHEN a tier skip purchase is confirmed, THE Battle Pass System SHALL advance the player's tier by the purchased amount
4. WHEN a player's tier is advanced through purchase, THE Battle Pass System SHALL mark all newly reached tier rewards as available for claim
5. THE Battle Pass System SHALL enforce a maximum tier limit equal to the total number of tiers in the season

### Requirement 7

**User Story:** Là một người chơi, tôi muốn mua Season Bundle để nhận Premium Pass cùng với một số cấp độ ngay lập tức, để tôi có thể có lợi thế ban đầu trong mùa giải.

#### Acceptance Criteria

1. THE Battle Pass System SHALL provide a Season Bundle purchase option that includes Premium Pass and a specified number of tier skips
2. WHEN a player initiates a Season Bundle purchase, THE Battle Pass System SHALL verify the player has sufficient premium currency
3. WHEN a Season Bundle purchase is confirmed, THE Battle Pass System SHALL grant Premium Track access to the player
4. WHEN a Season Bundle purchase is confirmed, THE Battle Pass System SHALL advance the player's tier by the bundle's included tier skip amount
5. THE Battle Pass System SHALL display the Season Bundle with a calculated discount percentage compared to purchasing items separately

### Requirement 8

**User Story:** Là một người chơi, tôi muốn thấy tiến trình của mình được lưu lại, để tôi không mất tiến trình khi thoát game hoặc chuyển thiết bị.

#### Acceptance Criteria

1. WHEN a player earns Pass XP, THE Battle Pass System SHALL persist the updated Pass XP value to the Player Profile within 5 seconds
2. WHEN a player advances to a new tier, THE Battle Pass System SHALL persist the updated tier value to the Player Profile within 5 seconds
3. WHEN a player claims a reward, THE Battle Pass System SHALL persist the reward claim status to the Player Profile within 5 seconds
4. WHEN a player purchases Premium Pass or tier skips, THE Battle Pass System SHALL persist the purchase to the Player Profile within 5 seconds
5. WHEN a player logs in, THE Battle Pass System SHALL load all season progress data from the Player Profile

### Requirement 9

**User Story:** Là một quản trị viên, tôi muốn tạo và cấu hình các mùa giải mới với phần thưởng và nhiệm vụ tùy chỉnh, để tôi có thể duy trì nội dung mới cho người chơi.

#### Acceptance Criteria

1. THE Battle Pass System SHALL provide an administrative interface for creating a new season with start date and end date
2. THE Battle Pass System SHALL allow administrators to define the number of tiers for a season with a minimum of 10 tiers and maximum of 200 tiers
3. THE Battle Pass System SHALL allow administrators to assign specific reward items to each tier for both Free Track and Premium Track
4. THE Battle Pass System SHALL allow administrators to configure the Pass XP requirement for each tier
5. THE Battle Pass System SHALL allow administrators to create daily missions and weekly missions with objective definitions and Pass XP rewards

### Requirement 10

**User Story:** Là một người chơi, tôi muốn nhận thông báo về các sự kiện quan trọng trong Battle Pass, để tôi không bỏ lỡ cơ hội nhận phần thưởng hoặc hoàn thành nhiệm vụ.

#### Acceptance Criteria

1. WHEN a new season starts, THE Battle Pass System SHALL display a notification to the player with season details and featured rewards
2. WHEN a player has unclaimed rewards, THE Battle Pass System SHALL display a badge indicator on the Battle Pass menu button
3. WHEN a season has 7 days or fewer remaining, THE Battle Pass System SHALL display a warning notification to the player
4. WHEN a player completes a mission, THE Battle Pass System SHALL display a toast notification with the mission name and Pass XP earned
5. WHEN new daily missions become available, THE Battle Pass System SHALL display a notification to the player
