import { forwardRef } from "react";
import { cn } from "../../lib/utils/cn";

export const Input = forwardRef(function Input(
  { className, label, error, hint, ...props },
  ref
) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-semibold text-app">{label}</span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-[18px] border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
          error && "border-danger focus:border-danger focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
});
