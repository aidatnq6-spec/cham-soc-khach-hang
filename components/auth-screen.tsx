"use client";
import { useState } from "react";
import { Headphones, LockKeyhole } from "lucide-react";
import type { WorkspaceController } from "@/hooks/use-workspace";
export function AuthScreen({
  controller: c,
}: {
  controller: WorkspaceController;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="center-screen">
      <section className="login-card">
        <div className="brand">
          <span className="brand-icon">
            <Headphones aria-hidden="true" />
          </span>
          <div>
            <strong>CSKH Script</strong>
            <small>Kịch bản hỗ trợ khách hàng</small>
          </div>
        </div>
        <span className="eyebrow">
          <LockKeyhole size={14} aria-hidden="true" /> Không gian làm việc cá
          nhân
        </span>
        <h1>Đăng nhập</h1>
        <p>Tra cứu quy trình xử lý và chuẩn bị tin nhắn gửi khách hàng.</p>
        {!c.configured && (
          <p className="alert">
            Chưa cấu hình Firebase. Sao chép .env.example thành .env.local, điền
            cấu hình web rồi khởi động lại ứng dụng.
          </p>
        )}
        {c.fault && (
          <p className="alert" role="alert">
            {c.fault}
          </p>
        )}
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void c.login(email, password);
          }}
        >
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="primary"
            disabled={!c.configured || c.pending || !c.authReady}
          >
            {c.pending
              ? "Đang đăng nhập…"
              : !c.authReady
                ? "Đang kiểm tra phiên đăng nhập…"
                : "Đăng nhập"}
          </button>
        </form>
        <small className="muted">
          Chỉ tài khoản được cấp quyền mới có thể truy cập.
        </small>
      </section>
    </main>
  );
}
