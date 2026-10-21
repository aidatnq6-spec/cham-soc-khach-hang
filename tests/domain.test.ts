import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  parseDataset,
  migrationSource,
  seedDataset,
} from "@/lib/domain/schema";
import { filterIssues, normalize, suggestLocally } from "@/lib/domain/search";
import { composeMessage } from "@/lib/domain/templates";
import { initialFilters } from "@/lib/domain/catalog";
import { addBackup, readBackups } from "@/lib/domain/backups";
import { IDBFactory } from "fake-indexeddb";

describe("legacy compatibility and migration", () => {
  it("contains all 13 original scripts with stable IDs including MISA", () => {
    const data = seedDataset();
    expect(data.issues).toHaveLength(13);
    expect(data.issues.some((i) => i.name === "Lỗi ký trong MISA")).toBe(true);
    expect(seedDataset()).toEqual(data);
  });
  it("preserves empty cloud state instead of seeding or loading stale local data", () => {
    expect(migrationSource({ issues: [] }, seedDataset()).issues).toEqual([]);
  });
  it("prefers cloud over local and preserves old checklists/views/notes/images", () => {
    const issue = {
      ...seedDataset().issues[0],
      internalNotes: "Ghi chú",
      images: undefined,
      image: "data:image/png;base64,aGVsbG8=",
    };
    const data = migrationSource(
      {
        issues: [issue],
        checklistState: { [issue.id]: { "0": true } },
        viewCounts: { [issue.id]: 7 },
      },
      seedDataset(),
    );
    expect(data.issues[0].images).toEqual([issue.image]);
    expect(data.issues[0].internalNotes).toBe("Ghi chú");
    expect(data.progress[issue.id]).toEqual({
      checked: { "0": true },
      views: 7,
    });
  });
  it("reads old array exports and full v2 backups", () => {
    const data = seedDataset();
    expect(parseDataset(data.issues).issues).toEqual(data.issues);
    expect(parseDataset({ ...data, schemaVersion: 2, id: "backup" })).toEqual(
      data,
    );
  });
  it("rejects duplicate IDs, unknown groups, malformed progress and unsafe image URLs", () => {
    const issue = seedDataset().issues[0];
    expect(() => parseDataset([issue, issue])).toThrow();
    expect(() => parseDataset([{ ...issue, categoryId: "unknown" }])).toThrow();
    expect(() =>
      parseDataset({ issues: [issue], viewCounts: { [issue.id]: -1 } }),
    ).toThrow();
    expect(() =>
      parseDataset([{ ...issue, images: ["javascript:alert(1)"] }]),
    ).toThrow();
    expect(() => parseDataset([{ ...issue, id: "../path" }])).toThrow();
  });
  it("keeps multi-image galleries after text editing", () => {
    const issue = {
      ...seedDataset().issues[0],
      images: ["data:image/png;base64,YQ==", "data:image/jpeg;base64,Yg=="],
    };
    expect(
      parseDataset([{ ...issue, name: "Sửa văn bản" }]).issues[0].images,
    ).toEqual(issue.images);
  });
});
describe("search and message composition", () => {
  it("searches accents and đ consistently across groups", () => {
    expect(normalize("HÓA ĐƠN điện tử")).toBe("hoa don dien tu");
    const matches = filterIssues(seedDataset().issues, "hoa don", "cks", {
      ...initialFilters,
    });
    expect(matches.some((i) => i.categoryId === "hddt")).toBe(true);
  });
  it("combines advanced filters", () => {
    const issue = {
      ...seedDataset().issues[0],
      priorityLabels: ["urgent" as const],
      internalNotes: "Note",
    };
    expect(
      filterIssues([issue], "", "cks", {
        ...initialFilters,
        urgent: true,
        noImage: true,
        hasNotes: true,
      }),
    ).toHaveLength(1);
    expect(
      filterIssues([issue], "", "cks", { ...initialFilters, remote: true }),
    ).toHaveLength(0);
  });
  it("substitutes variables once without duplicating customer context", () => {
    expect(
      composeMessage("Chào {{ TEN_KHACH }} — MST {{mst}}", {
        ten_khach: "Lan",
        mst: "123",
        phan_mem: "MISA",
      }),
    ).toBe("Phần mềm/hệ thống: MISA\n\nChào Lan — MST 123");
  });
  it("returns no local suggestion for empty/irrelevant text", () => {
    expect(suggestLocally(seedDataset().issues, "").issueId).toBeNull();
    expect(
      suggestLocally(seedDataset().issues, "xxxxxxxxxxxxxxxxx").issueId,
    ).toBeNull();
    expect(
      suggestLocally(seedDataset().issues, "usb token khong nhan").issueId,
    ).not.toBeNull();
  });
});
describe("backup retention", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", new IDBFactory());
    const map = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => map.set(key, value),
    });
  });
  it("retains 12 copies, accepts empty state and isolates owners", async () => {
    for (let i = 0; i < 15; i++)
      await addBackup("owner-a", { issues: [], progress: {} }, `Version ${i}`);
    expect(await readBackups("owner-a")).toHaveLength(12);
    expect(await readBackups("owner-b")).toEqual([]);
    expect((await readBackups("owner-a"))[0].reason).toBe("Version 14");
  });
});
