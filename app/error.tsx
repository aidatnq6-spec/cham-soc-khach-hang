"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="center-screen">
      <section className="login-card">
        <h1>Không tải được ứng dụng</h1>
        <p>Vui lòng tải lại. Dữ liệu Firebase vẫn được giữ.</p>
        <button onClick={reset}>Thử lại</button>
      </section>
    </main>
  );
}
