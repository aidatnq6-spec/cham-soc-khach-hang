"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function ActionMenu({
  label,
  icon,
  children,
  className = "",
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        details.current?.open &&
        !details.current.contains(event.target as Node)
      )
        details.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && details.current?.open) {
        event.preventDefault();
        details.current.open = false;
        details.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details className={`action-menu ${className}`} ref={details}>
      <summary>
        {icon}
        <span>{label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div
        className="action-popover"
        role="group"
        aria-label={label}
        onClick={(event) => {
          if (
            (event.target as Element).closest("button:not(:disabled)") &&
            details.current
          ) {
            details.current.open = false;
            details.current.querySelector("summary")?.focus();
          }
        }}
      >
        {children}
      </div>
    </details>
  );
}
