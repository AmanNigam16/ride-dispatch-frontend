import { cn } from "../../lib/utils/cn";

const variants = {
  primary:
    "bg-brand-500 text-white shadow-glow hover:bg-brand-700 focus-visible:outline-brand-500",
  secondary:
    "bg-surface-1 text-app border border-line hover:bg-surface-2 focus-visible:outline-brand-500",
  ghost:
    "bg-transparent text-app hover:bg-surface-2 focus-visible:outline-brand-500",
  danger:
    "bg-danger text-white hover:opacity-90 focus-visible:outline-danger"
};

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  sm: "h-9 px-4 text-sm"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
