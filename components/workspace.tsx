"use client";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  LayoutList,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { useWorkspace, type WorkspaceController } from "@/hooks/use-workspace";
import { AuthScreen } from "./auth-screen";
import { IssueDetail, PriorityTags } from "./issue-detail";
import { Pwa } from "./pwa";
import { SearchField, WorkspaceToolbar } from "./workspace-toolbar";
import {
  SyncStatus,
  WorkspaceError,
  WorkspaceLoading,
} from "./workspace-feedback";
import { categories, initialFilters, priorities } from "@/lib/domain/catalog";
import { blankIssue, errorMessage, parseDataset } from "@/lib/domain/schema";
import { filterIssues } from "@/lib/domain/search";
import { portableDataset } from "@/lib/firebase/images";
import { downloadJson } from "@/lib/domain/backups";
import type { CategoryId, Filters, Issue } from "@/types";

const IssueEditor = dynamic(() =>
  import("./issue-editor").then((m) => m.IssueEditor),
);
const ZaloModal = dynamic(() => import("./tools").then((m) => m.ZaloModal));
const AiModal = dynamic(() => import("./tools").then((m) => m.AiModal));
const BackupModal = dynamic(() => import("./tools").then((m) => m.BackupModal));
const StatsModal = dynamic(() => import("./tools").then((m) => m.StatsModal));
const SettingsModal = dynamic(() =>
  import("./tools").then((m) => m.SettingsModal),
);

