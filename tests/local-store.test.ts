import { beforeEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import {
  addBackup,
  backupKey,
  deleteBackup,
  migrateLocalBackups,
  readBackups,
} from "@/lib/domain/backups";
import {
  readStored,
  writeStored,
  updateStored,
  removeStored,
} from "@/lib/domain/local-store";
import { seedDataset } from "@/lib/domain/schema";

describe("IndexedDB storage and legacy quota regression", () => {
  let local: Map<string, string>;
  beforeEach(() => {
    local = new Map();
    vi.stubGlobal("indexedDB", new IDBFactory());
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: vi.fn(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      }),
    });
  });
  it("migrates image-heavy v1 backups without writing to full localStorage", async () => {
    const data = seedDataset();
    data.issues[0].images = ["data:image/jpeg;base64," + "a".repeat(1_000_000)];
    const old = JSON.stringify([
      {
        id: "old-1",
        reason: "Bản cũ",
        createdAt: "2026-10-20T00:00:00Z",
        data,
      },
    ]);
    local.set("it-support-backups-v1", old);
    await migrateLocalBackups("owner");
    expect((await readBackups("owner"))[0].issues[0].images).toEqual(
      data.issues[0].images,
    );
    expect(local.get("it-support-backups-v1")).toBe(old);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it("merges v1 and v2 once and does not resurrect deleted backups", async () => {
    const data = seedDataset();
    local.set(
      "it-support-backups-v1",
      JSON.stringify([
        { id: "v1", reason: "Old", createdAt: "2026-10-19T00:00:00Z", data },
      ]),
    );
    local.set(
      backupKey("owner"),
      JSON.stringify([
        {
          ...data,
          schemaVersion: 2,
          id: "v2",
          reason: "New",
          createdAt: "2026-10-20T00:00:00Z",
        },
      ]),
    );
    expect((await readBackups("owner")).map((b) => b.id)).toEqual(["v2", "v1"]);
    await deleteBackup("owner", "v1");
    await migrateLocalBackups("owner");
    expect((await readBackups("owner")).map((b) => b.id)).toEqual(["v2"]);
  });
  it("retains concurrent backups without lost updates", async () => {
    await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        addBackup("owner", { issues: [], progress: {} }, `Version ${i}`),
      ),
    );
    expect(await readBackups("owner")).toHaveLength(8);
  });
  it("stores large offline data and removes it without localStorage writes", async () => {
    const data = { text: "x".repeat(6_000_000) };
    await writeStored("cache", data);
    expect(await readStored("cache")).toEqual(data);
    await removeStored("cache");
    expect(await readStored("cache")).toBeUndefined();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it("rolls back a failed update and reports a storage failure", async () => {
    await writeStored("value", 1);
    await expect(
      updateStored("value", () => {
        throw new Error("Cannot update");
      }),
    ).rejects.toThrow("Cannot update");
    expect(await readStored("value")).toBe(1);
    vi.stubGlobal("indexedDB", undefined);
    await expect(writeStored("value", 2)).rejects.toThrow("chưa cho phép");
  });
});
