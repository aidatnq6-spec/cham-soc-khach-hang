import { categories, priorities } from "./catalog";
import type { CategoryId, Filters, Issue, Suggestion } from "@/types";
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}
export function searchText(issue: Issue) {
  return normalize(
    [
      issue.name,
      issue.summary,
      issue.script,
      issue.escalation,
      issue.internalNotes,
      ...issue.steps,
      categories.find((c) => c.id === issue.categoryId)?.name,
      ...priorities
        .filter((p) => issue.priorityLabels.includes(p.id))
        .map((p) => p.name),
    ].join(" "),
  );
}
export function filterIssues(
  issues: Issue[],
  query: string,
  active: CategoryId,
  filters: Filters,
) {
  const keyword = normalize(query);
  return issues.filter((i) => {
    if (filters.category === "current" && !keyword && i.categoryId !== active)
      return false;
    if (
      filters.category !== "current" &&
      filters.category !== "all" &&
      i.categoryId !== filters.category
    )
      return false;
    return (
      (!keyword || searchText(i).includes(keyword)) &&
      (!filters.priority || i.priorityLabels.includes(filters.priority)) &&
      (!filters.remote || i.priorityLabels.includes("remote")) &&
      (!filters.urgent || i.priorityLabels.includes("urgent")) &&
      (!filters.hasNotes || !!i.internalNotes.trim()) &&
      (!filters.noScript || !i.script.trim()) &&
      (!filters.noImage || !i.images.length)
    );
  });
}
export function suggestLocally(issues: Issue[], text: string): Suggestion {
  const words = [
    ...new Set(
      normalize(text)
        .split(/\W+/)
        .filter((w) => w.length > 2),
    ),
  ];
  const scored = issues
    .map((i) => ({
      issue: i,
      score: words.filter((w) => searchText(i).includes(w)).length,
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  return {
    issueId: best?.score ? best.issue.id : null,
    reason: best?.score
      ? "Đối chiếu từ khóa với kho kịch bản hiện có."
      : "Chưa tìm thấy kịch bản phù hợp.",
    firstStep: best?.score ? (best.issue.steps[0] ?? "") : "",
    source: "Nội bộ",
  };
}
