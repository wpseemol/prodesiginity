import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "../config";

type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

function dashboardPathForRole(role: string): string | null {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employee";
  return null;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(
          typeof data.message === "string"
            ? data.message
            : "Invalid email or password.",
        );
        return;
      }

      const user = data.user as AuthUser | undefined;
      const nextPath = user ? dashboardPathForRole(user.role) : null;

      if (!user || !nextPath) {
        setStatus("error");
        setError("This account does not have staff dashboard access.");
        return;
      }

      localStorage.setItem("dashboard_token", data.token);
      localStorage.setItem("dashboard_user", JSON.stringify(user));
      navigate(nextPath);
    } catch {
      setStatus("error");
      setError("Could not reach the server. Please try again.");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <p className="login-form__eyebrow">Staff Portal</p>
        <h1>Sign in</h1>
        <p className="login-form__subtitle">
          Access your admin or employee dashboard.
        </p>
      </div>

      {error && (
        <div className="login-form__alert" role="alert">
          {error}
        </div>
      )}

      <label className="login-form__field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@prodesignity.com"
        />
      </label>

      <label className="login-form__field">
        <span>Password</span>
        <div className="login-form__password">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="login-form__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <button
        type="submit"
        className="login-form__submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
