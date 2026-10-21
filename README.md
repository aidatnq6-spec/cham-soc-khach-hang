# CSKH Script

Ứng dụng tra cứu kịch bản hỗ trợ khách hàng bằng **Next.js App Router + TypeScript + Firebase**. Giữ năm nhóm nghiệp vụ, checklist, ảnh minh họa, tin nhắn Zalo, AI gợi ý, nhập/xuất, sao lưu và thống kê.

## Chạy trên Windows

Khuyến nghị Node.js 24 LTS. Trong PowerShell tại thư mục dự án:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://localhost:4173**. Hoặc bấm `MO_PHAN_MEM.bat` / `START_APP.bat`. File `MO_TREN_DIEN_THOAI.bat` hiển thị địa chỉ IP trong cùng Wi-Fi. Firebase Authorized domains phải cho phép hostname truy cập. Clipboard và PWA thường cần HTTPS hoặc localhost; qua HTTP LAN, có thể copy văn bản thủ công trong ô tin nhắn.

`.env.local` đã được tạo từ cấu hình Firebase web cũ nếu trước đó chưa có file này. File này được gitignore. Khi cài ở máy khác:

```powershell
Copy-Item .env.example .env.local
```

Điền các `NEXT_PUBLIC_FIREBASE_*` từ Firebase Console và email được phép. Đây là cấu hình web công khai; không điền private key vào biến `NEXT_PUBLIC_*`. Khởi động lại Next.js sau khi sửa môi trường. Khi deploy, biến public cần có ở bước build.

## Cấu hình Firebase

- Giữ project `cskh-6fd41`, user Authentication và mật khẩu hiện tại. Ứng dụng không tạo user production.
- Bật Firebase Storage để tải ảnh mới. Kiểm tra điều kiện gói dịch vụ/billing của project trước khi bật; mã nguồn không tự tạo dịch vụ hay thay đổi billing.
- `firestore.rules` và `storage.rules` giới hạn đúng uid và email chủ sở hữu. Nếu đổi email, cập nhật cả rules và các biến môi trường client/server.
- Sau khi xem lại rules và sao lưu dữ liệu, người vận hành có thể triển khai:

```powershell
npx.cmd firebase deploy --only firestore:rules,storage --project cskh-6fd41
```

Lệnh trên **chưa được chạy trong quá trình viết lại**. `firebase.json` không còn hosting với public directory là root, tránh đưa nguồn, môi trường và tài liệu lên hosting tĩnh.

