import type { CategoryId, Priority } from "@/types";
export const categories: { id: CategoryId; name: string; color: string }[] = [
  { id: "cks", name: "Chữ ký số", color: "#1c3f9f" },
  { id: "hddt", name: "Hóa đơn điện tử", color: "#0f766e" },
  { id: "bhxh", name: "Bảo hiểm xã hội", color: "#7533e6" },
  { id: "canho", name: "Căn hộ cho thuê", color: "#0369a1" },
  { id: "dautu", name: "Môi giới Đầu tư", color: "#15803d" },
];
export const priorities: { id: Priority; name: string }[] = [
  { id: "common", name: "Thường gặp" },
  { id: "urgent", name: "Khẩn cấp" },
  { id: "remote", name: "Cần remote" },
  { id: "escalate", name: "Cần leo thang" },
];
export const initialFilters = {
  category: "current",
  priority: "",
  remote: false,
  urgent: false,
  hasNotes: false,
  noScript: false,
  noImage: false,
} as const;
