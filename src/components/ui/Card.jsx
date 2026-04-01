import { cn } from "../../lib/utils/cn";

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-line bg-surface-1 p-6 shadow-panel",
        className
      )}
    >
      {children}
    </div>
  );
}
