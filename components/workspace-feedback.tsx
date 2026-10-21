"use client";
import {
  AlertCircle,
  CheckCircle2,
  CloudOff,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

export function SyncStatus({
  ready,
  pending,
  online,
  fault,
}: {
  ready: boolean;
  pending: boolean;
  online: boolean;
  fault: string;
}) {
  let tone = "loading";
  let label = "Đang tải kho kịch bản";
  let Icon = LoaderCircle;
  if (fault) {
    tone = "warning";
    label = ready ? "Thao tác chưa hoàn tất" : "Chưa tải được dữ liệu";
    Icon = AlertCircle;
  } else if (!online) {
    tone = "offline";
    label = ready
      ? "Offline · Đang xem bản lưu trên thiết bị"
      : "Offline · Đang kiểm tra bản lưu trên thiết bị";
    Icon = CloudOff;
  } else if (pending) {
    label = "Đang lưu thay đổi";
  } else if (ready) {
    tone = "success";
    label = "Đã đồng bộ";
    Icon = CheckCircle2;
  }
  return (
    <div className={`sync-status sync-${tone}`} role="status">
      <Icon
        size={15}
        aria-hidden="true"
        className={tone === "loading" ? "spin" : undefined}
      />
      <span>{label}</span>
    </div>
  );
}

export function WorkspaceError({
  fault,
  ready,
  pending,
  onRetry,
}: {
  fault: string;
  ready: boolean;
  pending: boolean;
  onRetry: () => void;
}) {
  const technical =
    /Failed to execute|FirebaseError|quota|permission-denied|auth\/|storage\/|^Error:/i.test(
      fault,
    );
  const permission = /permission-denied|không có quyền/i.test(fault);
  const message = permission
    ? "Kiểm tra tài khoản được cấp quyền hoặc cấu hình truy cập dữ liệu rồi thử lại."
    : technical
      ? "Chưa thực hiện được thao tác. Thử tải lại để kết nối và kiểm tra dữ liệu trên tài khoản."
      : fault;
  return (
    <section
      className="workspace-error"
      role="alert"
      aria-labelledby="workspace-error-title"
    >
      <AlertCircle size={22} aria-hidden="true" />
      <div className="error-copy">
        <h2 id="workspace-error-title">
          {ready ? "Thao tác chưa hoàn tất" : "Chưa tải được kho kịch bản"}
        </h2>
        <p>{message}</p>
        <details className="error-details">
          <summary>Chi tiết lỗi</summary>
          <pre>{fault}</pre>
        </details>
      </div>
      <button disabled={pending} onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" />
        Thử tải lại
      </button>
    </section>
  );
}

export function WorkspaceLoading({ failed }: { failed: boolean }) {
  if (failed)
    return (
      <main className="workspace-unavailable" id="main-content">
        <div className="unavailable-icon">
          <CloudOff size={28} aria-hidden="true" />
        </div>
        <h1>Kho kịch bản đang tạm gián đoạn</h1>
        <p>Dùng “Thử tải lại” ở thông báo phía trên để tiếp tục.</p>
      </main>
    );
  return (
    <main
      className="workspace-skeleton"
      id="main-content"
      aria-busy="true"
      aria-label="Đang tải kho kịch bản"
    >
      <span className="sr-only">Đang tải danh sách và nội dung kịch bản.</span>
      <div className="skeleton-tabs" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="skeleton-line" />
        ))}
      </div>
      <div className="skeleton-layout" aria-hidden="true">
        <div className="skeleton-list">
          {Array.from({ length: 5 }, (_, i) => (
            <div className="skeleton-item" key={i}>
              <span className="skeleton-line" />
              <span className="skeleton-line short" />
            </div>
          ))}
        </div>
        <div className="skeleton-detail">
          <span className="skeleton-line skeleton-title" />
          <span className="skeleton-line short" />
          <div className="skeleton-work">
            <div>
              {[0, 1, 2, 3].map((i) => (
                <span className="skeleton-line" key={i} />
              ))}
            </div>
            <div>
              {[0, 1, 2, 3].map((i) => (
                <span className="skeleton-line" key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
