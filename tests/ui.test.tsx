// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZaloModal } from "@/components/tools";
import { IssueEditor } from "@/components/issue-editor";
import { AuthScreen } from "@/components/auth-screen";
import { seedDataset } from "@/lib/domain/schema";
import type { WorkspaceController } from "@/hooks/use-workspace";

vi.mock("@/lib/firebase/images", () => ({
  uploadImages: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/components/image-view", () => ({
  ImageView: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
describe("React user flows", () => {
  it("substitutes customer variables and copies manual edits exactly", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    render(
      <ZaloModal
        issue={{ ...seedDataset().issues[0], script: "Chào {{ten_khach}}" }}
        onClose={vi.fn()}
        notify={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText("Tên khách hàng"), "Chị Lan");
    const output = screen.getByLabelText("Tin nhắn hoàn chỉnh");
    expect((output as HTMLTextAreaElement).value).toBe("Chào Chị Lan");
    await user.clear(output);
    await user.type(output, "  Tin đã sửa riêng cho khách.  ");
    await user.click(screen.getByRole("button", { name: "Copy tin nhắn" }));
    expect(writeText).toHaveBeenCalledWith("  Tin đã sửa riêng cho khách.  ");
  });
  it("keeps every existing image when saving a text-only edit", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(true);
    const images = [
      "data:image/png;base64,YQ==",
      "data:image/jpeg;base64,Yg==",
    ];
    render(
      <IssueEditor
        issue={{ ...seedDataset().issues[0], images, revision: 1 }}
        uid="owner"
        onSave={save}
        onClose={vi.fn()}
      />,
    );
    const name = screen.getByLabelText("Tên lỗi / tình huống");
    await user.clear(name);
    await user.type(name, "Tên mới");
    await user.click(screen.getByRole("button", { name: "Lưu kịch bản" }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0].images).toEqual(images);
    expect(save.mock.calls[0][0].name).toBe("Tên mới");
  });
  it("removes only the chosen image from a multi-image draft", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(true);
    const images = [
      "data:image/png;base64,YQ==",
      "data:image/jpeg;base64,Yg==",
    ];
    render(
      <IssueEditor
        issue={{ ...seedDataset().issues[0], images, revision: 1 }}
        uid="owner"
        onSave={save}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Bỏ ảnh 1" }));
    await user.click(screen.getByRole("button", { name: "Lưu kịch bản" }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0].images).toEqual([images[1]]);
  });
  it("explains missing Firebase configuration and disables login", () => {
    const controller = {
      configured: false,
      fault: "",
      pending: false,
      authReady: true,
    } as WorkspaceController;
    render(<AuthScreen controller={controller} />);
    expect(
      (screen.getByRole("button", { name: "Đăng nhập" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(screen.getByText(/Chưa cấu hình Firebase/)).toBeTruthy();
  });
});
