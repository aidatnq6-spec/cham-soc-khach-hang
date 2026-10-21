// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Workspace } from "@/components/workspace";
import { WorkspaceToolbar } from "@/components/workspace-toolbar";
import { SyncStatus, WorkspaceError } from "@/components/workspace-feedback";
import { IssueDetail } from "@/components/issue-detail";
import { seedDataset } from "@/lib/domain/schema";
import type { WorkspaceController } from "@/hooks/use-workspace";

const state = vi.hoisted(() => ({
  controller: null as WorkspaceController | null,
  images: [] as string[],
}));
vi.mock("@/hooks/use-workspace", () => ({
  useWorkspace: () => state.controller,
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function DeferredPanel() {
      return null;
    },
}));
vi.mock("@/components/pwa", () => ({ Pwa: () => null }));
vi.mock("@/components/image-view", () => ({
  ImageView: ({ alt }: { alt: string }) => {
    state.images.push(alt);
    return <span role="img" aria-label={alt} />;
  },
}));

afterEach(cleanup);
beforeEach(() => {
  state.images = [];
  vi.stubGlobal("scrollTo", vi.fn());
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  state.controller = {
    user: { uid: "design-test" },
    data: seedDataset(),
    ready: true,
    pending: false,
    online: true,
    notice: "",
    fault: "",
    setFault: vi.fn(),
    setNotice: vi.fn(),
    retry: vi.fn(),
    logout: vi.fn(),
    progress: vi.fn(),
  } as unknown as WorkspaceController;
});

