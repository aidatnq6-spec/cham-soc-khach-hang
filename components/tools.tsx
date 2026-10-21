"use client";
import { useState } from "react";
import { Modal } from "./modal";
import { composeMessage } from "@/lib/domain/templates";
import { suggestLocally } from "@/lib/domain/search";
import {
  addBackup,
  backupKey,
  downloadJson,
  readBackups,
} from "@/lib/domain/backups";
import { errorMessage, parseDataset } from "@/lib/domain/schema";
import { portableDataset } from "@/lib/firebase/images";
import { categories, priorities } from "@/lib/domain/catalog";
import type { WorkspaceController } from "@/hooks/use-workspace";
import type { Issue, Suggestion } from "@/types";

export function ZaloModal({
  issue,
  onClose,
  notify,
}: {
  issue: Issue;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const [values, setValues] = useState({
    ten_khach: "",
    mst: "",
    phan_mem: "",
  });
  const [message, setMessage] = useState(issue.script);
  const [error, setError] = useState("");
  function update(key: keyof typeof values, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    setMessage(composeMessage(issue.script, next));
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      notify("Đã copy tin nhắn Zalo.");
    } catch {
      setError(
        "Không copy được. Hãy chọn nội dung và copy thủ công hoặc dùng HTTPS.",
      );
    }
  }
  return (
    <Modal title="Tạo tin nhắn Zalo" onClose={onClose}>
      <div className="form-stack">
        <div className="form-grid">
          <label>
            Tên khách hàng
            <input
              value={values.ten_khach}
              onChange={(e) => update("ten_khach", e.target.value)}
            />
          </label>
          <label>
            Mã số thuế
            <input
              value={values.mst}
              onChange={(e) => update("mst", e.target.value)}
            />
          </label>
        </div>
        <label>
          Phần mềm / hệ thống
          <input
            value={values.phan_mem}
            onChange={(e) => update("phan_mem", e.target.value)}
          />
        </label>
        <p className="muted">
          Các biến trong script được thay bằng thông tin đã nhập. Bạn có thể sửa
          trực tiếp tin nhắn trước khi copy.
        </p>
        <label>
          Tin nhắn hoàn chỉnh
          <textarea
            rows={12}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={!message.trim()} onClick={copy}>
          Copy tin nhắn
        </button>
      </div>
    </Modal>
  );
}

