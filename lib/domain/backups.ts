import { parseDataset } from "./schema";
import type { Backup, Dataset } from "@/types";
export const cacheKey = (uid: string) => `cskh-v2-${uid}`;
export const backupKey = (uid: string) => `cskh-backups-v2-${uid}`;
export function readBackups(uid: string): Backup[] {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(backupKey(uid)) ?? "[]",
    );
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 12).flatMap((item) => {
      try {
        if (
          typeof item.id !== "string" ||
          typeof item.reason !== "string" ||
          !Number.isFinite(Date.parse(item.createdAt))
        )
          return [];
        return [
          {
            ...parseDataset(item),
            schemaVersion: 2 as const,
            id: item.id,
            createdAt: item.createdAt,
            reason: item.reason,
          },
        ];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function addBackup(
  uid: string,
  dataset: Dataset,
  reason: string,
): Backup {
  const backup: Backup = {
    ...structuredClone(dataset),
    id: crypto.randomUUID(),
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    reason,
  };
  localStorage.setItem(
    backupKey(uid),
    JSON.stringify([backup, ...readBackups(uid)].slice(0, 12)),
  );
  return backup;
}
export function migrateLocalBackups(uid: string) {
  if (localStorage.getItem(backupKey(uid)) !== null) return;
  let old: unknown;
  try {
    old = JSON.parse(localStorage.getItem("it-support-backups-v1") ?? "[]");
  } catch {
    old = [];
  }
  if (!Array.isArray(old)) return;
  const backups = old.slice(0, 12).flatMap((item) => {
    try {
      return [
        {
          ...parseDataset(item.data),
          id: String(item.id),
          schemaVersion: 2,
          reason: String(item.reason),
          createdAt: String(item.createdAt),
        },
      ];
    } catch {
      return [];
    }
  });
  localStorage.setItem(backupKey(uid), JSON.stringify(backups));
}
export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
