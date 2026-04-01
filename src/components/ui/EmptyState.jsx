import { Card } from "./Card";

export function EmptyState({ title, description, action }) {
  return (
    <Card className="border-dashed text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-2xl">
        +
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