export function AiModal({
  controller: c,
  onOpen,
  onClose,
}: {
  controller: WorkspaceController;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [status, setStatus] = useState("");
  async function diagnose() {
    setBusy(true);
    setStatus("");
    setSuggestion(null);
    try {
      if (!c.online) throw new Error("Đang offline.");
      const token = await c.user!.getIdToken();
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!response.ok) throw new Error("AI máy chủ chưa sẵn sàng.");
      const result = (await response.json()) as Suggestion;
      if (result.issueId && !c.data.issues.some((i) => i.id === result.issueId))
        throw new Error("Kịch bản không còn tồn tại.");
      setSuggestion(result);
      setStatus("Đã đối chiếu bằng AI.");
    } catch {
      setSuggestion(suggestLocally(c.data.issues, text));
      setStatus(
        "Đang dùng gợi ý nội bộ vì AI máy chủ chưa sẵn sàng hoặc thiết bị đang offline.",
      );
    } finally {
      setBusy(false);
    }
  }
  const issue = c.data.issues.find((i) => i.id === suggestion?.issueId);
  return (
    <Modal title="AI chẩn đoán lỗi" onClose={onClose} busy={busy}>
      <div className="form-stack">
        <p className="muted">
          Gợi ý kịch bản từ kho hiện có. Khi AI chưa được cấu hình, ứng dụng
          dùng đối chiếu từ khóa.
        </p>
        <label>
          Mô tả khách gửi
          <textarea
            rows={7}
            maxLength={3000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button
          className="primary"
          disabled={busy || !text.trim()}
          onClick={diagnose}
        >
          {busy ? "Đang đối chiếu…" : "Chẩn đoán"}
        </button>
        {status && (
          <p className="muted" role="status">
            {status}
          </p>
        )}
        {suggestion && (
          <section className="suggestion">
            <span className="eyebrow">{suggestion.source}</span>
            <h3>{issue?.name ?? "Chưa có kịch bản phù hợp"}</h3>
            <p>{suggestion.reason}</p>
            {suggestion.firstStep && (
              <p>
                <strong>Bước đầu: </strong>
                {suggestion.firstStep}
              </p>
            )}
            {issue && (
              <button
                onClick={() => {
                  onOpen(issue.id);
                  onClose();
                }}
              >
                Mở kịch bản
              </button>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}

export function BackupModal({
  controller: c,
  onClose,
}: {
  controller: WorkspaceController;
  onClose: () => void;
}) {
  const [backups, setBackups] = useState(() => readBackups(c.user!.uid));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create() {
    setBusy(true);
    setError("");
    try {
      addBackup(c.user!.uid, await portableDataset(c.data), "Sao lưu thủ công");
      setBackups(readBackups(c.user!.uid));
      c.setNotice("Đã tạo bản sao lưu.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Sao lưu / Khôi phục"
      onClose={onClose}
      busy={busy || c.pending}
    >
      <div className="form-stack">
        <p className="muted">
          Giữ tối đa 12 phiên bản trên trình duyệt này, theo từng tài khoản. Tải
          file về máy để giữ bản sao lâu dài.
        </p>
        <button
          className="primary"
          onClick={create}
          disabled={busy || c.pending}
        >
          {busy ? "Đang chuẩn bị ảnh…" : "Tạo bản sao lưu ngay"}
        </button>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {!backups.length && <p>Chưa có bản sao lưu.</p>}
        {backups.map((backup) => (
          <article className="backup-item" key={backup.id}>
            <div>
              <strong>{backup.reason}</strong>
              <small>
                {new Intl.DateTimeFormat("vi-VN", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(backup.createdAt))}{" "}
                · {backup.issues.length} kịch bản
              </small>
            </div>
            <div className="row">
              <button
                disabled={busy || c.pending}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    downloadJson(
                      { ...backup, ...(await portableDataset(backup)) },
                      `cskh-backup-${backup.createdAt.slice(0, 10)}.json`,
                    );
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Tải
              </button>
              <button
                disabled={!c.online || busy || c.pending}
                onClick={async () => {
                  if (
                    !confirm(
                      `Khôi phục ${backup.issues.length} kịch bản? Dữ liệu hiện tại sẽ được sao lưu trước.`,
                    )
                  )
                    return;
                  if (await c.replace(parseDataset(backup))) onClose();
                }}
              >
                Khôi phục
              </button>
              <button
                className="danger"
                disabled={busy || c.pending}
                onClick={() => {
                  if (!confirm("Xóa bản sao lưu này trên trình duyệt?")) return;
                  try {
                    const remaining = backups.filter((b) => b.id !== backup.id);
                    localStorage.setItem(
                      backupKey(c.user!.uid),
                      JSON.stringify(remaining),
                    );
                    setBackups(remaining);
                  } catch (e) {
                    setError(errorMessage(e));
                  }
                }}
              >
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
    </Modal>
  );
}

export function StatsModal({
  controller: c,
  onOpen,
  onClose,
}: {
  controller: WorkspaceController;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const issues = c.data.issues;
  const top = [...issues]
    .sort(
      (a, b) =>
        (c.data.progress[b.id]?.views ?? 0) -
        (c.data.progress[a.id]?.views ?? 0),
    )
    .slice(0, 5);
  return (
    <Modal title="Thống kê kịch bản" onClose={onClose}>
      <div className="form-stack">
        <div className="stats-grid">
          <div className="stat-card">
            <strong>{issues.length}</strong>
            <span>Tổng kịch bản</span>
          </div>
          {priorities
            .filter((p) => p.id !== "common")
            .map((p) => (
              <div className="stat-card" key={p.id}>
                <strong>
                  {issues.filter((i) => i.priorityLabels.includes(p.id)).length}
                </strong>
                <span>{p.name}</span>
              </div>
            ))}
        </div>
        <h3>Số kịch bản theo nhóm</h3>
        {categories.map((category) => {
          const count = issues.filter(
            (i) => i.categoryId === category.id,
          ).length;
          return (
            <div className="stat-row" key={category.id}>
              <span>{category.name}</span>
              <strong>{count}</strong>
              <meter
                min={0}
                max={Math.max(1, issues.length)}
                value={count}
                aria-label={`Số kịch bản ${category.name}`}
              >
                {count}
              </meter>
            </div>
          );
        })}
        <h3>Kịch bản được mở nhiều nhất</h3>
        {top
          .filter((i) => (c.data.progress[i.id]?.views ?? 0) > 0)
          .map((issue) => (
            <button
              className="stat-row"
              key={issue.id}
              onClick={() => {
                onOpen(issue.id);
                onClose();
              }}
            >
              <span>{issue.name}</span>
              <strong>{c.data.progress[issue.id]?.views ?? 0} lượt</strong>
            </button>
          ))}
        {!top.some((i) => (c.data.progress[i.id]?.views ?? 0) > 0) && (
          <p className="muted">Chưa có dữ liệu lượt mở.</p>
        )}
      </div>
    </Modal>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [removed, setRemoved] = useState(false);
  return (
    <Modal title="Cấu hình AI" onClose={onClose}>
      <div className="form-stack">
        <p>
          AI sử dụng API key và model được cấu hình trên máy chủ. Ứng dụng không
          lưu khóa mới trong trình duyệt.
        </p>
        <p className="muted">
          Điền OPENROUTER_API_KEY và OPENROUTER_MODEL trong môi trường máy chủ,
          kèm Firebase Admin. Xem hướng dẫn trong README.md.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("it-support-ai-config-v1");
            setRemoved(true);
          }}
        >
          Xóa API key cũ khỏi trình duyệt
        </button>
        {removed && (
          <p role="status">Đã xóa cấu hình AI cũ trên thiết bị này.</p>
        )}
      </div>
    </Modal>
  );
}
