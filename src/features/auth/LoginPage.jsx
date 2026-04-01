import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getMeWithToken, login } from "../../lib/api/authApi";
import { getApiErrorMessage } from "../../lib/api/getApiErrorMessage";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthShell } from "./AuthShell";

function getHomeRoute(role) {
  return role === "driver" ? "/driver" : "/customer";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const setSession = useAuthStore((state) => state.setSession);
  const pushToast = useToastStore((state) => state.pushToast);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (bootstrapped && user) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login(form);
      const authUser = await getMeWithToken(response.token);

      setSession({
        token: response.token,
        user: authUser
      });

      pushToast({
        title: "Signed in",
        description: "Your live dispatch workspace is ready.",
        tone: "success"
      });

      const destination = location.state?.from || getHomeRoute(authUser.role);
      navigate(destination, { replace: true });
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, "Unable to sign in. Please check your credentials."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Jump back into your dispatch board or customer booking flow."
      asideTitle="Move from API-first backend to a rider-ready interface."
      asideCopy="Your backend already handles auth, ride creation, assignment, and socket events. This frontend turns those services into a polished, mobile-friendly product."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          error={error}
          required
        />
        <Button className="w-full" size="lg" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Need an account?{" "}
        <Link className="font-semibold text-brand-700" to="/signup">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
