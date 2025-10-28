# API Controllers - Hướng dẫn Sử dụng

Thư mục này chứa các API controllers cho Friend System.

## Controllers

### AccountController
Xử lý các thao tác liên quan đến tài khoản:
- `POST /api/accounts` - Tạo tài khoản mới
- `GET /api/accounts/:accountId` - Lấy tài khoản theo ID
- `PUT /api/accounts/:accountId` - Cập nhật thông tin tài khoản

### FriendController
Xử lý các thao tác liên quan đến bạn bè:
- `GET /api/friends/:accountId` - Lấy danh sách bạn bè
- `POST /api/friend-requests` - Gửi lời mời kết bạn
- `POST /api/friend-requests/:requestId/accept` - Chấp nhận lời mời kết bạn
- `DELETE /api/friends/:friendAccountId` - Xóa bạn bè
- `GET /api/friend-requests/:accountId/pending` - Lấy lời mời đang chờ
- `POST /api/friends/status` - Cập nhật trạng thái online
- `POST /api/friends/status/batch` - Lấy trạng thái online của bạn bè

### SearchController
Xử lý các thao tác tìm kiếm:
- `GET /api/search/username?q=:query` - Tìm kiếm theo username
- `GET /api/search/id/:accountId` - Tìm kiếm theo ID

## Sử dụng

Tất cả controllers được export từ `index.ts` và có thể import như:

```typescript
import { AccountController, FriendController, SearchController } from './controllers';
```

## Xử lý Lỗi

Tất cả controllers triển khai xử lý lỗi toàn diện:
- 400 Bad Request - Input không hợp lệ hoặc lỗi validation
- 404 Not Found - Không tìm thấy resource
- 409 Conflict - Resource trùng lặp (ví dụ: username đã tồn tại)
- 500 Internal Server Error - Lỗi không mong đợi

## Các Bước Tiếp theo

Để sử dụng các controllers này, bạn cần:
1. Tạo Express routes trong `Server/src/routes/`
2. Kết nối routes trong `Server/src/index.ts`
3. Áp dụng authentication middleware khi cần thiết
