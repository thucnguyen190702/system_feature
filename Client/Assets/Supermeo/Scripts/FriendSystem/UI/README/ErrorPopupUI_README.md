# Error Popup UI - Hướng dẫn Sử dụng

## Tổng quan

ErrorPopupUI là component UI hiển thị thông báo lỗi cho người dùng một cách thân thiện và trực quan. Component này tự động lắng nghe các sự kiện lỗi từ ErrorHandler và hiển thị popup với thông tin lỗi phù hợp.

## Thiết lập UI trong Unity Editor

### 1. Tạo Error Popup Prefab

1. Tạo một Canvas mới (nếu chưa có):
   - Right-click trong Hierarchy → UI → Canvas
   - Đặt tên: "ErrorPopupCanvas"
   - Set Canvas Scaler → UI Scale Mode → Scale With Screen Size
   - Reference Resolution: 1920x1080

2. Tạo Panel cho Popup:
   - Right-click trên Canvas → UI → Panel
   - Đặt tên: "ErrorPopupPanel"
   - Set Anchor: Center
   - Width: 600, Height: 300
   - Background Color: Semi-transparent black (0, 0, 0, 200)

3. Thêm Background cho nội dung:
   - Right-click trên ErrorPopupPanel → UI → Image
   - Đặt tên: "ContentBackground"
   - Anchor: Stretch (full)
   - Margins: 20 pixels mỗi bên
   - Background Color: White hoặc màu sáng

4. Thêm Icon:
   - Right-click trên ContentBackground → UI → Image
   - Đặt tên: "ErrorIcon"
   - Anchor: Top Center
   - Position Y: -40
   - Width: 60, Height: 60
   - Sprite: Chọn icon cảnh báo/lỗi

5. Thêm Title Text:
   - Right-click trên ContentBackground → UI → Text - TextMeshPro
   - Đặt tên: "ErrorTitleText"
   - Anchor: Top Center
   - Position Y: -110
   - Font Size: 28
   - Alignment: Center
   - Color: Dark color
   - Text: "Lỗi"

6. Thêm Message Text:
   - Right-click trên ContentBackground → UI → Text - TextMeshPro
   - Đặt tên: "ErrorMessageText"
   - Anchor: Middle Center
   - Width: 520, Height: 100
   - Font Size: 18
   - Alignment: Center, Middle
   - Color: Dark gray
   - Text: "Thông báo lỗi sẽ hiển thị ở đây"
   - Enable Word Wrapping

7. Thêm Close Button:
   - Right-click trên ContentBackground → UI → Button - TextMeshPro
   - Đặt tên: "CloseButton"
   - Anchor: Bottom Center
   - Position Y: 30
   - Width: 200, Height: 50
   - Button Text: "Đóng"
   - Font Size: 20

### 2. Gắn ErrorPopupUI Script

1. Select ErrorPopupPanel trong Hierarchy
2. Add Component → ErrorPopupUI
3. Gán các references:
   - **Popup Panel**: Kéo ErrorPopupPanel vào đây
   - **Error Message Text**: Kéo ErrorMessageText vào đây
   - **Error Title Text**: Kéo ErrorTitleText vào đây
   - **Close Button**: Kéo CloseButton vào đây
   - **Icon Image**: Kéo ErrorIcon vào đây

4. Cấu hình Settings:
   - **Auto Close Delay**: 5 (giây)
   - **Auto Close**: ✓ (checked)

5. Tùy chỉnh màu sắc cho từng loại lỗi (optional):
   - Bad Request Color: Orange (255, 153, 0)
   - Unauthorized Color: Red (255, 77, 77)
   - Not Found Color: Gray (128, 128, 128)
   - Server Error Color: Dark Red (204, 0, 0)
   - Network Error Color: Blue (77, 77, 255)
   - Timeout Color: Purple (153, 102, 204)
   - Unknown Color: Gray (128, 128, 128)

### 3. Tạo Prefab

1. Kéo ErrorPopupPanel từ Hierarchy vào thư mục Assets/Prefabs/UI
2. Đặt tên: "ErrorPopup"
3. Xóa ErrorPopupPanel khỏi Scene (nếu không cần)

## Sử dụng trong Code

### Tự động hiển thị lỗi

ErrorPopupUI tự động lắng nghe các sự kiện lỗi từ ErrorHandler. Bạn chỉ cần đảm bảo ErrorPopupUI đã được thêm vào Scene.

```csharp
// Lỗi sẽ tự động hiển thị khi có exception trong ApiClient
try
{
    var account = await AccountManager.Instance.GetAccount("account-id");
}
catch (Exception ex)
{
    // ErrorHandler đã xử lý và hiển thị popup tự động
}
```

### Hiển thị lỗi tùy chỉnh

