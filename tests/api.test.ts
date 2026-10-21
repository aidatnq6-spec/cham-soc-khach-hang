import { describe, it, expect, vi } from "vitest";
import {
  createDiagnoseHandler,
  type DiagnoseDependencies,
} from "@/lib/server/diagnose";
import { seedDataset } from "@/lib/domain/schema";
function setup(overrides: Partial<DiagnoseDependencies> = {}) {
  const deps: DiagnoseDependencies = {
    verify: vi
      .fn()
      .mockResolvedValue({ uid: "owner", email: "owner@example.com" }),
    catalogue: vi.fn().mockResolvedValue(seedDataset().issues),
    key: () => "test-key",
    model: () => "test-model",
    allowedEmail: () => "owner@example.com",
    fetch: vi.fn().mockImplementation(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                issueId: "seed-001",
                reason: "Match",
                firstStep: "Check",
              }),
            },
          },
        ],
      }),
    ),
    ...overrides,
  };
  return { deps, post: createDiagnoseHandler(deps) };
}
const request = (text = "token khong nhan", authorized = true) =>
  new Request("http://localhost/api/diagnose", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorized ? { Authorization: "Bearer test-token" } : {}),
    },
    body: JSON.stringify({ text }),
  });
describe("authenticated AI endpoint", () => {
  it("rejects missing token without reading data or calling provider", async () => {
    const { post, deps } = setup();
    expect((await post(request("", false))).status).toBe(401);
    expect(deps.catalogue).not.toHaveBeenCalled();
    expect(deps.fetch).not.toHaveBeenCalled();
  });
  it("rejects another email", async () => {
    const { post, deps } = setup({
      verify: vi
        .fn()
        .mockResolvedValue({ uid: "other", email: "other@example.com" }),
    });
    expect((await post(request())).status).toBe(403);
    expect(deps.fetch).not.toHaveBeenCalled();
  });
  it("rejects invalid tokens", async () => {
    const { post } = setup({
      verify: vi.fn().mockRejectedValue(new Error("bad token")),
    });
    expect((await post(request())).status).toBe(401);
  });
  it("reports unconfigured provider without sending data", async () => {
    const { post, deps } = setup({ key: () => undefined });
    expect((await post(request())).status).toBe(503);
    expect(deps.fetch).not.toHaveBeenCalled();
  });
  it("rejects malformed or oversized input, including chunked bodies", async () => {
    const { post, deps } = setup();
    expect((await post(request(""))).status).toBe(400);
    expect((await post(request("x".repeat(4000)))).status).toBe(400);
    expect((await post(request("x".repeat(17000)))).status).toBe(413);
    expect(deps.fetch).not.toHaveBeenCalled();
  });
  it("loads only the verified owner catalogue and returns a known ID", async () => {
    const { post, deps } = setup();
    const response = await post(request());
    expect(response.status).toBe(200);
    expect(deps.catalogue).toHaveBeenCalledWith("owner");
    expect((await response.json()).issueId).toBe("seed-001");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects a hallucinated provider ID", async () => {
    const { post } = setup({
      fetch: vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content: '{"issueId":"fake","reason":"x","firstStep":"y"}',
              },
            },
          ],
        }),
      ),
    });
    expect((await post(request())).status).toBe(502);
  });
  it("handles provider/network failures without exposing provider details or key", async () => {
    const { post } = setup({
      fetch: vi.fn().mockRejectedValue(new Error("test-key private details")),
    });
    const response = await post(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("test-key");
  });
  it("limits repeated usage per verified uid", async () => {
    const { post } = setup();
    for (let i = 0; i < 10; i++)
      expect((await post(request())).status).toBe(200);
    expect((await post(request())).status).toBe(429);
  });
});
