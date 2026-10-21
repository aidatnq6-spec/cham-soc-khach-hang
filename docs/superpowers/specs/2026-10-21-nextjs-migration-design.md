# Thiết kế chuyển ứng dụng CSKH sang Next.js

Ngày: 21/10/2026. Trạng thái: người dùng đã duyệt; triển khai cục bộ hoàn tất. Kết quả và giới hạn xác minh ở ../../verification.md.

## Mục tiêu và phạm vi

Người dùng yêu cầu viết lại ứng dụng hiện tại bằng Next.js + TypeScript + Firebase. Giữ tiếng Việt, năm nhóm nghiệp vụ, dữ liệu và các thao tác hiện có. Tách giao diện, logic nghiệp vụ và lớp truy cập Firebase để dễ bảo trì.

Các lựa chọn bên dưới là đề xuất của người triển khai, chưa phải yêu cầu đã được người dùng xác nhận. Chưa thêm CRM, nhiều nhân viên, phân quyền nhóm, thanh toán hoặc nghiệp vụ mới.

## Chức năng phải giữ

- Đăng nhập email/mật khẩu Firebase; giới hạn email chủ sở hữu như bản hiện tại; đăng xuất và thông báo lỗi rõ ràng.
- Danh mục, thêm/sửa/xóa kịch bản; tìm không dấu xuyên nhóm; lọc nhãn, remote, khẩn cấp, ghi chú, thiếu script và thiếu ảnh.
- Checklist có thể đặt lại; ghi chú nội bộ; điều kiện leo thang; thống kê theo nhóm, nhãn và lượt mở.
- Tin nhắn Zalo hỗ trợ {{ten_khach}}, {{mst}}, {{phan_mem}}; copy script, tin hoàn chỉnh và từng ảnh. Nội dung người dùng sửa trong ô tin hoàn chỉnh phải được copy nguyên trạng.
- Nhiều ảnh, chọn file/kéo thả/dán; nén ảnh, xem và xóa từng ảnh. Sửa văn bản không làm mất các ảnh còn lại.
- Nhập/xuất JSON; nhận cả mảng kịch bản cũ và bản sao lưu toàn bộ trạng thái; kiểm tra cấu trúc trước khi ghi.
- Tối đa 12 bản sao lưu trên trình duyệt; sao lưu trước thao tác thay thế/xóa và tự động theo ngày khi dùng app. Có tải và khôi phục.
- AI chọn kịch bản có sẵn qua OpenRouter; không cấu hình hoặc lỗi kết nối thì dùng so khớp từ khóa.
- Giao diện máy tính và điện thoại, tìm kiếm toàn màn hình, điều hướng dưới, manifest và hỗ trợ cài ứng dụng.

## Kiến trúc đề xuất

Next.js App Router + TypeScript strict. Server layout/page bao quanh các Client Components cho workspace, đăng nhập và modal. CSS responsive tái sử dụng phong cách hiện tại; semantic HTML, focus bàn phím, nút cảm ứng tối thiểu 44px, trạng thái đang lưu/lỗi/thành công. Đây là chuyển nền tảng, không thiết kế lại thương hiệu.

Tổ chức mã theo app/, components/, hooks/, lib/firebase/, lib/domain/, types/ và public/. Firebase Web SDK dạng modular chỉ khởi tạo một lần ở client. Cấu hình Firebase web qua biến môi trường NEXT_PUBLIC_*; khóa AI và thông tin Firebase Admin chỉ ở server. Không đưa tài liệu, script chạy máy hoặc bản sao lưu mã cũ vào public/.

## Dữ liệu và tương thích

Giữ Firebase project cskh-6fd41 và chủ sở hữu hiện tại. Lược đồ mới nằm dưới users/{uid}/app/main: subcollection issues chứa mỗi kịch bản một document, progress chứa checklist/lượt mở theo kịch bản; metadata ở main lưu schemaVersion và trạng thái chuyển đổi. Tab và lựa chọn hiện tại lưu cục bộ theo uid. Lưu từng bản ghi, theo dõi bằng snapshot; xử lý lỗi và không báo đã đồng bộ trước khi ghi thành công. Nếu sửa đồng thời cùng một kịch bản, phát hiện revision cũ và yêu cầu tải bản mới thay vì âm thầm ghi đè.

Khi chưa có schema mới, đọc state trong document main của bản cũ; chỉ dùng localStorage cũ nếu cloud chưa có dữ liệu. Giữ nguyên ID, checklist, lượt mở, notes, nhãn, ảnh và nhóm. Chỉ dùng 13 seed trong app.js nếu hoàn toàn chưa có dữ liệu, không lấy file JSON 12 mục làm nguồn ưu tiên.

