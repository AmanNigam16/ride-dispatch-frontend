import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getMeWithToken, login, signup } from "../../lib/api/authApi";
import { getApiErrorMessage } from "../../lib/api/getApiErrorMessage";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthShell } from "./AuthShell";

function getHomeRoute(role) {
  return role === "driver" ? "/driver" : "/customer";
}

export function SignupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const setSession = useAuthStore((state) => state.setSession);
  const pushToast = useToastStore((state) => state.pushToast);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
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
      await signup(form);
      const authResponse = await login({
        email: form.email,
        password: form.password
      });
      const authUser = await getMeWithToken(authResponse.token);

      setSession({
        token: authResponse.token,
        user: authUser
      });

      pushToast({
        title: "Account created",
        description: "You're ready to start using the live ride platform.",
        tone: "success"
      });

      navigate(getHomeRoute(authUser.role), { replace: true });
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, "Unable to create your account right now."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Choose whether this session should operate as a customer or a driver."
      asideTitle="One app, two real-time work modes."
      asideCopy="Customers can request and track rides, while drivers get a dispatch queue, live status controls, and GPS streaming for active trips."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
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
          autoComplete="new-password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          required
        />
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-app">Role</span>
          <select
            className="w-full rounded-[18px] border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value }))
            }
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-700" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
