export type CategoryId = "cks" | "hddt" | "bhxh" | "canho" | "dautu";
export type Priority = "common" | "urgent" | "remote" | "escalate";
export interface Issue {
  id: string;
  categoryId: CategoryId;
  name: string;
  summary: string;
  steps: string[];
  script: string;
  escalation: string;
  internalNotes: string;
  priorityLabels: Priority[];
  images: string[];
  revision: number;
}
export interface Progress {
  checked: Record<string, boolean>;
  views: number;
}
export interface Dataset {
  issues: Issue[];
  progress: Record<string, Progress>;
}
export interface Backup extends Dataset {
  schemaVersion: 2;
  id: string;
  createdAt: string;
  reason: string;
}
export interface Filters {
  category: "current" | "all" | CategoryId;
  priority: "" | Priority;
  remote: boolean;
  urgent: boolean;
  hasNotes: boolean;
  noScript: boolean;
  noImage: boolean;
}
export interface Suggestion {
  issueId: string | null;
  reason: string;
  firstStep: string;
  source: "AI" | "Nội bộ";
}
