# Kết quả kiểm chứng bản Next.js

Ngày 21/10/2026. Môi trường: Windows, Node.js 25.9.0; dùng Java 21 portable cho Emulator. Khuyến nghị Node.js 24 LTS khi vận hành vì một dependency của Firebase CLI chưa khai báo hỗ trợ Node 25.

## Đã đạt

| Kiểm tra | Kết quả |
|---|---|
| `npm.cmd test` | 24/24 kiểm thử nghiệp vụ, API giả lập và tương tác React đạt; 10 kiểm thử Emulator được bỏ qua đúng thiết kế khi không có emulator |
| Firebase Emulator `demo-cskh` | 10/10 kiểm thử tích hợp đạt trong lần chạy riêng có API Next.js tại cổng 4180 |
| `npm.cmd run typecheck` | Đạt |
| `npm.cmd run lint` | Đạt, không lỗi/cảnh báo |
| `npm.cmd run build` | Đạt, Next.js 16.4.2; trang `/` và API động `/api/diagnose` |
| HTTP local | `/` trả 200 và có form đăng nhập, manifest trả 200; POST AI không token trả 401 |
| Firebase ID token → API Next.js thực | Token Emulator của chủ sở hữu được xác thực; trả 503 do chủ động không cấu hình nhà cung cấp AI trong tiến trình kiểm thử |
| Bí mật server trong client bundle | Build với chuỗi kiểm tra giả ở OPENROUTER_API_KEY; không tìm thấy chuỗi đó trong `.next/static` |
| Dependency production | `npm audit --omit=dev`: 0 lỗ hổng được báo sau khi pin override gRPC 1.14.6 |

## Các tình huống đã kiểm thử

- Giữ đủ 13 kịch bản gốc, gồm MISA; ID seed ổn định.
- Ưu tiên cloud trước local, không thay danh sách rỗng bằng seed; giữ checklist, lượt mở, nhãn, notes và ảnh cũ.
- Chuyển đổi một lần, chạy lại không nhân đôi; tiếp tục migration gián đoạn và từ chối migration thứ hai khi lease còn hiệu lực.
- Lưu/xóa từng kịch bản và progress trên Firestore thật trong Emulator; từ chối revision cũ.
- Snapshot xuất đủ dữ liệu; thay thế bằng tập rỗng vẫn giữ generation cũ; batch staging bị rules từ chối không đổi dataset đang dùng.
- Người khác và anonymous không đọc/ghi được dữ liệu chủ sở hữu; ảnh chủ sở hữu tải được, MIME không hợp lệ bị Storage từ chối.
- JSON mảng cũ và backup mới, ID trùng, nhóm không hợp lệ, ảnh không an toàn, backup tối đa 12 phiên bản theo uid.
- Tìm không dấu, lọc kết hợp, biến mẫu Zalo; copy nguyên văn nội dung người dùng sửa.
- Sửa văn bản giữ nguyên hai ảnh; bỏ một ảnh chỉ xóa ảnh được chọn trong bản nháp.
- API AI: thiếu/sai token, sai email, thiếu cấu hình, input sai/quá lớn, ID bịa từ provider, lỗi provider và giới hạn tần suất. Không gọi API AI có phí.

Log kiểm thử Emulator nằm trong `artifacts/emulator-test.log`, audit production trong `artifacts/production-audit.json`; thư mục artifacts được gitignore. Các dependency công cụ phát triển/Firebase CLI còn 12 cảnh báo audit (7 high, 5 moderate) trong lần cài cuối; không thực hiện downgrade lớn hoặc `audit fix --force`. Chúng không nằm trong audit production ở trên.

## Chưa xác minh và cấu hình còn cần

- Phiên công cụ không cung cấp trình duyệt khả dụng (`listBrowsers` trả danh sách rỗng), nên chưa kiểm tra trực quan trên desktop/điện thoại. Kiểm thử React chạy trong jsdom; không thay thế kiểm thử trình duyệt thật.
- Chưa kiểm tra clipboard ảnh, kéo thả/dán ảnh thật, CORS bucket trên origin production, cài PWA và tải lại offline bằng trình duyệt thật.
- Chưa đăng nhập hay ghi dữ liệu production để thử. Chưa deploy hosting hoặc Firestore/Storage rules.
- Cấu hình web `.env.local` được giữ từ bản cũ. Người vận hành cần bật/cấu hình Storage, kiểm tra rules, domain và CORS trước khi dùng upload mới trên production.
- AI máy chủ cần Firebase Admin credentials/ADC và OpenRouter API key. Chưa thử nhà cung cấp AI thật; gợi ý nội bộ hoạt động độc lập.
- Sao lưu ảnh nhúng và cache offline dùng localStorage; dữ liệu nhiều ảnh có thể hết quota. Thao tác sửa/thay thế sẽ dừng nếu không tạo được backup trước; cần tải bản xuất ra máy và dọn backup trình duyệt. Đây là giới hạn cần cân nhắc chuyển sang IndexedDB khi kho ảnh lớn.

Nguồn cũ giữ trong `legacy/`. Dữ liệu Firestore v1 được giữ trong main.state sau chuyển đổi; không xóa tự động. Generation và ảnh cũ cũng chưa tự dọn để bảo toàn khả năng khôi phục.
