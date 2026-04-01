import { Card } from "../../components/ui/Card";

export function AuthShell({ title, subtitle, children, asideTitle, asideCopy }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="max-w-xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
          Ride Dispatch
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-app md:text-5xl">
          {asideTitle}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">{asideCopy}</p>
      </div>
      <Card className="mx-auto w-full max-w-xl p-8 sm:p-10">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
}
