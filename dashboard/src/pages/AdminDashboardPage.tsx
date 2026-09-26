import { useEffect, useState, type ComponentType, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  DicesIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
  LayoutTemplateIcon,
  ArrowRightIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  SettingsIcon,
  ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StaffPhoto = {
  id: number;
  url: string;
  altText: string | null;
};

type StaffUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: "admin" | "employer";
  created_at: string;
  photo?: StaffPhoto | null;
};

type AnalyticsOverview = {
  days: number;
  totalVisits: number;
  uniqueSessions: number;
  byCountry: { country: string; count: number }[];
  byDevice: { key: string; count: number }[];
  byBrowser: { key: string; count: number }[];
  byPath: { path: string; count: number }[];
  recent: {
    id: number;
    path: string;
    country: string | null;
    countryCode: string | null;
    deviceType: string | null;
    browser: string | null;
    referrer: string | null;
    createdAt: string;
  }[];
  tracking: {
    enabled: boolean;
    metaPixel: boolean;
    googleTag: boolean;
    googleAds: boolean;
    metaCapi: boolean;
    googleEnhancedConversions: boolean;
  };
  demographicsNote: string;
};

function staffInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Meets backend password rules: 8+, upper, lower, digit, special. */
function generateStaffPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@$!%*?&#_-";
  const all = upper + lower + digits + special;
  const pick = (pool: string) =>
    pool[Math.floor(Math.random() * pool.length)]!;
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = chars.length; i < length; i += 1) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatusPill({ on, label }: { on: boolean; label: string }) {
  return (
    <Badge variant={on ? "default" : "secondary"} className="font-normal">
      {label}: {on ? "on" : "off"}
    </Badge>
  );
}

