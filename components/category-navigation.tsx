"use client";
import {
  Building2,
  KeyRound,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { categories } from "@/lib/domain/catalog";
import type { CategoryId, Issue } from "@/types";

const icons = {
  cks: KeyRound,
  hddt: ReceiptText,
  bhxh: ShieldCheck,
  canho: Building2,
  dautu: TrendingUp,
};
export function CategoryNavigation({
  active,
  issues,
  onSelect,
}: {
  active: CategoryId;
  issues: Issue[];
  onSelect: (id: CategoryId) => void;
}) {
  const counts = new Map<CategoryId, number>();
  for (const issue of issues)
    counts.set(issue.categoryId, (counts.get(issue.categoryId) ?? 0) + 1);
  return (
    <nav className="category-rail" aria-label="Nhóm nghiệp vụ">
      <div className="category-rail-inner">
        <h2 className="category-heading">Nhóm nghiệp vụ</h2>
        <div className="category-links">
          {categories.map((category) => {
            const Icon = icons[category.id];
            return (
              <button
                className="category-link"
                aria-pressed={active === category.id}
                key={category.id}
                onClick={() => onSelect(category.id)}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  style={{ color: category.color }}
                />
                <span>{category.name}</span>
                <span className="category-count">
                  {counts.get(category.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <label className="category-picker">
          <span>Nhóm nghiệp vụ</span>
          <select
            aria-label="Chọn nhóm nghiệp vụ"
            value={active}
            onChange={(event) => onSelect(event.target.value as CategoryId)}
          >
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name} ({counts.get(category.id) ?? 0})
              </option>
            ))}
          </select>
        </label>
        <p className="category-total">Tổng {issues.length} kịch bản</p>
      </div>
    </nav>
  );
}
