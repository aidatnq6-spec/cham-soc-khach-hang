"use client";
import type { Ref } from "react";
import {
  BarChart3,
  Bot,
  Download,
  Headphones,
  History,
  LogOut,
  Search,
  Settings,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { ActionMenu } from "./action-menu";

export function SearchField({
  value,
  onChange,
  inputRef,
  disabled = false,
  mobile = false,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
  mobile?: boolean;
}) {
  return (
    <div
      className={`search-field ${mobile ? "mobile-search-field" : "global-search"}`}
      role="search"
    >
      <Search size={19} aria-hidden="true" />
      <input
        ref={inputRef}
        aria-label={mobile ? "Tìm kiếm toàn màn hình" : "Tìm kiếm kịch bản"}
        type="search"
        placeholder="Tìm tình huống, lỗi, phần mềm…"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
      />
      {value ? (
        <button
          type="button"
          className="search-clear"
          aria-label="Xóa từ khóa tìm kiếm"
          onClick={() => onChange("")}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : (
        <kbd aria-hidden="true">Ctrl K</kbd>
      )}
    </div>
  );
}

export function WorkspaceToolbar({
  query,
  onQuery,
  searchRef,
  ready,
  pending,
  online,
  exporting,
  onExport,
  onImport,
  onBackup,
  onStats,
  onAi,
  onSettings,
  onLogout,
}: {
  query: string;
  onQuery: (value: string) => void;
  searchRef: Ref<HTMLInputElement>;
  ready: boolean;
  pending: boolean;
  online: boolean;
  exporting: boolean;
  onExport: () => void;
  onImport: () => void;
  onBackup: () => void;
  onStats: () => void;
  onAi: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="workspace-topbar">
      <div className="toolbar-inner">
        <div className="brand">
          <span className="brand-icon">
            <Headphones aria-hidden="true" />
          </span>
          <div>
            <strong>CSKH Script</strong>
            <small>Kịch bản hỗ trợ khách hàng</small>
          </div>
        </div>
        <SearchField
          value={query}
          onChange={onQuery}
          inputRef={searchRef}
          disabled={!ready}
        />
        <div className="workspace-tools">
          <button
            className="ai-button"
            aria-label="AI chẩn đoán"
            title="AI chẩn đoán"
            disabled={!ready}
            onClick={onAi}
          >
            <Bot size={18} aria-hidden="true" />
            <span>AI chẩn đoán</span>
          </button>
          <ActionMenu
            label="Công cụ"
            icon={<SlidersHorizontal size={17} aria-hidden="true" />}
          >
            <WorkspaceToolActions
              ready={ready}
              pending={pending}
              online={online}
              exporting={exporting}
              onExport={onExport}
              onImport={onImport}
              onBackup={onBackup}
              onStats={onStats}
              onSettings={onSettings}
              onLogout={onLogout}
            />
          </ActionMenu>
        </div>
      </div>
    </header>
  );
}

export type WorkspaceToolActionsProps = Pick<
  Parameters<typeof WorkspaceToolbar>[0],
  | "ready"
  | "pending"
  | "online"
  | "exporting"
  | "onExport"
  | "onImport"
  | "onBackup"
  | "onStats"
  | "onSettings"
  | "onLogout"
>;
export function WorkspaceToolActions({
  ready,
  pending,
  online,
  exporting,
  onExport,
  onImport,
  onBackup,
  onStats,
  onSettings,
  onLogout,
}: WorkspaceToolActionsProps) {
  return (
    <div className="tool-actions">
      <span className="action-group-label">Dữ liệu & tiện ích</span>
      <button disabled={!ready || exporting} onClick={onExport}>
        <Download size={17} aria-hidden="true" />
        {exporting ? "Đang xuất dữ liệu…" : "Xuất dữ liệu"}
      </button>
      <button disabled={!ready || pending || !online} onClick={onImport}>
        <Upload size={17} aria-hidden="true" />
        Nhập dữ liệu
      </button>
      <button disabled={!ready} onClick={onBackup}>
        <History size={17} aria-hidden="true" />
        Sao lưu / Khôi phục
      </button>
      <button disabled={!ready} onClick={onStats}>
        <BarChart3 size={17} aria-hidden="true" />
        Thống kê kịch bản
      </button>
      <button onClick={onSettings}>
        <Settings size={17} aria-hidden="true" />
        Cấu hình AI
      </button>
      <hr />
      <button className="danger" disabled={pending} onClick={onLogout}>
        <LogOut size={17} aria-hidden="true" />
        Đăng xuất
      </button>
    </div>
  );
}