function AdminOverview({ userName }: { userName: string }) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/admin/users");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setListError(
            typeof data.message === "string"
              ? data.message
              : "Could not load staff accounts.",
          );
          return;
        }
        setListError(null);
        setStaff(data.users ?? []);
      } catch {
        if (!cancelled) setListError("Could not reach the server.");
      }
    })();

    void (async () => {
      try {
        const res = await apiFetch("/admin/analytics/overview?days=30");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setAnalyticsError(
            typeof data.message === "string"
              ? data.message
              : "Could not load visitor analytics.",
          );
          return;
        }
        setAnalyticsError(null);
        setAnalytics(data as AnalyticsOverview);
      } catch {
        if (!cancelled) setAnalyticsError("Could not reach the server.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const adminCount = staff.filter((member) => member.role === "admin").length;
  const employeeCount = staff.filter(
    (member) => member.role === "employer",
  ).length;
  const topCountry = analytics?.byCountry[0];
  const topDevice = analytics?.byDevice[0];

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back, {userName.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Website visitors, staff accounts, and tracking status.
        </p>
      </div>

      {listError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load overview</AlertTitle>
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      ) : null}

      {analyticsError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load visitor analytics</AlertTitle>
          <AlertDescription>{analyticsError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Site visits"
          value={analytics?.totalVisits ?? "—"}
          hint={`Last ${analytics?.days ?? 30} days`}
          icon={ActivityIcon}
        />
        <StatCard
          title="Sessions"
          value={analytics?.uniqueSessions ?? "—"}
          hint="Approximate unique visitors"
          icon={GlobeIcon}
        />
        <StatCard
          title="Top country"
          value={topCountry?.country ?? "—"}
          hint={
            topCountry
              ? `${topCountry.count} visits`
              : "Waiting for traffic"
          }
          icon={GlobeIcon}
        />
        <StatCard
          title="Top device"
          value={topDevice?.key ?? "—"}
          hint={
            topDevice ? `${topDevice.count} visits` : "Waiting for traffic"
          }
          icon={MonitorSmartphoneIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitors by country</CardTitle>
            <CardDescription>
              First-party visits from the marketing site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.byCountry.length ? (
              <ul className="grid gap-2">
                {analytics.byCountry.map((row) => {
                  const max = analytics.byCountry[0]?.count || 1;
                  const pct = Math.round((row.count / max) * 100);
                  return (
                    <li key={row.country} className="grid gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{row.country}</span>
                        <span className="text-muted-foreground">
                          {row.count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No visits yet. Enable tracking in Settings and browse the
                website.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitor type</CardTitle>
            <CardDescription>
              Device and browser mix. Age &amp; gender live in Meta / GA4.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {(analytics?.byDevice ?? []).map((row) => (
                <div
                  key={row.key}
                  className="rounded-xl border bg-muted/20 px-3 py-2"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {row.key}
                  </p>
                  <p className="text-lg font-semibold">{row.count}</p>
                </div>
              ))}
              {!analytics?.byDevice.length ? (
                <p className="col-span-2 text-sm text-muted-foreground">
                  Device breakdown appears after the first tracked visits.
                </p>
              ) : null}
            </div>
            <Alert>
              <AlertTitle>Age &amp; gender</AlertTitle>
              <AlertDescription>
                {analytics?.demographicsNote ??
                  "Connect Meta Pixel and GA4 in Settings, then open Meta Ads Manager and GA4 Demographics for age and gender."}
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                on={Boolean(analytics?.tracking.enabled)}
                label="Tracking"
              />
              <StatusPill
                on={Boolean(analytics?.tracking.metaPixel)}
                label="Meta Pixel"
              />
              <StatusPill
                on={Boolean(analytics?.tracking.googleTag)}
                label="GA4"
              />
              <StatusPill
                on={Boolean(analytics?.tracking.metaCapi)}
                label="Meta CAPI"
              />
              <StatusPill
                on={Boolean(analytics?.tracking.googleEnhancedConversions)}
                label="Google Enhanced"
              />
            </div>
            <Button
              render={<Link to="/admin/settings" />}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              <SettingsIcon />
              Open tracking settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent page views</CardTitle>
          <CardDescription>
            Latest paths and countries hitting prodesignity.com.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.recent.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[180px] truncate font-medium">
                      {row.path}
                    </TableCell>
                    <TableCell>{row.country ?? "—"}</TableCell>
                    <TableCell className="capitalize">
                      {row.deviceType ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recent views yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total staff"
          value={staff.length}
          hint="Admins and employees"
          icon={UsersIcon}
        />
        <StatCard
          title="Admins"
          value={adminCount}
          hint="Full console access"
          icon={ShieldCheckIcon}
        />
        <StatCard
          title="Employees"
          value={employeeCount}
          hint="Employer role accounts"
          icon={UserPlusIcon}
        />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutTemplateIcon className="size-4 text-primary" />
              Homepage customization
            </CardTitle>
            <CardDescription>
              Edit hero, pricing, brands, videos, and other marketing site
              sections.
            </CardDescription>
          </div>
          <Button render={<Link to="/admin/homepage" />} size="sm">
            Open editor
            <ArrowRightIcon />
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent team</CardTitle>
          <CardDescription>
            Latest accounts currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable staff={staff.slice(0, 5)} emptyLabel="No staff yet." />
        </CardContent>
      </Card>
    </div>
  );
}

function StaffTable({
  staff,
  emptyLabel,
}: {
  staff: StaffUser[];
  emptyLabel: string;
}) {
  if (staff.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  {mediaUrl(member.photo?.url) ? (
                    <AvatarImage
                      src={mediaUrl(member.photo?.url)}
                      alt={member.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {staffInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.fullName}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              @{member.username}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {member.email}
            </TableCell>
            <TableCell>
              <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                {member.role === "admin" ? "Admin" : "Employee"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AdminStaffManager() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "employer">("employer");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [listError, setListError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      const res = await apiFetch("/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setListError(
          typeof data.message === "string"
            ? data.message
            : "Could not load staff accounts.",
        );
        return;
      }
      setListError(null);
      setStaff(data.users ?? []);
    } catch {
      setListError("Could not reach the server.");
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ fullName, username, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Failed to create account.",
        );
        setStatus("idle");
        return;
      }

      toast.success(
        typeof data.message === "string"
          ? data.message
          : "Account created successfully.",
      );
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setRole("employer");
      await loadStaff();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const fillGeneratedPassword = () => {
    setPassword(generateStaffPassword());
    setShowPassword(true);
    toast.success("Password generated — copy it before creating the account.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create staff account</CardTitle>
          <CardDescription>
            Login for admin or employee dashboard access (username + email +
            password).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jane.doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@prodesignity.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="staffPassword">Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={fillGeneratedPassword}
                >
                  <DicesIcon className="size-3.5" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="staffPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  className="pr-10"
                  autoComplete="new-password"
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
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "admin" || value === "employer") {
                    setRole(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employer">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Creating…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff accounts</CardTitle>
          <CardDescription>
            Admins and employees currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          ) : null}
          <StaffTable staff={staff} emptyLabel="No staff accounts yet." />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Overview"
      description="Admin dashboard home"
    >
      {({ user }) => <AdminOverview userName={user.fullName} />}
    </DashboardLayout>
  );
}

export function AdminStaffPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Staff"
      description="Create login accounts with email & password"
    >
      {() => <AdminStaffManager />}
    </DashboardLayout>
  );
}
