"use client";
import {
  Check,
  Copy,
  ImagePlus,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { priorities, categories } from "@/lib/domain/catalog";
import { copyImage, imageBlob } from "@/lib/firebase/images";
import { ImageView } from "./image-view";
import { ActionMenu } from "./action-menu";
import type { Issue, Progress } from "@/types";
export function PriorityTags({ issue }: { issue: Issue }) {
  return (
    <span className="tags">
      {priorities
        .filter((p) => issue.priorityLabels.includes(p.id))
        .map((p) => (
          <span className={`tag tag-${p.id}`} key={p.id}>
            {p.name}
          </span>
        ))}
    </span>
  );
}
export function IssueDetail({
  issue,
  progress,
  disabled,
  onEdit,
  onDelete,
  onCompose,
  onCheck,
  onReset,
  notify,
  fail,
}: {
  issue: Issue;
  progress: Progress;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCompose: () => void;
  onCheck: (index: number, checked: boolean) => void;
  onReset: () => void;
  notify: (message: string) => void;
  fail: (error: unknown) => void;
}) {
  const completed = issue.steps.filter(
    (_, index) => progress.checked[index],
  ).length;
  const nextStep = issue.steps.findIndex(
    (_, index) => !progress.checked[index],
  );
  async function copyText() {
    try {
      await navigator.clipboard.writeText(issue.script);
      notify("Đã copy tin nhắn.");
    } catch (e) {
      fail(e);
    }
  }
  async function handleCopy(source: string) {
    try {
      await copyImage(source);
      notify("Đã copy ảnh.");
    } catch (e) {
      fail(e);
    }
  }
  async function downloadImage(source: string, index: number) {
    try {
      const blob = await imageBlob(source);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `anh-${index + 1}.jpg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      fail(e);
    }
  }
  return (
    <article className="issue-detail">
      <header className="detail-heading">
        <div>
          <span className="eyebrow">
            {categories.find((c) => c.id === issue.categoryId)?.name}
          </span>
          <h1>{issue.name}</h1>
          <p className="muted">{issue.summary}</p>
          <PriorityTags issue={issue} />
        </div>
        <div className="detail-actions">
          <button disabled={disabled} onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Sửa kịch bản
          </button>
          <ActionMenu
            label="Thao tác"
            icon={<MoreHorizontal size={17} aria-hidden="true" />}
          >
            <button className="danger" disabled={disabled} onClick={onDelete}>
              <Trash2 size={16} aria-hidden="true" />
              Xóa kịch bản
            </button>
          </ActionMenu>
        </div>
      </header>
      <div className="detail-grid">
        <section
          className="detail-block process-block"
          aria-labelledby="process-title"
        >
          <div className="block-heading">
            <h2 id="process-title">Quy trình xử lý</h2>
            <button onClick={onReset} disabled={disabled}>
              <RotateCcw size={14} aria-hidden="true" />
              Đặt lại
            </button>
          </div>
          {issue.steps.length > 0 && (
            <div className="process-progress">
              <div>
                <span>
                  Đã xử lý{" "}
                  <strong>
                    {completed}/{issue.steps.length}
                  </strong>{" "}
                  bước
                </span>
                <span className="progress-caption">
                  {completed === issue.steps.length
                    ? "Hoàn tất quy trình"
                    : `Tiếp theo: bước ${nextStep + 1}`}
                </span>
              </div>
              <progress
                aria-label="Tiến độ xử lý"
                max={issue.steps.length}
                value={completed}
              />
            </div>
          )}
          {issue.steps.length ? (
            <ol className="steps">
              {issue.steps.map((step, i) => (
                <li
                  key={i}
                  className={`${progress.checked[i] ? "completed" : ""} ${nextStep === i ? "next-step" : ""}`}
                >
                  <label
                    className={`step ${progress.checked[i] ? "done" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!progress.checked[i]}
                      disabled={disabled}
                      onChange={(e) => onCheck(i, e.target.checked)}
                    />
                    <span className="step-body">
                      <span className="step-caption">
                        Bước {i + 1}
                        {progress.checked[i] && (
                          <Check size={13} aria-hidden="true" />
                        )}
                        {nextStep === i && (
                          <span className="next-step-label">Đang xử lý</span>
                        )}
                      </span>
                      <span>{step}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Chưa có quy trình.</p>
          )}
        </section>
        <section
          className="detail-block script-block"
          aria-labelledby="reply-title"
        >
          <div className="block-heading">
            <div>
              <h2 id="reply-title">Tin gửi khách hàng</h2>
              <p className="reply-hint">Nội dung dùng để gửi qua Zalo</p>
            </div>
            <Send size={20} aria-hidden="true" />
          </div>
          <div className="reply-preview">
            {issue.script ||
              "Chưa có tin nhắn mẫu. Chọn Sửa kịch bản để bổ sung nội dung."}
          </div>
          <div className="reply-actions">
            <button
              className="primary desktop-copy"
              disabled={!issue.script.trim()}
              onClick={copyText}
            >
              <Copy size={17} aria-hidden="true" />
              Copy tin nhắn
            </button>
            <button onClick={onCompose}>
              <Pencil size={16} aria-hidden="true" />
              Tùy chỉnh tin nhắn
            </button>
          </div>
          {/\{\{\s*(ten_khach|mst|phan_mem)\s*\}\}/i.test(issue.script) && (
            <p className="reply-template-note">
              Mẫu có thông tin khách hàng cần điền. Chọn “Tùy chỉnh tin nhắn” để
              hoàn thiện trước khi gửi.
            </p>
          )}
        </section>
        <section className="detail-block escalation">
          <h2>Khi nào cần leo thang?</h2>
          <p className="preserve">
            {issue.escalation || "Chưa có điều kiện leo thang."}
          </p>
        </section>
        <section className="detail-block notes">
          <h2>Ghi chú nội bộ</h2>
          <p className="preserve">
            {issue.internalNotes || "Chưa có ghi chú nội bộ."}
          </p>
        </section>
        <section className="detail-block images-block">
          <div className="block-heading">
            <h2>Ảnh minh họa</h2>
            <button onClick={onEdit} disabled={disabled}>
              <ImagePlus size={16} aria-hidden="true" />
              Thêm / sửa ảnh
            </button>
          </div>
          {issue.images.length ? (
            <div className="image-gallery">
              {issue.images.map((image, i) => (
                <figure key={`${image}-${i}`}>
                  <ImageView
                    source={image}
                    alt={`Ảnh minh họa ${i + 1} của ${issue.name}`}
                  />
                  <figcaption>
                    <span>Ảnh {i + 1}</span>
                    <div className="row">
                      <button onClick={() => void handleCopy(image)}>
                        Copy
                      </button>
                      <button onClick={() => void downloadImage(image, i)}>
                        Tải ảnh
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="empty-inline">Chưa có ảnh minh họa.</p>
          )}
        </section>
      </div>
      <button
        className="mobile-copy primary"
        disabled={!issue.script.trim()}
        onClick={copyText}
      >
        <Copy size={18} aria-hidden="true" />
        Copy tin nhắn
      </button>
    </article>
  );
}
