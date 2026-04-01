import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "../components/PageLoader";
import { useAuthStore } from "../../store/authStore";

export function RoleGuard({ allowedRoles }) {
  const location = useLocation();
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!bootstrapped) {
    return <PageLoader />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "driver" ? "/driver" : "/customer"} replace />;
  }

  return <Outlet />;
}
