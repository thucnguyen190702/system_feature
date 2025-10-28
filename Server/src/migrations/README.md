# Database Migrations - Hướng dẫn Sử dụng

Thư mục này chứa các TypeORM migration files cho Friend System database schema.

## Migration Files

### 1700000001-CreateAccountsTable.ts
Tạo bảng `accounts` với tất cả columns và indexes cần thiết.

**Bảng Được tạo:**
- `accounts`

**Indexes:**
- `idx_accounts_username` - Username lookups nhanh
- `idx_accounts_status` - Filter theo account status
- `idx_accounts_is_online` - Query online users

**Yêu cầu Được giải quyết:** 1.1, 1.2

---

### 1700000002-CreateFriendRequestsTable.ts
Creates the `friend_requests` table with foreign key relationships to accounts.

**Tables Created:**
- `friend_requests`

**Foreign Keys:**
- `fk_friend_requests_from_account` - References accounts(account_id)
- `fk_friend_requests_to_account` - References accounts(account_id)

**Indexes:**
- `idx_friend_requests_from` - Query requests sent by user
- `idx_friend_requests_to` - Query requests received by user
- `idx_friend_requests_status` - Filter by request status

**Requirements Addressed:** 2.4

---

### 1700000003-CreateFriendRelationshipsTable.ts
Creates the `friend_relationships` table with bidirectional friendship support.

**Tables Created:**
- `friend_relationships`

**Foreign Keys:**
- `fk_friend_relationships_account1` - References accounts(account_id)
- `fk_friend_relationships_account2` - References accounts(account_id)

**Unique Constraints:**
- `uq_friend_relationships_accounts` - Prevents duplicate friendships

**Indexes:**
- `idx_friend_relationships_account1` - Query friends of user
- `idx_friend_relationships_account2` - Query friends of user (reverse)

**Requirements Addressed:** 3.1, 3.4

---

## Chạy Migrations

### Áp dụng Tất cả Pending Migrations
```bash
npm run migration:run
```

### Hoàn tác Migration Cuối cùng
```bash
npm run migration:revert
```

### Xác minh Schema
```bash
npm run schema:verify
```

## Quy ước Đặt tên Migration

Migrations tuân theo pattern: `{timestamp}-{DescriptiveName}.ts`

Ví dụ: `1700000001-CreateAccountsTable.ts`

## Tạo Migrations Mới

Để tạo migration mới dựa trên entity changes:
```bash
npm run migration:generate -- src/migrations/MigrationName
```

Để tạo migration rỗng:
```bash
npm run typeorm -- migration:create src/migrations/MigrationName
```

## Thực hành Tốt nhất

1. **Không bao giờ sửa đổi migrations hiện có** đã chạy trong production
2. **Luôn test migrations** trong development trước khi deploy
3. **Tạo rollback logic** trong method `down()`
4. **Sử dụng transactions** cho migrations phức tạp
5. **Thêm indexes** cho các columns được query thường xuyên
6. **Tài liệu hóa breaking changes** trong migration comments

## Troubleshooting

If migrations fail:
1. Check database connection in `.env`
2. Verify PostgreSQL is running
3. Check migration order (timestamps)
4. Review error logs
5. Use `npm run migration:revert` to rollback

For detailed troubleshooting, see [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md)