export function Workspace() {
  const c = useWorkspace();
  return c.user ? (
    <WorkspaceContent key={c.user.uid} controller={c} />
  ) : (
    <>
      <Pwa />
      <AuthScreen controller={c} />
    </>
  );
}
function readSelection(uid: string) {
  try {
    return JSON.parse(
      localStorage.getItem(`cskh-selection-${uid}`) ?? "{}",
    ) as { category?: CategoryId; activeId?: string };
  } catch {
    return {};
  }
}
function WorkspaceContent({
  controller: c,
}: {
  controller: WorkspaceController;
}) {
  const [category, setCategory] = useState<CategoryId>(() => {
    const selected = readSelection(c.user!.uid).category;
    return categories.some((c) => c.id === selected) ? selected! : "cks";
  });
  const [activeId, setActiveId] = useState(
    () => readSelection(c.user!.uid).activeId ?? "",
  );
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<Filters>({ ...initialFilters });
  const [editor, setEditor] = useState<Issue | null>(null);
  const [tool, setTool] = useState<
    "zalo" | "ai" | "backup" | "stats" | "settings" | null
  >(null);
  const [focus, setFocus] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [exporting, setExporting] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const filtered = filterIssues(
    c.data.issues,
    deferredQuery,
    category,
    filters,
  );
  const active = c.data.issues.find((i) => i.id === activeId) ?? filtered[0];
  const disabled = c.pending || !c.online || !c.ready;
  const selectedKey = c.user ? `cskh-selection-${c.user.uid}` : "";
  useEffect(() => {
    if (!selectedKey) return;
    try {
      localStorage.setItem(selectedKey, JSON.stringify({ category, activeId }));
    } catch {
      /* Nonessential preferences. */
    }
  }, [selectedKey, category, activeId]);
  useEffect(() => {
    if (mobileSearch) mobileSearchRef.current?.focus();
  }, [mobileSearch]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        c.ready &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        setMobileSearch(false);
        setFocus(false);
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [c.ready]);
  function updateQuery(value: string) {
    setQuery(value);
    setActiveId("");
    setFocus(false);
  }
  function openIssue(id: string) {
    const issue = c.data.issues.find((i) => i.id === id);
    if (!issue) return;
    setActiveId(id);
    setCategory(issue.categoryId);
    setFocus(true);
    setMobileSearch(false);
    setQuery("");
    setFilters({ ...initialFilters });
    window.scrollTo({ top: 0, behavior: "instant" });
    if (c.online && !c.pending) void c.progress(id, { view: true });
  }
  function changeCategory(id: CategoryId) {
    setCategory(id);
    setActiveId("");
    setFocus(false);
    setQuery("");
    setFilters({ ...initialFilters });
  }
  async function exportData() {
    setExporting(true);
    c.setFault("");
    try {
      downloadJson(
        { ...(await portableDataset(c.data)), schemaVersion: 2 },
        "cskh-scripts.json",
      );
      c.setNotice("Đã xuất dữ liệu kèm ảnh.");
    } catch (e) {
      c.setFault(errorMessage(e));
    } finally {
      setExporting(false);
    }
  }
  async function importData(file: File) {
    try {
      if (file.size > 50 * 1024 * 1024)
        throw new Error("File dữ liệu tối đa 50 MB.");
      const data = parseDataset(JSON.parse(await file.text()));
      if (
        !confirm(
          `Thay dữ liệu hiện tại bằng ${data.issues.length} kịch bản trong file? Bản hiện tại sẽ được sao lưu trước.`,
        )
      )
        return;
      if (await c.replace(data)) {
        setActiveId("");
        setFocus(false);
        setQuery("");
        setFilters({ ...initialFilters, category: "all" });
      }
    } catch (e) {
      c.setFault(errorMessage(e));
    }
  }
  return (
    <div
      className={`app-shell ${focus ? "detail-focus" : ""} ${mobileSearch ? "search-focus" : ""}`}
    >
      <Pwa />
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <WorkspaceToolbar
        query={query}
        onQuery={updateQuery}
        searchRef={searchRef}
        ready={c.ready}
        pending={c.pending}
        online={c.online}
        exporting={exporting}
        onExport={() => void exportData()}
        onImport={() => importInput.current?.click()}
        onBackup={() => setTool("backup")}
        onStats={() => setTool("stats")}
        onAi={() => setTool("ai")}
        onSettings={() => setTool("settings")}
        onLogout={() => {
          setTool(null);
          setEditor(null);
          void c.logout();
        }}
      />
      <input
        ref={importInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void importData(file);
        }}
      />
      <SyncStatus
        ready={c.ready}
        pending={c.pending}
        online={c.online}
        fault={c.fault}
      />
      {c.fault && (
        <WorkspaceError
          fault={c.fault}
          ready={c.ready}
          pending={c.pending}
          onRetry={() => {
            c.setFault("");
            c.retry();
          }}
        />
      )}
      {!c.ready ? (
        <WorkspaceLoading failed={!!c.fault} />
      ) : (
        <main className="workspace" id="main-content">
          <nav className="category-tabs" aria-label="Nhóm nghiệp vụ">
            {categories.map((item) => (
              <button
                key={item.id}
                aria-pressed={category === item.id}
                className={category === item.id ? "active" : ""}
                style={
                  category === item.id ? { background: item.color } : undefined
                }
                onClick={() => changeCategory(item.id)}
              >
                {item.name}
                <span className="count">
                  {c.data.issues.filter((i) => i.categoryId === item.id).length}
                </span>
              </button>
            ))}
          </nav>
          <div className="main-panel">
            <aside className="list-panel">
              <div className="panel-title">
                <h2>
                  {mobileSearch || query
                    ? "Tìm kiếm kịch bản"
                    : categories.find((i) => i.id === category)?.name}
                </h2>
                <button
                  className="primary"
                  disabled={disabled}
                  onClick={() => setEditor(blankIssue(category))}
                >
                  <Plus size={16} aria-hidden="true" />
                  Thêm
                </button>
                {mobileSearch && (
                  <button
                    aria-label="Đóng tìm kiếm"
                    onClick={() => setMobileSearch(false)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {mobileSearch && (
                <SearchField
                  value={query}
                  onChange={updateQuery}
                  inputRef={mobileSearchRef}
                  mobile
                />
              )}
              <details className="advanced-filter">
                <summary>Bộ lọc nâng cao</summary>
                <div className="form-stack">
                  <label>
                    Nhóm
                    <select
                      value={filters.category}
                      onChange={(e) => {
                        setFilters((f) => ({
                          ...f,
                          category: e.target.value as Filters["category"],
                        }));
                        setActiveId("");
                      }}
                    >
                      <option value="current">Theo tab đang mở</option>
                      <option value="all">Tất cả nhóm</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nhãn ưu tiên
                    <select
                      value={filters.priority}
                      onChange={(e) => {
                        setFilters((f) => ({
                          ...f,
                          priority: e.target.value as Filters["priority"],
                        }));
                        setActiveId("");
                      }}
                    >
                      <option value="">Tất cả nhãn</option>
                      {priorities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {(
                    [
                      ["remote", "Cần remote"],
                      ["urgent", "Khẩn cấp"],
                      ["hasNotes", "Có ghi chú nội bộ"],
                      ["noScript", "Chưa có script"],
                      ["noImage", "Chưa có ảnh"],
                    ] as const
                  ).map(([key, label]) => (
                    <label className="check" key={key}>
                      <input
                        type="checkbox"
                        checked={filters[key]}
                        onChange={(e) => {
                          setFilters((f) => ({
                            ...f,
                            [key]: e.target.checked,
                          }));
                          setActiveId("");
                        }}
                      />
                      {label}
                    </label>
                  ))}
                  <button
                    onClick={() => {
                      setFilters({ ...initialFilters });
                      setActiveId("");
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </details>
              <p className="list-count" aria-live="polite">
                {filtered.length} kịch bản
              </p>
              <div className="issue-list">
                {filtered.map((issue) => (
                  <button
                    key={issue.id}
                    className={`issue-item ${active?.id === issue.id ? "selected" : ""}`}
                    aria-pressed={active?.id === issue.id}
                    onClick={() => openIssue(issue.id)}
                  >
                    <span className="issue-category">
                      {categories.find((c) => c.id === issue.categoryId)?.name}
                    </span>
                    <strong>{issue.name}</strong>
                    <span>{issue.summary || "Chưa có mô tả"}</span>
                    <PriorityTags issue={issue} />
                    <span className="open-label">Mở kịch bản →</span>
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <p className="empty-inline">
                  Không có kịch bản phù hợp. Thử đổi bộ lọc hoặc thêm kịch bản
                  mới.
                </p>
              )}
            </aside>
            <section className="detail-panel" aria-label="Chi tiết kịch bản">
              <button className="back-button" onClick={() => setFocus(false)}>
                <ArrowLeft size={18} aria-hidden="true" />
                Danh sách kịch bản
              </button>
              {active ? (
                <IssueDetail
                  key={active.id}
                  issue={active}
                  progress={
                    c.data.progress[active.id] ?? { checked: {}, views: 0 }
                  }
                  disabled={disabled}
                  onEdit={() => setEditor(structuredClone(active))}
                  onDelete={() => {
                    if (confirm(`Xóa kịch bản “${active.name}”?`))
                      void c.remove(active);
                  }}
                  onCompose={() => setTool("zalo")}
                  onCheck={(index, checked) =>
                    void c.progress(active.id, { step: String(index), checked })
                  }
                  onReset={() => void c.progress(active.id, { reset: true })}
                  notify={c.setNotice}
                  fail={(error) => c.setFault(errorMessage(error))}
                />
              ) : (
                <div className="empty-state">
                  <LayoutList size={40} aria-hidden="true" />
                  <h1>Kho kịch bản của bạn</h1>
                  <p>Chọn một kịch bản hoặc tạo nội dung đầu tiên.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      )}
      {c.notice && (
        <div className="toast" role="status">
          <span>{c.notice}</span>
          <button aria-label="Đóng thông báo" onClick={() => c.setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <nav className="bottom-nav" aria-label="Điều hướng nhanh">
        <button
          onClick={() => {
            setFocus(false);
            setMobileSearch(false);
          }}
          aria-pressed={!focus && !mobileSearch}
        >
          <LayoutList size={20} aria-hidden="true" />
          Nhóm lỗi
        </button>
        <button
          onClick={() => {
            setMobileSearch(true);
            setFilters({ ...initialFilters, category: "all" });
            setFocus(false);
          }}
          aria-pressed={mobileSearch}
        >
          <Search size={20} aria-hidden="true" />
          Tìm kiếm
        </button>
        <button
          disabled={!active}
          onClick={() => {
            setFocus(true);
            setMobileSearch(false);
          }}
          aria-pressed={focus}
        >
          <BarChart3 size={20} aria-hidden="true" />
          Chi tiết
        </button>
        <button disabled={!active} onClick={() => setTool("zalo")}>
          <Send size={20} aria-hidden="true" />
          Zalo
        </button>
        <button disabled={!c.ready} onClick={() => setTool("ai")}>
          <Bot size={20} aria-hidden="true" />
          AI
        </button>
      </nav>
      {editor && (
        <IssueEditor
          issue={editor}
          uid={c.user!.uid}
          onSave={c.save}
          onClose={() => setEditor(null)}
        />
      )}
      {tool === "zalo" && active && (
        <ZaloModal
          issue={active}
          onClose={() => setTool(null)}
          notify={c.setNotice}
        />
      )}
      {tool === "ai" && (
        <AiModal
          controller={c}
          onOpen={openIssue}
          onClose={() => setTool(null)}
        />
      )}
      {tool === "backup" && (
        <BackupModal controller={c} onClose={() => setTool(null)} />
      )}
      {tool === "stats" && (
        <StatsModal
          controller={c}
          onOpen={openIssue}
          onClose={() => setTool(null)}
        />
      )}
      {tool === "settings" && <SettingsModal onClose={() => setTool(null)} />}
    </div>
  );
}
