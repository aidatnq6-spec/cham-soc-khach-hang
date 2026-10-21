import { parseDataset } from "./schema";
import type { Backup, Dataset } from "@/types";
import { readStored, updateStored } from "./local-store";
export const cacheKey = (uid: string) => `cskh-v2-${uid}`;
export const backupKey = (uid: string) => `cskh-backups-v2-${uid}`;
function normalizeBackups(raw: unknown): Backup[] {
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
}
interface BackupStore {
  migrated: true;
  backups: Backup[];
}
function envelope(value: unknown): BackupStore {
  const data = value as Partial<BackupStore> | undefined;
  return { migrated: true, backups: normalizeBackups(data?.backups) };
}
function readLegacy(key: string): unknown {
  const value = localStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}
export async function migrateLocalBackups(uid: string): Promise<void> {
  const key = backupKey(uid);
  if ((await readStored<BackupStore>(key))?.migrated) return;
  const v2 = normalizeBackups(readLegacy(key));
  const raw = readLegacy("it-support-backups-v1");
  const v1 = normalizeBackups(
    Array.isArray(raw)
      ? raw.map((item) => ({
          ...item?.data,
          id: item?.id,
          reason: item?.reason,
          createdAt: item?.createdAt,
        }))
      : [],
  );
  await updateStored(key, (previous) => {
    if ((previous as BackupStore | undefined)?.migrated)
      return envelope(previous);
    const unique = new Map(
      [...envelope(previous).backups, ...v2, ...v1].map((backup) => [
        backup.id,
        backup,
      ]),
    );
    return {
      migrated: true as const,
      backups: [...unique.values()]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 12),
    };
  });
  // Original localStorage backups are retained; no quota-sensitive setItem is used.
}
export async function readBackups(uid: string): Promise<Backup[]> {
  await migrateLocalBackups(uid);
  return envelope(await readStored(backupKey(uid))).backups;
}
export async function addBackup(
  uid: string,
  dataset: Dataset,
  reason: string,
): Promise<Backup> {
  const backup: Backup = {
    ...structuredClone(dataset),
    id: crypto.randomUUID(),
    schemaVersion: 2,
    createdAt: new Date().toISOString(),
    reason,
  };
  await migrateLocalBackups(uid);
  await updateStored(backupKey(uid), (previous) => ({
    migrated: true as const,
    backups: [backup, ...envelope(previous).backups].slice(0, 12),
  }));
  return backup;
}
export async function deleteBackup(uid: string, id: string): Promise<Backup[]> {
  await migrateLocalBackups(uid);
  const result = await updateStored(backupKey(uid), (previous) => ({
    migrated: true as const,
    backups: envelope(previous).backups.filter((backup) => backup.id !== id),
  }));
  return result.backups;
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
