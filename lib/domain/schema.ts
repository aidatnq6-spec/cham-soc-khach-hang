import { z } from "zod";
import seed from "./seed.json";
import type { Dataset, Issue } from "@/types";

const id = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
const image = z
  .string()
  .max(2_000_000)
  .refine(
    (value) =>
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ||
      /^users\/[A-Za-z0-9_-]+\/issues\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(
        value,
      ),
    "Ảnh không hợp lệ",
  );
export const issueSchema = z
  .object({
    id,
    categoryId: z.enum(["cks", "hddt", "bhxh", "canho", "dautu"]),
    name: z.string().trim().min(1).max(300),
    summary: z.string().max(2000).default(""),
    steps: z.array(z.string().max(5000)).max(100).default([]),
    script: z.string().max(30000).default(""),
    escalation: z.string().max(10000).default(""),
    internalNotes: z.string().max(10000).default(""),
    priorityLabels: z
      .array(z.enum(["common", "urgent", "remote", "escalate"]))
      .max(4)
      .default([]),
    image: z.string().optional(),
    images: z.array(image).max(30).optional(),
    revision: z.number().int().nonnegative().default(0),
  })
  .transform(({ image: oldImage, images, ...rest }) => ({
    ...rest,
    images: images?.length ? images : oldImage ? [image.parse(oldImage)] : [],
  }));
const progressSchema = z.record(
  id,
  z.object({
    checked: z.record(z.string().regex(/^\d{1,3}$/), z.boolean()),
    views: z.number().int().nonnegative(),
  }),
);
const payloadSchema = z.object({
  issues: z.array(issueSchema).max(2000),
  progress: progressSchema.optional(),
  checklistState: z
    .record(id, z.record(z.string().regex(/^\d{1,3}$/), z.boolean()))
    .optional(),
  viewCounts: z.record(id, z.number().int().nonnegative()).optional(),
});

export function parseDataset(input: unknown): Dataset {
  const data = payloadSchema.parse(
    Array.isArray(input) ? { issues: input } : input,
  );
  if (new Set(data.issues.map((i) => i.id)).size !== data.issues.length)
    throw new Error("Có ID kịch bản trùng nhau.");
  const progress: Dataset["progress"] = {};
  for (const issue of data.issues) {
    progress[issue.id] = data.progress?.[issue.id] ?? {
      checked: data.checklistState?.[issue.id] ?? {},
      views: data.viewCounts?.[issue.id] ?? 0,
    };
  }
  return { issues: data.issues, progress };
}

export function seedDataset(): Dataset {
  return parseDataset(seed);
}
export function migrationSource(cloud: unknown, local: unknown): Dataset {
  // An empty cloud dataset is intentional, and must never be replaced by seeds/local data.
  return cloud !== undefined && cloud !== null
    ? parseDataset(cloud)
    : local !== undefined && local !== null
      ? parseDataset(local)
      : seedDataset();
}
export function blankIssue(categoryId: Issue["categoryId"]): Issue {
  return {
    id: crypto.randomUUID(),
    categoryId,
    name: "",
    summary: "",
    steps: [],
    script: "",
    escalation: "",
    internalNotes: "",
    priorityLabels: [],
    images: [],
    revision: 0,
  };
}
export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError)
    return "Dữ liệu không hợp lệ: kiểm tra tên, nhóm, nhãn, ID và ảnh trong file.";
  if (error && typeof error === "object" && "code" in error) {
    const code = String(error.code);
    if (code.startsWith("auth/"))
      return "Đăng nhập không thành công. Kiểm tra email, mật khẩu và kết nối Firebase.";
    if (code.includes("permission-denied") || code.includes("unauthorized"))
      return "Không có quyền truy cập. Kiểm tra Firestore/Storage rules và tài khoản.";
    if (code.includes("storage/"))
      return "Không xử lý được ảnh. Kiểm tra Firebase Storage, rules và kết nối mạng.";
    if (code.includes("unavailable"))
      return "Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.";
  }
  return error instanceof Error
    ? error.message
    : "Thao tác chưa thành công. Vui lòng thử lại.";
}
