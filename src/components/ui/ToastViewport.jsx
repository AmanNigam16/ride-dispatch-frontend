import { useToastStore } from "../../store/toastStore";
import { Button } from "./Button";

const toneClasses = {
  brand: "border-brand-100",
  accent: "border-orange-200",
  success: "border-emerald-200",
  warning: "border-amber-200",
  danger: "border-red-200"
};

export function ToastViewport() {
  const items = useToastStore((state) => state.items);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-[22px] border bg-surface-1 p-4 shadow-panel ${toneClasses[item.tone] || toneClasses.brand}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              ) : null}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => dismissToast(item.id)}
            >
              x
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
