"use client";
import { useState } from "react";
import { Modal } from "./modal";
import { ImageView } from "./image-view";
import { categories, priorities } from "@/lib/domain/catalog";
import { uploadImages } from "@/lib/firebase/images";
import { errorMessage, issueSchema } from "@/lib/domain/schema";
import type { Issue } from "@/types";

export function IssueEditor({
  issue,
  uid,
  onSave,
  onClose,
}: {
  issue: Issue;
  uid: string;
  onSave: (issue: Issue) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(issue);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field = (key: keyof Issue, value: unknown) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function append(incoming: File[]) {
    setFiles((previous) => [
      ...previous,
      ...incoming.filter((file) => file.type.startsWith("image/")),
    ]);
  }
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const clean = issueSchema.parse({
        ...draft,
        steps: draft.steps.map((step) => step.trim()).filter(Boolean),
      });
      if (clean.images.length + files.length > 30)
        throw new Error("Mỗi kịch bản tối đa 30 ảnh.");
      const uploaded = await uploadImages(uid, clean.id, files);
      // Keep successful uploads in the draft if a later revision conflict prevents saving.
      const next = { ...clean, images: [...clean.images, ...uploaded] };
      setDraft(next);
      setFiles([]);
      if (await onSave(next)) onClose();
      else
        setError(
          "Chưa lưu được. Kiểm tra thông báo trong ứng dụng; nếu có xung đột hãy đóng và mở bản mới.",
        );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={issue.revision ? "Sửa kịch bản" : "Thêm kịch bản"}
      onClose={onClose}
      busy={busy}
    >
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        onPaste={(e) => {
          const images = Array.from(e.clipboardData.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (images.length) {
            e.preventDefault();
            append(images);
          }
        }}
      >
        <fieldset disabled={busy} className="form-stack unstyled-fieldset">
          <label>
            Nhóm
            <select
              value={draft.categoryId}
              onChange={(e) => field("categoryId", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tên lỗi / tình huống
            <input
              required
              maxLength={300}
              value={draft.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label>
            Mô tả ngắn
            <input
              maxLength={2000}
              value={draft.summary}
              onChange={(e) => field("summary", e.target.value)}
            />
          </label>
          <fieldset>
            <legend>Nhãn ưu tiên</legend>
            <div className="check-grid">
              {priorities.map((p) => (
                <label className="check" key={p.id}>
                  <input
                    type="checkbox"
                    checked={draft.priorityLabels.includes(p.id)}
                    onChange={(e) =>
                      field(
                        "priorityLabels",
                        e.target.checked
                          ? [...draft.priorityLabels, p.id]
                          : draft.priorityLabels.filter((v) => v !== p.id),
                      )
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Quy trình xử lý — mỗi bước một dòng
            <textarea
              rows={5}
              value={draft.steps.join("\n")}
              onChange={(e) => field("steps", e.target.value.split("\n"))}
            />
          </label>
          <label>
            Script Zalo gửi khách
            <textarea
              rows={7}
              value={draft.script}
              onChange={(e) => field("script", e.target.value)}
            />
            <small>Hỗ trợ {"{{ten_khach}}, {{mst}}, {{phan_mem}}"}.</small>
          </label>
          <label>
            Khi nào cần leo thang?
            <textarea
              rows={3}
              value={draft.escalation}
              onChange={(e) => field("escalation", e.target.value)}
            />
          </label>
          <label>
            Ghi chú nội bộ
            <textarea
              rows={3}
              value={draft.internalNotes}
              onChange={(e) => field("internalNotes", e.target.value)}
            />
            <small>Không được thêm vào tin nhắn gửi khách.</small>
          </label>
          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              append(Array.from(e.dataTransfer.files));
            }}
          >
            <label>
              Ảnh minh họa
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => {
                  append(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
            </label>
            <small>
              Kéo thả hoặc dán ảnh vào biểu mẫu. PNG, JPEG, WebP; tối đa 20
              MB/ảnh trước khi nén.
            </small>
          </div>
          <div className="image-gallery">
            {draft.images.map((source, index) => (
              <figure key={`${source}-${index}`}>
                <ImageView source={source} alt={`Ảnh ${index + 1}`} />
                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    field(
                      "images",
                      draft.images.filter((_, i) => i !== index),
                    )
                  }
                >
                  Bỏ ảnh {index + 1}
                </button>
              </figure>
            ))}
          </div>
          {files.map((file, index) => (
            <div className="row" key={`${file.name}-${index}`}>
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFiles((previous) => previous.filter((_, i) => i !== index))
                }
              >
                Bỏ chọn
              </button>
            </div>
          ))}
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button className="primary" type="submit">
              {busy ? "Đang tải ảnh và lưu…" : "Lưu kịch bản"}
            </button>
            <button type="button" onClick={onClose}>
              Hủy
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
