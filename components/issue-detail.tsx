"use client";
import { Copy, ImagePlus, Pencil, RotateCcw, Send, Trash2 } from "lucide-react";
import { priorities, categories } from "@/lib/domain/catalog";
import { copyImage, imageBlob } from "@/lib/firebase/images";
import { ImageView } from "./image-view";
import type { Issue, Progress } from "@/types";
export function PriorityTags({ issue }: { issue: Issue }) {
  return (
    <div className="tags">
      {priorities
        .filter((p) => issue.priorityLabels.includes(p.id))
        .map((p) => (
          <span className={`tag tag-${p.id}`} key={p.id}>
            {p.name}
          </span>
        ))}
    </div>
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
  async function copyText() {
    try {
      await navigator.clipboard.writeText(issue.script);
      notify("Đã copy script Zalo.");
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
          <button onClick={onCompose}>
            <Send size={16} aria-hidden="true" />
            Tạo tin Zalo
          </button>
          <button onClick={copyText}>
            <Copy size={16} aria-hidden="true" />
            Copy Zalo
          </button>
          <button disabled={disabled} onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Sửa
          </button>
          <button className="danger" disabled={disabled} onClick={onDelete}>
            <Trash2 size={16} aria-hidden="true" />
            Xóa
          </button>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-block">
          <div className="block-heading">
            <h2>Quy trình xử lý</h2>
            <button onClick={onReset} disabled={disabled}>
              <RotateCcw size={14} aria-hidden="true" />
              Đặt lại
            </button>
          </div>
          {issue.steps.length ? (
            <ol className="steps">
              {issue.steps.map((step, i) => (
                <li key={i}>
                  <label
                    className={`step ${progress.checked[i] ? "done" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!progress.checked[i]}
                      disabled={disabled}
                      onChange={(e) => onCheck(i, e.target.checked)}
                    />
                    <span>{step}</span>
                  </label>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Chưa có quy trình.</p>
          )}
        </section>
        <section className="detail-block script-block">
          <div className="block-heading">
            <h2>Script Zalo gửi khách</h2>
            <button onClick={copyText}>
              <Copy size={14} aria-hidden="true" />
              Copy
            </button>
          </div>
          <pre>{issue.script || "Chưa có script."}</pre>
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
      <button className="mobile-copy primary" onClick={copyText}>
        <Copy size={18} aria-hidden="true" />
        Copy Zalo
      </button>
    </article>
  );
}
