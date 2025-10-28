# Requirements Document

## Introduction

Hệ thống Chat trong Game là nền tảng giao tiếp xã hội cho phép người chơi tương tác, phối hợp và xây dựng cộng đồng. Hệ thống cần hỗ trợ nhiều kênh chat, định dạng tin nhắn đa dạng, và đặc biệt quan trọng là các công cụ kiểm duyệt để tạo môi trường giao tiếp an toàn và tích cực.

## Glossary

- **ChatSystem**: Hệ thống quản lý toàn bộ chức năng giao tiếp trong game
- **ChatChannel**: Một kênh chat cụ thể (public, group, private)
- **ChatMessage**: Một tin nhắn được gửi trong hệ thống
- **QuickMessage**: Tin nhắn được soạn sẵn để gửi nhanh

## Requirements

### Requirement 1

**User Story:** Là một người chơi, tôi muốn gửi tin nhắn văn bản đến các kênh khác nhau, để có thể giao tiếp với cộng đồng và đồng đội.

#### Acceptance Criteria

1. THE ChatSystem SHALL support three channel types: public channels, group channels, and private channels
2. WHEN a player sends a text message, THE ChatSystem SHALL deliver the message to all members of the target channel within 500 milliseconds
3. THE ChatSystem SHALL support messages with a maximum length of 500 characters
4. THE ChatMessage SHALL display sender avatar, sender name, timestamp, and message content
5. WHEN a player receives a new message, THE ChatSystem SHALL display a visual notification badge on the chat icon

### Requirement 2

**User Story:** Là một người chơi, tôi muốn sử dụng emoji, sticker và tin nhắn nhanh, để thể hiện cảm xúc một cách nhanh chóng mà không cần gõ nhiều.

#### Acceptance Criteria

1. THE ChatSystem SHALL provide a library of at least 50 emoji icons for players to insert into messages
2. THE ChatSystem SHALL provide a library of at least 20 sticker images for players to send as standalone messages
3. THE ChatSystem SHALL provide at least 10 predefined QuickMessage options for common gameplay situations
4. WHEN a player selects a QuickMessage, THE ChatSystem SHALL send the message to the active ChatChannel within 200 milliseconds
5. THE ChatSystem SHALL render emoji and sticker content with appropriate size and formatting

### Requirement 3

**User Story:** Là một người chơi, tôi muốn báo cáo và chặn người chơi có hành vi độc hại, để bảo vệ bản thân khỏi quấy rối và ngôn từ xúc phạm.

#### Acceptance Criteria

1. WHEN a player selects a ChatMessage, THE ChatSystem SHALL display options to report or block the sender
2. WHEN a player reports a ChatMessage, THE ChatSystem SHALL log the report with message content, sender ID, reporter ID, and timestamp
3. WHEN a player blocks another player, THE ChatSystem SHALL prevent all ChatMessage instances from the blocked player from appearing in any ChatChannel for the blocking player
4. THE ChatSystem SHALL automatically filter ChatMessage content containing words from a predefined profanity list before delivery
5. WHEN a ChatMessage is filtered, THE ChatSystem SHALL replace offensive words with asterisks and log the violation

### Requirement 4

**User Story:** Là một người chơi, tôi muốn tùy chỉnh cài đặt thông báo chat, để kiểm soát mức độ gián đoạn trong khi chơi game.

#### Acceptance Criteria

1. THE ChatSystem SHALL provide settings to enable or disable sound notifications for each channel type separately
2. THE ChatSystem SHALL provide settings to enable or disable visual notifications for each channel type separately
3. THE ChatSystem SHALL provide an option to mute all chat channels temporarily for a specified duration (15, 30, 60 minutes)
4. WHEN a player changes notification settings, THE ChatSystem SHALL apply the changes immediately without requiring a restart
5. THE ChatSystem SHALL persist notification settings across game sessions

### Requirement 5

**User Story:** Là một người chơi, tôi muốn giao diện chat không che khuất gameplay quan trọng, để có thể vừa giao tiếp vừa chơi game hiệu quả.

#### Acceptance Criteria

1. THE ChatSystem SHALL display the chat interface as a collapsible overlay that can be minimized to an icon
2. WHEN the chat window is expanded, THE ChatSystem SHALL occupy no more than 30% of the screen height on mobile devices
3. THE ChatSystem SHALL allow players to drag and reposition the chat window to any corner of the screen
4. WHEN a player taps outside the chat window, THE ChatSystem SHALL automatically minimize the chat window after 3 seconds of inactivity
5. THE ChatSystem SHALL use semi-transparent background with opacity of 80% to maintain visibility of gameplay elements

### Requirement 6

**User Story:** Là một người chơi, tôi muốn xem lịch sử tin nhắn gần đây, để có thể xem lại thông tin quan trọng mà tôi có thể đã bỏ lỡ.

#### Acceptance Criteria

1. THE ChatSystem SHALL store the most recent 100 messages for each channel locally on the device
2. WHEN a player opens a chat channel, THE ChatSystem SHALL display the most recent 20 messages immediately
3. WHEN a player scrolls upward in the chat history, THE ChatSystem SHALL load and display 20 additional older messages
4. THE ChatSystem SHALL retain chat history for the current game session only
5. WHEN a player logs out, THE ChatSystem SHALL clear all stored chat history from the device

### Requirement 7

**User Story:** Là một người chơi trên thiết bị di động, tôi muốn giao diện chat được tối ưu cho thao tác một tay, để có thể giao tiếp dễ dàng trong khi chơi.

#### Acceptance Criteria

1. THE ChatSystem SHALL position primary interaction buttons within 120 pixels from the bottom edge of the screen
2. THE ChatSystem SHALL provide a floating QuickMessage button with a diameter of at least 48 pixels
3. WHEN a player taps the QuickMessage button, THE ChatSystem SHALL display a radial menu of QuickMessage options within thumb reach
4. THE ChatSystem SHALL support swipe gestures to switch between ChatChannel instances
5. THE ChatSystem SHALL use font size of at least 14 pixels for ChatMessage text to ensure readability on small screens
