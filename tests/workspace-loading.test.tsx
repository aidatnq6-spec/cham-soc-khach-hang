// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedDataset } from "@/lib/domain/schema";
import { useWorkspace } from "@/hooks/use-workspace";
const mocks = vi.hoisted(() => ({ migrate: vi.fn(), subscribe: vi.fn() }));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    callback({ uid: "owner", email: "owner@example.com" });
    return () => {};
  },
  signOut: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));
vi.mock("@/lib/firebase/client", () => ({
  allowedEmail: "owner@example.com",
  firebaseConfigured: true,
  getFirebase: () => ({ auth: {} }),
}));
vi.mock("@/lib/firebase/repository", () => ({
  ensureMigrated: vi.fn().mockResolvedValue(undefined),
  subscribeDataset: mocks.subscribe,
}));
vi.mock("@/lib/firebase/images", () => ({
  portableDataset: async (data: unknown) => data,
}));
vi.mock("@/lib/domain/backups", () => ({
  migrateLocalBackups: mocks.migrate,
  readBackups: vi.fn().mockRejectedValue(new Error("Storage disabled")),
  cacheKey: (uid: string) => uid,
}));
vi.mock("@/lib/domain/local-store", () => ({
  writeStored: vi.fn().mockRejectedValue(new Error("Storage disabled")),
}));
afterEach(cleanup);
describe("cloud loading independent of browser backups", () => {
  it("opens the Firebase dataset when backup migration and offline caching fail", async () => {
    mocks.migrate.mockRejectedValue(
      new DOMException("Storage full", "QuotaExceededError"),
    );
    mocks.subscribe.mockImplementation(
      (_uid: string, next: (data: unknown, generation: string) => void) => {
        next(seedDataset(), "generation");
        return () => {};
      },
    );
    const { result } = renderHook(() => useWorkspace());
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.data.issues).toHaveLength(13);
    expect(result.current.fault).toBe("");
    expect(mocks.subscribe).toHaveBeenCalled();
    await waitFor(() => expect(result.current.notice).not.toBe(""));
  });
});