```csharp
using FriendSystem.Core;

// Hiển thị lỗi tùy chỉnh
ErrorHandler.ShowCustomError("Không thể kết nối đến server", ErrorHandler.ErrorType.NetworkError);
```

### Đóng popup thủ công

```csharp
using FriendSystem.UI;

// Lấy reference đến ErrorPopupUI
ErrorPopupUI errorPopup = FindObjectOfType<ErrorPopupUI>();
errorPopup.ClosePopup();
```

### Tùy chỉnh auto-close

```csharp
using FriendSystem.UI;

ErrorPopupUI errorPopup = FindObjectOfType<ErrorPopupUI>();

// Tắt auto-close
errorPopup.SetAutoClose(false);

// Bật auto-close với delay 10 giây
errorPopup.SetAutoClose(true, 10f);
```

## Các loại lỗi được hỗ trợ

| Error Type | Mô tả | Màu mặc định |
|------------|-------|--------------|
| BadRequest | Yêu cầu không hợp lệ (400) | Orange |
| Unauthorized | Không có quyền truy cập (401, 403) | Red |
| NotFound | Không tìm thấy (404) | Gray |
| ServerError | Lỗi server (500+) | Dark Red |
| NetworkError | Lỗi kết nối mạng | Blue |
| Timeout | Hết thời gian chờ | Purple |
| Unknown | Lỗi không xác định | Gray |

## Thông báo lỗi mặc định

ErrorHandler cung cấp các thông báo lỗi thân thiện bằng tiếng Việt:

- **400**: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin."
- **401**: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
- **403**: "Bạn không có quyền thực hiện thao tác này."
- **404**: "Không tìm thấy thông tin yêu cầu."
- **409**: "Dữ liệu đã tồn tại hoặc xung đột."
- **429**: "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau."
- **500**: "Lỗi server. Vui lòng thử lại sau."
- **502/503**: "Server tạm thời không khả dụng. Vui lòng thử lại sau."
- **Network Error**: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet."

## Tích hợp với Scene

### Cách 1: Thêm vào Scene chính

1. Kéo ErrorPopup prefab vào Scene
2. Đảm bảo Canvas có DontDestroyOnLoad nếu cần giữ qua nhiều Scene

### Cách 2: Tạo Singleton Manager

```csharp
using UnityEngine;
using FriendSystem.UI;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance { get; private set; }
    
    [SerializeField] private ErrorPopupUI errorPopup;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
```

## Tùy chỉnh giao diện

### Thay đổi màu sắc

Bạn có thể thay đổi màu sắc cho từng loại lỗi trong Inspector:

1. Select ErrorPopupPanel
2. Tìm section "Error Type Colors"
3. Điều chỉnh màu sắc theo ý muốn

### Thay đổi animation

Thêm Animator component vào ErrorPopupPanel:

```csharp
// Trong ErrorPopupUI.cs, thêm:
[SerializeField] private Animator animator;

public void ShowError(string message, ErrorHandler.ErrorType errorType)
{
    // ... existing code ...
    
    if (animator != null)
    {
        animator.SetTrigger("Show");
    }
}
```

### Thêm âm thanh

```csharp
[SerializeField] private AudioSource audioSource;
[SerializeField] private AudioClip errorSound;

public void ShowError(string message, ErrorHandler.ErrorType errorType)
{
    // ... existing code ...
    
    if (audioSource != null && errorSound != null)
    {
        audioSource.PlayOneShot(errorSound);
    }
}
```

## Troubleshooting

### Popup không hiển thị

1. Kiểm tra ErrorPopupPanel có active trong Scene không
2. Kiểm tra Canvas Scaler settings
3. Kiểm tra tất cả references đã được gán đúng
4. Kiểm tra ErrorHandler.OnError có được subscribe không

### Popup hiển thị sai vị trí

1. Kiểm tra Anchor settings của Panel
2. Kiểm tra Canvas Render Mode (nên dùng Screen Space - Overlay)
3. Kiểm tra Canvas Scaler settings

### Text không hiển thị

1. Đảm bảo đã import TextMeshPro
2. Kiểm tra Font Asset đã được gán
3. Kiểm tra màu text không trùng với background

## Best Practices

1. **Luôn có ErrorPopup trong Scene**: Đảm bảo mỗi Scene có một ErrorPopupUI instance
2. **Sử dụng DontDestroyOnLoad**: Nếu muốn giữ popup qua nhiều Scene
3. **Tùy chỉnh thông báo**: Sử dụng ShowCustomError cho các lỗi đặc biệt
4. **Test các loại lỗi**: Test tất cả các error types để đảm bảo UI hiển thị đúng
5. **Accessibility**: Đảm bảo text đủ lớn và có contrast tốt

## Yêu cầu liên quan

- Requirements: 4.2 (Thông báo rõ ràng), 6.5 (Xử lý lỗi)