Firebase Storage dùng private reads theo tài khoản. Giao diện tải blob qua SDK có xác thực, không phát hành download URL công khai. Nếu trình duyệt báo lỗi CORS khi đọc/copy ảnh, cấu hình CORS của bucket cho đúng origin ứng dụng theo [hướng dẫn Firebase](https://firebase.google.com/docs/storage/web/download-files#cors_configuration). Chỉ cho origin cần dùng, không tự mở toàn bộ bucket.

## Dữ liệu cũ và chuyển đổi

Khi tài khoản hợp lệ đăng nhập bản mới, ứng dụng ưu tiên `users/{uid}/app/main.state`. Nếu chưa có cloud state, lấy `it-support-script-data-v1` trong trình duyệt; chỉ dùng đủ 13 kịch bản gốc khi chưa có cả hai. Danh sách rỗng được giữ nguyên.

Lược đồ mới:

```text
users/{uid}/app/main
  schemaVersion: 2
  activeGeneration: <generation-id>
  stateVersion: <integer>
  state: <legacy state, retained>

users/{uid}/app/main/generations/{generation-id}/issues/{issue-id}
users/{uid}/app/main/generations/{generation-id}/progress/{issue-id}
Storage: users/{uid}/issues/{issue-id}/{filename}
```

Migration dùng ID ổn định và lease 2 phút; có thể tiếp tục sau khi bị ngắt. Chỉ mở workspace sau khi chuyển đổi hoàn tất. Nếu thiết bị khác đang chuyển đổi, chờ lease hết và bấm thử lại. Không xóa state cũ. Mỗi bản ghi có revision, nên sửa từ phiên bản cũ sẽ báo xung đột.

Nhập/khôi phục ghi vào generation mới, rồi chuyển con trỏ sau khi tất cả bản ghi thành công. Nếu có thay đổi đồng thời, lần thay thế bị hủy; dữ liệu đang sử dụng vẫn nguyên vẹn. Generation cũ và ảnh đã tải được giữ để phục hồi. Việc dọn dữ liệu không còn dùng là công việc quản trị riêng, chưa tự động thực hiện.

Chấp nhận JSON dạng mảng cũ và toàn bộ backup có `issues`, `progress` hoặc `checklistState`/`viewCounts`. File tối đa 50 MB, 2.000 kịch bản, 30 ảnh/kịch bản; ảnh nhúng tối đa 2 MB/ảnh theo schema. File lỗi hoặc trùng ID bị từ chối trước khi thay thế. Ảnh base64 từ backup được đưa vào Storage khi khôi phục để không vượt giới hạn document Firestore. Nếu Storage chưa sẵn sàng, dữ liệu đang dùng không bị thay thế.

Bản sao lưu và dữ liệu offline được lưu trong IndexedDB, tách theo uid, giữ tối đa 12 phiên bản và có ảnh nhúng khi tạo mới. Backup v1/v2 trong localStorage được chuyển một lần sang IndexedDB; giữ nguyên bản nguồn cũ. Có bản tự động mỗi 24 giờ khi ứng dụng hoạt động. Nếu lưu trữ trên thiết bị bị chặn hoặc đầy, dữ liệu Firebase vẫn được tải để tra cứu; thao tác sửa/thay thế vẫn yêu cầu tạo được backup trước. Xuất file JSON để giữ bản sao độc lập.

`legacy/` giữ nguồn gốc và cách deploy bản cũ, hoàn toàn nằm ngoài `public/`. Không mở song song bản cũ và mới để chỉnh dữ liệu: state cũ không tiếp tục đồng bộ từ schema mới. Để quay về bản cũ sau khi đã chỉnh ở bản mới, xuất JSON rồi nhập các kịch bản vào bản cũ; bản cũ không giữ đầy đủ progress từ schema mới.

## AI phía máy chủ

Điền các biến chỉ ở server:

```dotenv
ALLOWED_EMAIL=phongdepdanang@gmail.com
OPENROUTER_API_KEY=<your-key>
OPENROUTER_MODEL=openai/gpt-4o-mini
FIREBASE_ADMIN_PROJECT_ID=cskh-6fd41
FIREBASE_ADMIN_CLIENT_EMAIL=<service-account-email>
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Có thể dùng Application Default Credentials thay service-account key nếu môi trường hosting hỗ trợ. Không commit `.env.local` hoặc service-account JSON. Endpoint `/api/diagnose` xác thực Firebase ID token và email, sau đó mới đọc catalogue thuộc uid và gọi OpenRouter. Catalogue gửi cho AI gồm mô tả, bước xử lý, điều kiện leo thang và ghi chú nội bộ; không gửi ảnh hay API key trình duyệt cũ. Đây là hành vi được mô tả để người vận hành chọn nội dung phù hợp cho kho nội bộ.

Giới hạn mô tả 3.000 ký tự, body 16 KB, catalogue 200.000 ký tự, 10 lần/phút/uid, một lời gọi đang chạy/uid và timeout provider 25 giây. Rate limit này nằm trong một tiến trình; cần kho giới hạn dùng chung khi triển khai nhiều instance. Thiếu cấu hình/AI lỗi/offline sẽ chuyển sang gợi ý nội bộ. Nút Cấu hình AI có thể xóa API key cũ trong localStorage; không tự chuyển key cũ lên server.

## Production và PWA

```powershell
npm.cmd run build
npm.cmd start
```

Next.js cần **hosting chạy Node.js/Next.js server** cho API AI; không dùng `output: export` với API động. Có thể chọn nhà cung cấp sau; repository chưa được deploy. Tham khảo [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying).

Service worker mới thay cache v1, cache shell và tài nguyên tĩnh, bỏ qua API/RSC/auth. Đã đăng nhập và tải thành công trên thiết bị thì có bản dữ liệu để tra cứu offline; không cho ghi khi offline. Đăng xuất xóa bản cache dữ liệu hiện tại của uid và dữ liệu local v1; các backup thủ công vẫn nằm trên thiết bị theo uid. Thiết bị dùng chung nên tải backup về nơi riêng và xóa các backup trình duyệt không muốn lưu.

PWA được kích hoạt khi HTTPS hoặc localhost. Các công cụ tải theo nhu cầu chỉ dùng offline được nếu bundle tương ứng đã được tải; lần đăng nhập đầu và AI máy chủ cần mạng. Khi cập nhật cùng domain, service worker mới chỉ có hiệu lực sau lần tải online tiếp theo; nếu vẫn thấy bản cũ, đóng mọi tab rồi mở lại hoặc xóa site cache trong trình duyệt.

## Kiểm thử

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Kiểm thử Firebase dùng Java 21+ và **project giả `demo-cskh`**:

```powershell
npm.cmd run test:rules
```

Lệnh tự chạy Auth/Firestore/Storage Emulator, kiểm thử migration, CRUD, xung đột, restore rỗng và rules, rồi dừng. Không dùng production để thử. Nếu Java mặc định là Java 8, trỏ `JAVA_HOME`/`PATH` sang Java 21 trong phiên PowerShell. Bản Java portable dùng trong lần kiểm chứng này nằm trong `artifacts/tools/java21/`, được gitignore.

Chạy giao diện với emulator: dùng một `.env.local` riêng có project `demo-cskh`, các giá trị demo trong `.env.example`, `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, khởi động `npx.cmd firebase emulators:start --project demo-cskh`, rồi chạy Next.js ở terminal khác. Tạo tài khoản thử với email chủ sở hữu tại Emulator UI, không tạo user production. Nếu thử AI route với emulator, đặt `FIREBASE_AUTH_EMULATOR_HOST` và `FIRESTORE_EMULATOR_HOST` chỉ trên tiến trình server demo.

Kết quả và giới hạn xác minh: [docs/verification.md](docs/verification.md).