Chuyển đổi có thể chạy lại theo ID ổn định; đánh dấu hoàn tất sau khi tất cả bản ghi được xác nhận. Giữ state cũ nguyên vẹn để phục hồi; không xóa document cũ. Không cho CRUD schema mới trước khi migration hoàn tất. Sao lưu JSON có schemaVersion; khi import/restore, xác thực toàn bộ trước, tạo backup rồi thay thế tập dữ liệu, kể cả trường hợp danh sách rỗng.

Ảnh mới lưu Firebase Storage theo users/{uid}/issues/{issueId}/...; Firestore giữ đường dẫn và metadata. Ảnh base64 cũ tiếp tục hiển thị, chỉ chuyển lên Storage khi thực hiện chuyển đổi ảnh thành công; lỗi Storage không làm mất ảnh cũ. Storage cần được bật và có rules trước khi upload mới. Bản backup xuất dữ liệu ảnh nhúng để phục hồi độc lập; không xóa vật lý ảnh Storage khi xóa khỏi kịch bản trong phiên bản đầu nhằm giữ khả năng phục hồi backup.

Rules Firestore/Storage giới hạn đúng uid và email chủ sở hữu; ràng buộc kiểu/dung lượng ảnh. Không triển khai rules lên project thật trong bước viết lại cục bộ.

## AI và xác thực máy chủ

POST /api/diagnose nhận Firebase ID token; Firebase Admin xác thực token, email và quyền trước khi gọi OpenRouter. Server đọc danh sách kịch bản thuộc uid từ Firestore; giới hạn kích thước input, timeout, số lời gọi đồng thời và tần suất theo uid trong một tiến trình. Tài liệu nêu rõ giới hạn này không thay thế bộ giới hạn phân tán khi mở rộng nhiều máy chủ.

OPENROUTER_API_KEY và model nằm trong môi trường server. Giữ khả năng chọn model qua cấu hình server; bỏ giao diện lưu API key vào localStorage. Không tự gửi API key cũ lên server; hướng dẫn cấu hình lại và có thao tác xóa key cũ. Chưa cấu hình server hoặc AI lỗi thì chức năng gợi ý nội bộ vẫn hoạt động. Không coi Firebase web config là thông tin Firebase Admin.

## Chạy, hosting và PWA

Chạy local bằng npm.cmd install và npm.cmd run dev, cổng 4173 để gần cách dùng cũ. Cập nhật các file .bat và hướng dẫn. Chuẩn bị build production Node.js bằng next build/next start; cần hosting hỗ trợ Next.js server để chạy API. Chưa chọn nhà cung cấp, tạo dịch vụ có phí hoặc deploy thật. Firebase Hosting tĩnh hiện tại không chạy được API Node.js mới; giữ cấu hình legacy tách biệt để tránh deploy nhầm root dự án.

PWA dùng manifest, icon và service worker mới. Network-first cho điều hướng, chỉ cache tài nguyên tĩnh an toàn; không cache token, API AI hoặc response xác thực. Đăng xuất xóa dữ liệu nhạy cảm trong bộ nhớ và cache ứng dụng theo uid. Chỉ cho tra cứu offline sau một lần đăng nhập và tải dữ liệu thành công trên thiết bị; hiển thị trạng thái offline và chặn ghi nếu chưa đảm bảo đồng bộ. Không hứa đăng nhập lần đầu hoặc gọi AI khi offline. Khi chuyển cùng domain, gỡ cache service worker v1 để tránh tải app cũ.

## Bảo toàn nguồn và kiểm chứng

Giữ bản nguồn hiện tại trong legacy/ hoặc bản lưu ngoài public, không xóa dữ liệu cloud. Không tạo tài khoản hoặc thay đổi Firebase trực tiếp trong quá trình phát triển. Repo hiện chưa có commit; chỉ tạo commit tài liệu nếu được phép ghi .git, nếu không vẫn giữ tài liệu trong working tree.

Kiểm tra typecheck, lint, production build; kiểm thử nghiệp vụ nhập/xuất, template, tìm kiếm và migration có thể chạy lại; kiểm thử rules và dữ liệu qua Firebase Emulator khi công cụ khả dụng. Kiểm tra trình duyệt desktop/mobile: đăng nhập, CRUD, ảnh, checklist, copy, sao lưu, khôi phục và AI fallback. Dùng emulator/tài khoản kiểm thử, không ghi thử vào dữ liệu production. Bất cứ kiểm tra nào thiếu credentials hoặc runtime phải báo rõ, không coi build thành công là đã kiểm thử cloud.

## Tài liệu tham chiếu

- https://nextjs.org/docs/app/getting-started/deploying
- https://nextjs.org/docs/app/guides/backend-for-frontend
- https://firebase.google.com/docs/web/modular-upgrade
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/storage/web/upload-files
