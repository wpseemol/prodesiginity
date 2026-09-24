import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
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

      const data = await res.json();

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

      await setDashboardSession(
        data.accessToken,
        data.refreshToken,
        user,
        typeof data.refreshExpiresInDays === "number"
          ? data.refreshExpiresInDays
          : undefined,
      );
      navigate(nextPath);
    } catch {
      setStatus("error");
      setError("Could not reach the server. Please try again.");
    }
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-1.5 text-center sm:text-left">
        <p className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:mx-0">
          {badgeText}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
        <Input
          id="login"
          type="text"
          name="login"
          autoComplete="username"
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="admin or you@prodesignity.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pr-10"
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

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2Icon className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
