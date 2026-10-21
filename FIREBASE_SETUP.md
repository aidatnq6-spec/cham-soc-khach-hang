# Firebase setup cho bản Next.js

Xem README.md để biết cấu hình và chuyển đổi đầy đủ.

1. Giữ project Firebase và tài khoản Authentication hiện tại.
2. Điền cấu hình web trong .env.local theo .env.example.
3. Bật Storage và xem lại firestore.rules/storage.rules. Chỉ deploy rules khi đã sao lưu và sẵn sàng chuyển đổi.
4. Chạy npm.cmd ci rồi npm.cmd run dev; mở http://localhost:4173.
5. AI tùy chọn: cấu hình OpenRouter và Firebase Admin ở server theo README.md.
6. Production cần hosting hỗ trợ Next.js server. Không chạy firebase init hosting với public directory là thư mục gốc dự án.

Mã nguồn bản cũ đã được gỡ khỏi thư mục làm việc; có thể tra cứu trong lịch sử Git. Deploy bản Next.js theo README.md.
