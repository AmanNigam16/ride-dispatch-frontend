import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const links =
    user?.role === "driver"
      ? [{ to: "/driver", label: "Dispatch board" }]
      : [{ to: "/customer", label: "Book a ride" }];

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface-2">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-surface-2/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-xl font-semibold">Ride Dispatch</p>
            <p className="text-sm text-muted">
              {user?.role === "driver"
                ? "Live dispatch, routing, and location streaming"
                : "Fast booking, tracking, and ride status updates"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive || location.pathname.startsWith(`${link.to}/`)
                        ? "bg-brand-100 text-brand-700"
                        : "text-muted hover:bg-surface-1"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <Badge tone={user?.role === "driver" ? "accent" : "brand"}>
              {user?.role || "guest"}
            </Badge>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
