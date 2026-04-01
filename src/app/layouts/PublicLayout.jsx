import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-2">
      <div className="absolute inset-0 bg-grid-fade bg-[size:34px_34px] opacity-40" />
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-brand-100 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