describe("workspace toolbar and global search", () => {
  it("searches across categories from the topbar and clears the search", async () => {
    const user = userEvent.setup();
    render(<Workspace />);
    const input = screen.getByRole("searchbox", { name: "Tìm kiếm kịch bản" });
    expect(input.closest("header")).not.toBeNull();
    await user.type(input, "huy / dieu chinh");
    await screen.findByRole("button", { name: /Hủy \/ điều chỉnh hóa đơn/ });
    await user.click(
      screen.getByRole("button", { name: "Xóa từ khóa tìm kiếm" }),
    );
    expect((input as HTMLInputElement).value).toBe("");
    expect(
      screen.queryByRole("button", { name: /Hủy \/ điều chỉnh hóa đơn/ }),
    ).toBeNull();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(input);
  });
  it("groups labeled tools, invokes actions and dismisses on Escape/outside click", async () => {
    const user = userEvent.setup();
    const backup = vi.fn();
    render(
      <WorkspaceToolbar
        query=""
        onQuery={vi.fn()}
        searchRef={null}
        ready
        pending={false}
        online
        exporting={false}
        onExport={vi.fn()}
        onImport={vi.fn()}
        onBackup={backup}
        onStats={vi.fn()}
        onAi={vi.fn()}
        onSettings={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    const summary = screen.getByText("Công cụ");
    const details = summary.closest("details")!;
    await user.click(summary);
    expect(details.open).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Sao lưu / Khôi phục" }),
    );
    expect(backup).toHaveBeenCalledOnce();
    expect(details.open).toBe(false);
    await user.click(summary);
    await user.keyboard("{Escape}");
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(details.querySelector("summary"));
    await user.click(summary);
    await user.click(screen.getByRole("searchbox"));
    expect(details.open).toBe(false);
  });
  it("does not steal the search shortcut from an open dialog", () => {
    render(<Workspace />);
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.appendChild(dialog);
    const field = document.createElement("input");
    dialog.appendChild(field);
    field.focus();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(field);
    dialog.remove();
  });
});

describe("loading and error hierarchy", () => {
  it("never reports success while loading or after an error", () => {
    const { rerender } = render(
      <SyncStatus ready={false} pending={false} online fault="" />,
    );
    expect(screen.getByRole("status").textContent).toBe(
      "Đang tải kho kịch bản",
    );
    expect(screen.queryByText("Đã đồng bộ")).toBeNull();
    rerender(
      <SyncStatus ready pending={false} online fault="permission-denied" />,
    );
    expect(screen.getByRole("status").textContent).toBe(
      "Thao tác chưa hoàn tất",
    );
    rerender(<SyncStatus ready pending={false} online fault="" />);
    expect(screen.getByRole("status").textContent).toBe("Đã đồng bộ");
    rerender(<SyncStatus ready pending={false} online={false} fault="" />);
    expect(screen.getByRole("status").textContent).toContain("Offline");
  });
  it("shows loading skeletons without data actions, then a recoverable error state", async () => {
    state.controller!.ready = false;
    const { rerender } = render(<Workspace />);
    expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("true");
    state.controller!.fault = "Failed to execute setItem: quota exceeded";
    rerender(<Workspace />);
    expect(
      screen.getByRole("heading", { name: "Chưa tải được kho kịch bản" }),
    ).toBeTruthy();
    const details = screen.getByText("Chi tiết lỗi").closest("details")!;
    expect(details.open).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Thử tải lại" }));
    expect(state.controller!.retry).toHaveBeenCalled();
  });
  it("keeps technical error details collapsed and exposes the retry action", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <WorkspaceError
        fault="FirebaseError: permission-denied"
        ready={false}
        pending={false}
        onRetry={retry}
      />,
    );
    const summary = screen.getByText("Chi tiết lỗi");
    expect(summary.closest("details")!.open).toBe(false);
    await user.click(summary);
    expect(summary.closest("details")!.open).toBe(true);
    await user.click(screen.getByRole("button", { name: "Thử tải lại" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("process and Zalo task area", () => {
  it("shows completed steps, the next step and preserves copy/compose/check/delete actions", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const check = vi.fn(),
      compose = vi.fn(),
      remove = vi.fn();
    const issue = seedDataset().issues[0];
    render(
      <IssueDetail
        issue={issue}
        progress={{ checked: { "0": true, "2": true }, views: 0 }}
        disabled={false}
        onEdit={vi.fn()}
        onDelete={remove}
        onCompose={compose}
        onCheck={check}
        onReset={vi.fn()}
        notify={vi.fn()}
        fail={vi.fn()}
      />,
    );
    expect(
      (
        screen.getByRole("progressbar", {
          name: "Tiến độ xử lý",
        }) as HTMLProgressElement
      ).value,
    ).toBe(2);
    const process = screen.getByRole("region", { name: "Quy trình xử lý" });
    expect(within(process).getByText("Tiếp theo: bước 2")).toBeTruthy();
    await user.click(within(process).getAllByRole("checkbox")[1]);
    expect(check).toHaveBeenCalledWith(1, true);
    const reply = screen.getByRole("region", { name: "Tin gửi khách hàng" });
    await user.click(
      within(reply).getByRole("button", { name: "Copy tin nhắn" }),
    );
    expect(copy).toHaveBeenCalledWith(issue.script);
    await user.click(
      screen.getByRole("button", { name: "Tùy chỉnh tin nhắn" }),
    );
    expect(compose).toHaveBeenCalledOnce();
    const summary = screen.getByText("Thao tác");
    const details = summary.closest("details")!;
    expect(details.open).toBe(false);
    await user.click(summary);
    await user.click(screen.getByRole("button", { name: "Xóa kịch bản" }));
    expect(remove).toHaveBeenCalledOnce();
  });
});

describe("remaining workspace navigation and supporting content", () => {
  it("switches categories from both desktop navigation and the compact picker", async () => {
    const user = userEvent.setup();
    render(<Workspace />);
    const navigation = screen.getByRole("navigation", {
      name: "Nhóm nghiệp vụ",
    });
    const invoice = within(navigation).getByRole("button", {
      name: /Hóa đơn điện tử/,
    });
    await user.click(invoice);
    expect(invoice.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: /Hủy \/ điều chỉnh hóa đơn/ }),
    ).toBeTruthy();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Chọn nhóm nghiệp vụ" }),
      "bhxh",
    );
    expect(
      screen.getByRole("button", { name: /Không vào được cổng BHXH/ }),
    ).toBeTruthy();
    expect(
      within(navigation)
        .getByRole("button", { name: /Bảo hiểm xã hội/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
  it("has four mobile destinations and the tools dialog preserves account/data actions", async () => {
    const user = userEvent.setup();
    render(<Workspace />);
    const navigation = screen.getByRole("navigation", {
      name: "Điều hướng nhanh",
    });
    expect(
      within(navigation)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Kịch bản", "Tìm kiếm", "AI", "Công cụ"]);
    await user.click(
      within(navigation).getByRole("button", { name: "Công cụ" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Công cụ" });
    for (const name of [
      "Xuất dữ liệu",
      "Nhập dữ liệu",
      "Sao lưu / Khôi phục",
      "Thống kê kịch bản",
      "Cấu hình AI",
      "Đăng xuất",
    ])
      expect(within(dialog).getByRole("button", { name })).toBeTruthy();
    expect(
      within(navigation)
        .getByRole("button", { name: "Kịch bản" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    await user.click(within(dialog).getByRole("button", { name: "Đăng xuất" }));
    expect(state.controller!.logout).toHaveBeenCalledOnce();
  });
  it("retains full-screen search after simplifying mobile navigation", async () => {
    const user = userEvent.setup();
    render(<Workspace />);
    const navigation = screen.getByRole("navigation", {
      name: "Điều hướng nhanh",
    });
    await user.click(
      within(navigation).getByRole("button", { name: "Tìm kiếm" }),
    );
    const input = screen.getByRole("searchbox", {
      name: "Tìm kiếm toàn màn hình",
    });
    expect(document.activeElement).toBe(input);
    await user.type(input, "huy / dieu chinh");
    expect(
      await screen.findByRole("button", { name: /Hủy \/ điều chỉnh hóa đơn/ }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Đóng tìm kiếm" }));
    expect(
      screen.queryByRole("searchbox", { name: "Tìm kiếm toàn màn hình" }),
    ).toBeNull();
  });
  it("keeps internal notes and images collapsed and mounts the gallery only on demand", async () => {
    const user = userEvent.setup();
    const edit = vi.fn();
    const issue = {
      ...seedDataset().issues[0],
      images: ["data:image/png;base64,YQ=="],
      internalNotes: "Ghi chú chỉ dành nội bộ",
    };
    render(
      <IssueDetail
        issue={issue}
        progress={{ checked: {}, views: 0 }}
        disabled={false}
        onEdit={edit}
        onDelete={vi.fn()}
        onCompose={vi.fn()}
        onCheck={vi.fn()}
        onReset={vi.fn()}
        notify={vi.fn()}
        fail={vi.fn()}
      />,
    );
    const note = screen.getByText("Ghi chú nội bộ").closest("details")!;
    const images = screen.getByText("Ảnh minh họa").closest("details")!;
    expect(note.open).toBe(false);
    expect(images.open).toBe(false);
    expect(state.images).toEqual([]);
    expect(
      screen.getByRole("region", { name: "Tin gửi khách hàng" }).textContent,
    ).not.toContain(issue.internalNotes);
    await user.click(screen.getByText("Ghi chú nội bộ"));
    expect(note.open).toBe(true);
    await user.click(screen.getByText("Ảnh minh họa"));
    await screen.findByRole("img", { name: /Ảnh minh họa 1/ });
    expect(state.images.length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Thêm / sửa ảnh" }));
    expect(edit).toHaveBeenCalledOnce();
    await user.click(screen.getByText("Ảnh minh họa"));
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: /Ảnh minh họa 1/ })).toBeNull(),
    );
  });
});
