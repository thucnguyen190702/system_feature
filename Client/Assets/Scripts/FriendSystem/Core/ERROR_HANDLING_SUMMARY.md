# Error Handling Implementation Summary

## Tổng quan

Đã triển khai hệ thống xử lý lỗi hoàn chỉnh cho Friend System với ErrorHandler class và ErrorPopupUI component.

## Files đã tạo

### 1. ErrorHandler.cs
**Location**: `Client/Assets/Scripts/FriendSystem/Core/ErrorHandler.cs`

**Chức năng**:
- Xử lý lỗi từ UnityWebRequest với các HTTP status codes khác nhau
- Chuyển đổi lỗi kỹ thuật thành thông báo thân thiện bằng tiếng Việt
- Cung cấp event system để UI có thể lắng nghe và hiển thị lỗi
- Hỗ trợ xử lý exceptions tổng quát

**Error Types**:
- BadRequest (400)
- Unauthorized (401, 403)
- NotFound (404)
- ServerError (500+)
- NetworkError (Connection errors)
- Timeout
- Unknown

**Key Methods**:
- `HandleApiError(UnityWebRequest request)`: Xử lý lỗi từ API calls
- `HandleException(Exception ex)`: Xử lý exceptions tổng quát
- `ShowCustomError(string message, ErrorType errorType)`: Hiển thị lỗi tùy chỉnh

**Event**:
- `OnError`: Event được trigger khi có lỗi, UI có thể subscribe để hiển thị

### 2. ErrorPopupUI.cs
**Location**: `Client/Assets/Scripts/FriendSystem/UI/ErrorPopupUI.cs`

**Chức năng**:
- Component UI hiển thị popup lỗi
- Tự động subscribe vào ErrorHandler.OnError event
- Hiển thị title, message, và icon với màu sắc phù hợp cho từng loại lỗi
- Hỗ trợ auto-close sau một khoảng thời gian
- Có thể đóng thủ công bằng nút Close

**UI Elements**:
- Popup Panel (background overlay)
- Error Icon (với màu sắc thay đổi theo error type)
- Error Title Text
- Error Message Text
- Close Button

**Settings**:
- Auto Close: Tự động đóng popup
- Auto Close Delay: Thời gian chờ trước khi đóng (mặc định 5 giây)
- Error Type Colors: Màu sắc cho từng loại lỗi

### 3. ErrorPopupUI_README.md
**Location**: `Client/Assets/Scripts/FriendSystem/UI/ErrorPopupUI_README.md`

Tài liệu hướng dẫn chi tiết về:
- Cách thiết lập UI trong Unity Editor
- Cách sử dụng trong code
- Các loại lỗi được hỗ trợ
- Tùy chỉnh giao diện
- Troubleshooting
- Best practices

## Tích hợp với ApiClient

ApiClient đã được cập nhật để sử dụng ErrorHandler:

```csharp
// Trong mỗi method (GetAsync, PostAsync, PutAsync, DeleteAsync)
if (request.result == UnityWebRequest.Result.Success)
{
    // ... xử lý thành công
}
else
{
    ErrorHandler.HandleApiError(request);  // ← Thêm dòng này
    throw new Exception($"API Error: {request.error} - {request.downloadHandler.text}");
}
```

## Thông báo lỗi tiếng Việt

Tất cả thông báo lỗi đã được dịch sang tiếng Việt và thân thiện với người dùng:

| HTTP Code | Thông báo |
|-----------|-----------|
| 400 | Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin. |
| 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| 403 | Bạn không có quyền thực hiện thao tác này. |
| 404 | Không tìm thấy thông tin yêu cầu. |
| 409 | Dữ liệu đã tồn tại hoặc xung đột. |
| 429 | Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau. |
| 500 | Lỗi server. Vui lòng thử lại sau. |
| 502/503 | Server tạm thời không khả dụng. Vui lòng thử lại sau. |
| Network | Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet. |

## Cách sử dụng

### 1. Thiết lập UI (One-time setup)

1. Tạo Error Popup UI theo hướng dẫn trong ErrorPopupUI_README.md
2. Gắn ErrorPopupUI script vào popup panel
3. Gán tất cả UI references trong Inspector
4. Tạo prefab và thêm vào Scene

### 2. Sử dụng tự động

Lỗi sẽ tự động được xử lý và hiển thị khi có API errors:

```csharp
try
{
    var friends = await FriendManager.Instance.GetFriendList(accountId);
}
catch (Exception ex)
{
    // ErrorHandler đã tự động xử lý và hiển thị popup
}
```

### 3. Hiển thị lỗi tùy chỉnh

```csharp
ErrorHandler.ShowCustomError(
    "Không thể thêm bạn bè. Danh sách đã đầy.", 
    ErrorHandler.ErrorType.BadRequest
);
```

## Requirements đã đáp ứng

✅ **Requirement 6.5**: Xử lý lỗi và hiển thị thông báo rõ ràng
- ErrorHandler xử lý tất cả HTTP status codes
- Thông báo lỗi thân thiện bằng tiếng Việt
- Logging chi tiết cho debugging

✅ **Requirement 4.2**: Thông báo rõ ràng cho người dùng
- ErrorPopupUI hiển thị popup với title và message rõ ràng
- Màu sắc và icon phân biệt các loại lỗi
- Auto-close để không làm phiền người dùng

## Testing

### Test các loại lỗi

```csharp
// Test BadRequest
ErrorHandler.ShowCustomError("Test bad request", ErrorHandler.ErrorType.BadRequest);

// Test Unauthorized
ErrorHandler.ShowCustomError("Test unauthorized", ErrorHandler.ErrorType.Unauthorized);

// Test NotFound
ErrorHandler.ShowCustomError("Test not found", ErrorHandler.ErrorType.NotFound);

// Test ServerError
ErrorHandler.ShowCustomError("Test server error", ErrorHandler.ErrorType.ServerError);

// Test NetworkError
ErrorHandler.ShowCustomError("Test network error", ErrorHandler.ErrorType.NetworkError);
```

### Test với API calls

```csharp
// Test với invalid endpoint (404)
await apiClient.GetAsync<InGameAccount>("/api/invalid-endpoint");

// Test với invalid token (401)
apiClient.SetAuthToken("invalid-token");
await apiClient.GetAsync<InGameAccount>("/api/accounts/123");
```

## Next Steps

1. **Tạo Error Popup Prefab**: Thiết lập UI trong Unity Editor theo hướng dẫn
2. **Test tất cả error types**: Đảm bảo mỗi loại lỗi hiển thị đúng
3. **Tùy chỉnh màu sắc**: Điều chỉnh màu sắc cho phù hợp với theme của game
4. **Thêm animations**: Thêm fade in/out animations cho popup (optional)
5. **Thêm sound effects**: Thêm âm thanh khi hiển thị lỗi (optional)

## Notes

- ErrorHandler sử dụng static event, nên có thể subscribe từ bất kỳ đâu
- ErrorPopupUI tự động subscribe/unsubscribe trong Awake/OnDestroy
- Tất cả lỗi đều được log vào Console để debugging
- Auto-close có thể tắt hoặc điều chỉnh thời gian trong Inspector
