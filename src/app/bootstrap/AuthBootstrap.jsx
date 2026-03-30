import { useEffect } from "react";
import { getMe } from "../../lib/api/authApi";
import { useAuthStore } from "../../store/authStore";

export function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (bootstrapped) {
        return;
      }

      if (!token) {
        finishBootstrap();
        return;
      }

      try {
        const user = await getMe();

        if (!cancelled) {
          setSession({ token, user });
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, clearSession, finishBootstrap, setSession, token]);

  return null;
}
