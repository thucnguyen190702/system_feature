# Hệ thống Bạn bè - Hướng dẫn Unity Client - Hướng dẫn Sử dụng

Hướng dẫn này giải thích cách sử dụng các tính năng của Hệ thống Bạn bè trong Unity game client.

## Mục lục

1. [Tổng quan UI](#tổng-quan-ui)
2. [Thêm Bạn bè](#thêm-bạn-bè)
3. [Quản lý Danh sách Bạn bè](#quản-lý-danh-sách-bạn-bè)
4. [Lời mời Kết bạn](#lời-mời-kết-bạn)
5. [Xem Profile](#xem-profile)
6. [Các Tác vụ Thường gặp](#các-tác-vụ-thường-gặp)

---

## Tổng quan UI

### Các Component UI Chính của Friend System

Friend System bao gồm nhiều UI panels:

1. **Friend List Panel**: Hiển thị tất cả bạn bè của bạn
2. **Search Panel**: Tìm người chơi mới để thêm
3. **Friend Request Panel**: Quản lý lời mời đến
4. **Profile Panel**: Xem chi tiết người chơi
5. **Error Popup**: Hiển thị thông báo lỗi

### Truy cập Friend System

- **Main Menu**: Nhấp nút "Bạn bè"
- **Trong Game**: Nhấn biểu tượng Friends ở menu trên
- **Sau Trận đấu**: Nhấp nút "Thêm bạn bè"

---

## Thêm Bạn bè

### Bước 1: Mở Search Panel

1. Nhấp nút **"Thêm bạn bè"** hoặc **"+"**
2. Search Panel mở ra

### Bước 2: Tìm kiếm Người chơi

**Tìm kiếm theo Username**:
1. Chọn tab **"Username"**
2. Gõ ít nhất 2 ký tự
3. Nhấp **"Tìm kiếm"** hoặc nhấn Enter
4. Kết quả xuất hiện bên dưới

**Tìm kiếm theo ID**:
1. Chọn tab **"ID"**
2. Nhập Account ID đầy đủ
3. Nhấp **"Tìm kiếm"**
4. Profile của người chơi xuất hiện

### Bước 3: Gửi Lời mời Kết bạn

1. Tìm người chơi trong kết quả tìm kiếm
2. Nhấp nút **"Thêm bạn bè"** bên cạnh tên họ
3. Thông báo xác nhận xuất hiện
4. Lời mời đã được gửi!

**Thông báo Thành công**: "Đã gửi lời mời kết bạn thành công!"

---

## Quản lý Danh sách Bạn bè

### Mở Danh sách Bạn bè

1. Nhấp biểu tượng **"Friends"** trên màn hình chính
2. Danh sách bạn bè mở ra hiển thị tất cả bạn bè

### Tính năng Danh sách Bạn bè

#### Xem Bạn bè

Mỗi entry bạn bè hiển thị:
- **Avatar**: Ảnh đại diện
- **Display Name**: Tên của họ
- **Level**: Level game hiện tại
- **Online Status**: 
  - 🟢 Xanh = Online
  - ⚫ Xám = Offline
- **Last Seen**: Lần cuối họ online (nếu offline)

#### Sắp xếp Bạn bè

Nhấp dropdown **"Sort"** để sắp xếp theo:
- **Name (A-Z)**: Thứ tự bảng chữ cái
- **Level**: Level cao nhất trước
- **Online**: Bạn bè online xuất hiện trước
- **Recent**: Bạn bè mới thêm gần đây trước

#### Tìm kiếm trong Danh sách Bạn bè

1. Sử dụng search box ở trên cùng
2. Gõ bất kỳ phần nào của tên bạn bè
3. Danh sách lọc tự động
4. Xóa tìm kiếm để thấy lại tất cả bạn bè

#### Số lượng Bạn bè

Ở cuối danh sách:
- **Current**: Số lượng bạn bè bạn có
- **Maximum**: Giới hạn danh sách bạn bè

Ví dụ: "Bạn bè: 25/100"

### Tương tác với Bạn bè

Nhấp vào bất kỳ bạn bè nào để:
- **View Profile**: Xem thông tin chi tiết
- **Remove Friend**: Xóa khỏi danh sách
- **Send Message**: (nếu messaging được bật)

---

## Lời mời Kết bạn

### Notification Badge

Biểu tượng Friend Request hiển thị **badge đỏ** với số lượng lời mời đang chờ.

Ví dụ: 🔔 **3** = Bạn có 3 lời mời đang chờ

### Xem Lời mời

1. Nhấp biểu tượng **Friend Request** (biểu tượng chuông)
2. Friend Request Panel mở ra
3. Xem tất cả lời mời đến

### Thông tin Lời mời

Mỗi lời mời hiển thị:
- **Avatar của Người gửi**
- **Display Name**
- **Username**
- **Level**
- **Time Sent**: Bao lâu trước lời mời được gửi

### Chấp nhận Lời mời

1. Xem lại chi tiết lời mời
2. Nhấp nút **"Accept"** (biểu tượng ✓)
3. Xác nhận: "Đã chấp nhận lời mời kết bạn!"
4. Người chơi được thêm vào danh sách bạn bè
5. Lời mời biến mất khỏi danh sách

### Từ chối Lời mời

1. Tìm lời mời bạn muốn từ chối
2. Nhấp nút **"Decline"** (biểu tượng ✗)
3. Lời mời bị xóa
4. Không có thông báo nào được gửi cho người gửi

### Tự động Làm mới

Danh sách lời mời cập nhật tự động khi:
- Lời mời mới đến
- Bạn chấp nhận/từ chối lời mời
- Lời mời bị hủy bởi người gửi

---

## Xem Profile

### Mở Profile

**Từ Friend List**:
1. Nhấp vào bất kỳ bạn bè nào
2. Profile của họ mở ra

**Từ Search Results**:
1. Tìm kiếm một người chơi
2. Nhấp vào tên họ hoặc "View Profile"

**Từ Friend Request**:
1. Mở Friend Requests
2. Nhấp vào tên người gửi

### Thông tin Profile

Profile hiển thị:
- **Avatar**: Ảnh đại diện lớn
- **Display Name**: Tên hiển thị của họ
- **Username**: Tên đăng nhập của họ
- **Account ID**: Mã định danh duy nhất
- **Level**: Level game hiện tại
- **Status**: Online/Offline
- **Last Seen**: Lần cuối họ online

### Hành động Profile

Tùy thuộc vào mối quan hệ của bạn:

**Nếu Chưa là Bạn bè**:
- Nút **"Add Friend"**: Gửi lời mời kết bạn

**Nếu Đã là Bạn bè**:
- Nút **"Remove Friend"**: Xóa khỏi danh sách bạn bè
- Nút **"View Stats"**: Xem thống kê game (nếu có)

**Bất kỳ Người chơi nào**:
- Nút **"Block User"**: Chặn người chơi này
- Nút **"Close"**: Quay lại màn hình trước

---

## Các Tác vụ Thường gặp

### Tác vụ: Tìm và Thêm Bạn bè Cụ thể

1. Lấy **Account ID** hoặc **Username** của họ
2. Nhấp **"Add Friend"** (+)
3. Chọn phương pháp tìm kiếm (ID hoặc Username)
4. Nhập thông tin của họ
5. Nhấp **"Search"**
6. Nhấp **"Add Friend"** trên profile của họ
7. Chờ họ chấp nhận

**Thời gian**: ~30 giây

---

### Tác vụ: Chấp nhận Tất cả Lời mời Kết bạn

1. Nhấp biểu tượng **Friend Request** (🔔)
2. Xem lại từng lời mời
3. Nhấp **"Accept"** (✓) cho từng cái
4. Lời mời biến mất khi bạn chấp nhận
5. Kiểm tra danh sách bạn bè để thấy bạn bè mới

**Thời gian**: ~10 giây mỗi lời mời

---

### Tác vụ: Xóa Bạn bè Không hoạt động

1. Mở **Friend List**
2. Sắp xếp theo **"Online"** để thấy bạn bè offline
3. Nhấp vào bạn bè muốn xóa
4. Nhấp **"Remove Friend"**
5. Xác nhận hành động
6. Họ bị xóa khỏi danh sách của bạn

**Thời gian**: ~15 giây

---

### Tác vụ: Kiểm tra Bạn bè nào Đang Online

1. Mở **Friend List**
2. Sắp xếp theo **"Online"**
3. Bạn bè online xuất hiện ở trên cùng với 🟢
4. Bạn bè offline xuất hiện bên dưới với ⚫

**Thời gian**: ~5 giây

---

### Tác vụ: Tìm Bạn bè trong Danh sách Lớn

1. Mở **Friend List**
2. Nhấp **search box** ở trên cùng
3. Gõ một phần tên của họ
4. Danh sách lọc theo tên phù hợp
5. Nhấp vào bạn bè của bạn

**Thời gian**: ~10 giây

---

## Mẹo và Thủ thuật UI

### Hành động Nhanh

- **Double-click** một bạn bè để mở profile nhanh chóng
- **Right-click** (nếu được hỗ trợ) cho context menu
- **Phím Escape** đóng panel hiện tại

### Chỉ báo Trực quan

- **Chấm xanh** (🟢): Bạn bè đang online
- **Chấm xám** (⚫): Bạn bè đang offline
- **Badge đỏ**: Số lượng lời mời đang chờ
- **Highlight vàng**: Bạn bè mới thêm gần đây

### Mẹo Hiệu suất

- Danh sách bạn bè cache dữ liệu để load nhanh hơn
- Kéo xuống để làm mới danh sách thủ công
- Trạng thái online cập nhật tự động mỗi 30 giây

### Điều hướng Bàn phím

Nếu keyboard controls được bật:
- **Tab**: Di chuyển giữa các UI elements
- **Enter**: Xác nhận hành động
- **Escape**: Đóng panel
- **Arrow Keys**: Điều hướng danh sách

---

## Thông báo Lỗi

### Lỗi Thường gặp và Giải pháp

#### "Không thể gửi lời mời kết bạn"

**Nguyên nhân**:
- Đã đạt giới hạn hàng ngày (10 lời mời/ngày)
- Đã là bạn bè với người chơi này
- Người chơi đã chặn bạn
- Vấn đề kết nối mạng

**Giải pháp**: Chờ 24 giờ hoặc kiểm tra kết nối

---

#### "Không thể tải danh sách bạn bè"

**Nguyên nhân**:
- Không có kết nối internet
- Server đang down
- Xác thực đã hết hạn

**Giải pháp**: 
1. Kiểm tra kết nối internet
2. Đóng và mở lại panel
3. Khởi động lại game nếu cần

---

#### "Không tìm thấy tài khoản"

**Nguyên nhân**:
- Account ID sai
- Username không tồn tại
- Lỗi chính tả trong tìm kiếm

**Giải pháp**: Kiểm tra lại ID/username và thử lại

---

#### "Danh sách bạn bè đã đầy"

**Nguyên nhân**:
- Bạn đã đạt giới hạn tối đa bạn bè

**Giải pháp**: Xóa một số bạn bè không hoạt động để tạo chỗ trống

---

## Xử lý Sự cố

### Danh sách Bạn bè Không Cập nhật

1. Đóng Friend List panel
2. Chờ 5 giây
3. Mở lại panel
4. Nếu vẫn không hoạt động, khởi động lại game

### Tìm kiếm Không hoạt động

1. Đảm bảo bạn đã gõ ít nhất 2 ký tự
2. Kiểm tra kết nối internet
3. Thử tìm kiếm bằng ID thay thế
4. Khởi động lại game

### Không thể Chấp nhận Lời mời Kết bạn

1. Kiểm tra xem danh sách bạn bè có đầy không
2. Đảm bảo bạn có kết nối internet
3. Thử từ chối và yêu cầu họ gửi lại
4. Khởi động lại game

### Profile Không Load

1. Đóng profile panel
2. Thử mở lại
3. Kiểm tra kết nối internet
4. Khởi động lại game nếu cần

---

## Thực hành Tốt nhất

### Để có Trải nghiệm Tốt hơn

✅ **Nên**:
- Giữ danh sách bạn bè có tổ chức
- Chấp nhận lời mời kịp thời
- Xóa bạn bè không hoạt động định kỳ
- Sử dụng tìm kiếm để tìm bạn bè nhanh chóng
- Kiểm tra trạng thái online trước khi mời vào game

❌ **Không nên**:
- Gửi spam lời mời kết bạn
- Chấp nhận lời mời từ người chơi không quen
- Chia sẻ Account ID công khai
- Giữ danh sách bạn bè ở mức tối đa

---

## Thẻ Tham khảo Nhanh

### Biểu tượng Nút

| Biểu tượng | Ý nghĩa |
|------------|---------|
| + | Thêm Bạn bè |
| 🔔 | Lời mời Kết bạn |
| 👥 | Danh sách Bạn bè |
| 🟢 | Online |
| ⚫ | Offline |
| ✓ | Chấp nhận |
| ✗ | Từ chối |
| 🗑️ | Xóa |
| 🔍 | Tìm kiếm |

### Phím tắt Panel

| Panel | Truy cập |
|-------|----------|
| Danh sách Bạn bè | Nhấp biểu tượng Friends |
| Tìm kiếm | Nhấp biểu tượng + |
| Lời mời | Nhấp biểu tượng 🔔 |
| Profile | Nhấp vào bất kỳ người chơi nào |

---

## Nhận Trợ giúp

Nếu bạn cần hỗ trợ:

1. **In-Game Help**: Nhấn F1 hoặc nhấp nút Help
2. **Thông báo Lỗi**: Đọc error popup cẩn thận
3. **Khởi động lại**: Nhiều vấn đề được giải quyết bằng cách khởi động lại game
4. **Support**: Sử dụng tính năng support trong game
5. **Tài liệu**: Kiểm tra User Guide đầy đủ

---

## Cập nhật và Thay đổi

Friend System có thể nhận được cập nhật. Kiểm tra patch notes cho:
- Tính năng mới
- Cải thiện UI
- Sửa lỗi
- Thay đổi giới hạn hoặc hạn chế

---

**Phiên bản**: 1.0.0  
**Platform**: Unity Client  
**Cập nhật lần cuối**: 28 tháng 10, 2025

Để xem hướng dẫn người dùng đầy đủ, xem [USER_GUIDE.md](../../../../../USER_GUIDE.md)
