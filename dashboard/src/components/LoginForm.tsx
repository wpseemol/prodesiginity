import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  UserIcon,
} from "lucide-react";
import { apiBaseUrl } from "@/config";
import { setDashboardSession, type DashboardUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function dashboardPathForRole(role: string): string | null {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employee";
  return null;
}

type LoginFormProps = {
  badgeText?: string;
  title?: string;
  subtitle?: string;
};

export default function LoginForm({
  badgeText = "Staff portal",
  title = "Sign in to your account",
  subtitle = "Use your username or email to access the ProDesignity dashboard.",
}: LoginFormProps) {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
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
        body: JSON.stringify({ login, password }),
      });

      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        setStatus("error");
        setError("Server returned an invalid response. Please try again.");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setError(
          typeof data.message === "string"
            ? data.message
            : "Invalid username/email or password.",
        );
        return;
      }

      const user = data.user as DashboardUser | undefined;
      const nextPath = user ? dashboardPathForRole(user.role) : null;

      if (!user || !data.accessToken || !data.refreshToken || !nextPath) {
        setStatus("error");
        setError("This account does not have staff dashboard access.");
        return;
      }

      try {
        await setDashboardSession(
          data.accessToken as string,
          data.refreshToken as string,
          user,
          typeof data.refreshExpiresInDays === "number"
            ? data.refreshExpiresInDays
            : undefined,
        );
      } catch {
        setStatus("error");
        setError("Signed in, but saving the session failed. Please try again.");
        return;
      }

      navigate(nextPath);
    } catch {
      setStatus("error");
      setError(
        `Could not reach the API at ${apiBaseUrl}. Is the backend running on port 4000?`,
      );
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          {badgeText}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="login">Username or email</Label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login"
            type="text"
            name="login"
            autoComplete="username"
            required
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="admin or you@prodesignity.com"
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-11 pr-10 pl-9"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="group h-11 w-full bg-gradient-to-r from-primary to-brand-violet text-white shadow-lg shadow-primary/25 hover:opacity-95"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <>
            <Loader2Icon className="animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Forgot your password? Ask an administrator to reset it.
      </p>
    </form>
  );
}
