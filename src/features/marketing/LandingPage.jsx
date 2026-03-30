import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);

  if (bootstrapped && user) {
    return <Navigate to={user.role === "driver" ? "/driver" : "/customer"} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade bg-[size:40px_40px] opacity-30" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <Badge tone="brand">Real-time dispatch + tracking</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-tight text-app md:text-6xl">
              Book, assign, and track rides with a control room feel.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              This frontend connects your auth and ride services into a live
              customer booking experience and a dispatch-ready driver workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg">Create account</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                "Map-powered pickup and drop selection",
                "Live ride queue for drivers",
                "Socket-based ride and location updates"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-line bg-surface-1 p-4 shadow-panel"
                >
                  <p className="text-sm font-semibold text-app">{item}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[36px] border border-line bg-app p-6 text-white shadow-panel">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Dispatch pulse</p>
                  <p className="mt-1 text-3xl font-semibold">24/7 active rides</p>
                </div>
                <Badge tone="success" className="bg-emerald-400/20 text-emerald-100">
                  live
                </Badge>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { title: "Customer app", detail: "Create and follow trips instantly" },
                  { title: "Driver board", detail: "Accept requests and stream GPS" },
                  { title: "Gateway ready", detail: "Fits your NGINX and socket setup" }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-white/70">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
