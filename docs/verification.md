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
- Sao lưu ảnh nhúng và cache offline hiện dùng IndexedDB (bản sửa lỗi quota ngày 21/10/2026). Khi thiết bị hết dung lượng hoặc chặn lưu trữ, thao tác sửa/thay thế vẫn dừng nếu không tạo được backup trước; dữ liệu Firebase vẫn được tải để tra cứu.

Nguồn cũ ban đầu được giữ trong `legacy/`, sau đó đã được gỡ theo yêu cầu dọn mã nguồn; có thể tra cứu trong lịch sử Git. Dữ liệu Firestore v1 được giữ trong main.state sau chuyển đổi; không xóa tự động. Generation và ảnh cũ cũng chưa tự dọn để bảo toàn khả năng khôi phục.

## Dọn mã nguồn cũ

Ngày 21/10/2026: gỡ 13 file trong `legacy/` (ứng dụng tĩnh, CSS, service worker, cấu hình và launcher cũ), icon trùng ở `icons/` và hàm `issueCollectionPath` không còn nơi gọi. Icon đang phục vụ ứng dụng vẫn nằm tại `public/icons/`. Bỏ cấu hình loại trừ `legacy` không còn cần thiết; cập nhật hướng dẫn hiện hành. Các tài liệu thiết kế/kế hoạch giữ nội dung lịch sử của đợt chuyển đổi.

Giữ file xuất dữ liệu `it-support-scripts.json`, seed của Next.js, bộ đọc dữ liệu v1, migration, backup và toàn bộ cấu hình Firebase đang dùng. Không xóa dữ liệu cloud hoặc biến môi trường. Sau khi dọn: 41 kiểm thử đạt, 10 kiểm thử Emulator được bỏ qua trong lệnh test thường; lint, TypeScript và build production đều đạt.

## Sửa lỗi quota bộ nhớ trình duyệt

Đã tái hiện nguyên nhân: `migrateLocalBackups()` ghi bản sao lưu lớn vào localStorage trước khi subscribe Firestore, nên QuotaExceededError khiến workspace không sẵn sàng. Chuyển backup/cache sang IndexedDB, cập nhật các thao tác sao lưu/xóa/đọc thành bất đồng bộ và tách migration backup khỏi luồng tải cloud. Giữ nguyên backup nguồn trong localStorage; dấu chuyển đổi trong IndexedDB ngăn các bản đã xóa xuất hiện lại. Thay đổi backup đồng thời được thực hiện trong transaction.

30 kiểm thử unit/API/React đạt sau bản sửa (10 kiểm thử Emulator được skip trong lệnh test thường). Sáu kiểm thử mới bao gồm migration với localStorage đã đầy, backup nhiều ảnh, hợp nhất v1/v2 và migration một lần, backup đồng thời, cache trên 6 MB, rollback khi lỗi lưu và tải cloud thành công dù migration/cache bị lỗi. TypeScript và lint đạt. Không sửa dữ liệu production để kiểm thử.

## Cải thiện giao diện workspace

Ngày 21/10/2026: gom công cụ dữ liệu và đăng xuất vào disclosure có nhãn; đưa tìm kiếm lên header với Ctrl/Cmd+K và xóa từ khóa. Tìm kiếm toàn màn hình trên điện thoại vẫn có ô nhập riêng. Vùng quy trình hiển thị tiến độ và bước tiếp theo; vùng tin Zalo dùng chữ thường dễ đọc, có nút copy chính và tùy chỉnh. Xóa kịch bản nằm trong menu thao tác. Trạng thái tải/lỗi/offline/thành công được phân biệt; skeleton chờ dữ liệu, lỗi có tóm tắt, nút tải lại và chi tiết thu gọn.

37 kiểm thử đạt, gồm 7 kiểm thử UI mới về tìm xuyên nhóm, shortcut không chiếm focus của dialog, menu đóng bằng Escape/bấm ngoài, trạng thái không báo thành công khi tải/lỗi, retry, tiến độ, copy/compose/delete. TypeScript, lint và build production đều đạt; service-worker cache là v2-3. Không thay controller, schema, quyền Firebase hoặc dữ liệu cloud. Công cụ vẫn không có trình duyệt khả dụng, nên chưa xác minh trực quan trên màn hình desktop/điện thoại thật.
