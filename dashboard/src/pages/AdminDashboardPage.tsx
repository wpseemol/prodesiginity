import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  EarthIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LayersIcon,
  LayoutTemplateIcon,
  Loader2Icon,
  MinusIcon,
  MonitorIcon,
  MonitorSmartphoneIcon,
  SettingsIcon,
  SmartphoneIcon,
  TabletIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { mediaUrl, siteOrigin } from "@/config";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RANGE_OPTIONS,
  countryStats,
  formatNumber,
  percentChange,
  referrerHost,
  timeAgo,
  type AnalyticsOverview,
  type RangeDays,
} from "@/components/overview/analytics";
import { CountryFlag } from "@/components/overview/CountryFlag";
import {
  BrowserChart,
  DeviceChart,
  Sparkline,
  TrafficChart,
} from "@/components/overview/OverviewCharts";
import {
  TopCountriesList,
  VisitorsWorldMap,
} from "@/components/overview/VisitorsWorldMap";

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

function staffInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DeltaBadge({ change, days }: { change: number | null; days: number }) {
  if (change === null) {
    return (
      <span className="text-xs text-muted-foreground">
        New — no data in the previous {days} days
      </span>
    );
  }
  const rounded = Math.round(change * 10) / 10;
  const Icon = rounded > 0 ? TrendingUpIcon : rounded < 0 ? TrendingDownIcon : MinusIcon;
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
          rounded > 0 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          rounded < 0 && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          rounded === 0 && "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-3" />
        {rounded > 0 ? "+" : ""}
        {rounded}%
      </span>
      vs previous {days} days
    </span>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  footer,
  chart,
}: {
  title: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  footer: ReactNode;
  chart?: ReactNode;
}) {
  return (
    <Card className="gap-3 overflow-hidden">
      <CardHeader className="pb-0">
        <CardDescription className="font-medium">{title}</CardDescription>
        <CardAction>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </CardAction>
        <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {footer}
        {chart ? <div className="-mx-1">{chart}</div> : null}
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card className="gap-3">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-20" />
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>
  );
}

const DEVICE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  desktop: MonitorIcon,
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
};

function DeviceIcon({ type }: { type: string | null }) {
  const Icon = DEVICE_ICONS[type ?? ""] ?? MonitorSmartphoneIcon;
  return <Icon className="size-3.5 text-muted-foreground" />;
}

function IntegrationRow({ on, label, hint }: { on: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
          on
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            on ? "bg-emerald-500" : "bg-muted-foreground/50",
          )}
        />
        {on ? "Active" : "Off"}
      </span>
    </li>
  );
}

const QUICK_ACTIONS = [
  { to: "/admin/homepage", label: "Edit homepage", icon: LayoutTemplateIcon },
  { to: "/admin/services", label: "Manage services", icon: LayersIcon },
  { to: "/admin/team", label: "Team members", icon: BriefcaseIcon },
  { to: "/admin/settings", label: "Site settings", icon: SettingsIcon },
];

function AdminOverview({ userName }: { userName: string }) {
  const [range, setRange] = useState<RangeDays>(30);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch(`/admin/analytics/overview?days=${range}`);
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
      } finally {
        if (!cancelled) setLoadingAnalytics(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const countries = useMemo(() => countryStats(analytics), [analytics]);
  const knownCountries = countries.filter((country) => country.code);
  const daily = analytics?.daily ?? [];
  const days = analytics?.days ?? range;
  const visits = analytics?.totalVisits ?? 0;
  const visitors = analytics?.uniqueSessions ?? 0;
  const previous = analytics?.previous;
  const pagesPerVisit = visitors ? visits / visitors : 0;
  const previousPagesPerVisit = previous?.visitors
    ? previous.visits / previous.visitors
    : 0;
  const topPathCount = analytics?.byPath[0]?.count ?? 0;
  const adminCount = staff.filter((member) => member.role === "admin").length;
  const employeeCount = staff.length - adminCount;
  const firstLoad = loadingAnalytics && !analytics;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {today}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {userName.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here’s how your website is performing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loadingAnalytics && analytics ? (
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          ) : null}
          <div
            role="tablist"
            aria-label="Date range"
            className="inline-flex rounded-lg border bg-muted/40 p-0.5"
          >
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={range === option}
                onClick={() => {
                  if (option === range) return;
                  setLoadingAnalytics(true);
                  setRange(option);
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  range === option && "bg-background text-foreground shadow-sm",
                )}
              >
                {option} days
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<a href={siteOrigin} target="_blank" rel="noreferrer" />}
          >
            <ExternalLinkIcon />
            View website
          </Button>
        </div>
      </div>

      {listError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load staff accounts</AlertTitle>
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
        {firstLoad ? (
          Array.from({ length: 4 }, (_, index) => <KpiSkeleton key={index} />)
        ) : (
          <>
            <KpiCard
              title="Page views"
              value={formatNumber(visits)}
              icon={ActivityIcon}
              footer={
                <DeltaBadge
                  change={percentChange(visits, previous?.visits ?? 0)}
                  days={days}
                />
              }
              chart={daily.length ? <Sparkline data={daily} dataKey="visits" /> : null}
            />
            <KpiCard
              title="Unique visitors"
              value={formatNumber(visitors)}
              icon={UsersIcon}
              footer={
                <DeltaBadge
                  change={percentChange(visitors, previous?.visitors ?? 0)}
                  days={days}
                />
              }
              chart={
                daily.length ? (
                  <Sparkline data={daily} dataKey="visitors" color="var(--chart-3)" />
                ) : null
              }
            />
            <KpiCard
              title="Pages per visit"
              value={pagesPerVisit ? pagesPerVisit.toFixed(1) : "—"}
              icon={FileTextIcon}
              footer={
                <DeltaBadge
                  change={percentChange(pagesPerVisit, previousPagesPerVisit)}
                  days={days}
                />
              }
            />
            <KpiCard
              title="Countries reached"
              value={knownCountries.length}
              icon={EarthIcon}
              footer={
                knownCountries[0] ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Top:
                    <CountryFlag code={knownCountries[0].code} />
                    <span className="font-medium text-foreground">
                      {knownCountries[0].name}
                    </span>
                    · {formatNumber(knownCountries[0].count)} visits
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Waiting for visitors from the live site
                  </span>
                )
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic overview</CardTitle>
            <CardDescription>
              Daily page views and unique visitors for the last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {firstLoad ? (
              <Skeleton className="h-72 w-full" />
            ) : daily.length ? (
              <TrafficChart daily={daily} />
            ) : (
              <EmptyState>No traffic recorded in this period.</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>What visitors browse with</CardDescription>
          </CardHeader>
          <CardContent>
            {firstLoad ? (
              <Skeleton className="mx-auto size-48 rounded-full" />
            ) : analytics?.byDevice.length ? (
              <DeviceChart rows={analytics.byDevice} />
            ) : (
              <EmptyState>Device data appears after the first visits.</EmptyState>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors by country</CardTitle>
          <CardDescription>
            Where your website visitors are coming from
          </CardDescription>
          <CardAction>
            <Badge variant="secondary" className="tabular-nums">
              {knownCountries.length}{" "}
              {knownCountries.length === 1 ? "country" : "countries"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <VisitorsWorldMap stats={countries} total={visits} />
          <div className="grid content-start gap-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Top countries
            </p>
            {firstLoad ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-7 w-full" />
                ))}
              </div>
            ) : (
              <TopCountriesList stats={countries} total={visits} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Most viewed pages on your website</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.byPath.length ? (
              <ul className="grid gap-3">
                {analytics.byPath.map((row) => (
                  <li key={row.path} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <a
                        href={`${siteOrigin}${row.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex min-w-0 items-center gap-1 font-medium hover:text-primary"
                      >
                        <span className="truncate">{row.path}</span>
                        <ArrowUpRightIcon className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {row.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-chart-2"
                        style={{
                          width: `${Math.max((row.count / (topPathCount || 1)) * 100, 2)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No page views yet.</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Visits by browser</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.byBrowser.length ? (
              <BrowserChart rows={analytics.byBrowser} />
            ) : (
              <EmptyState>Browser data appears after the first visits.</EmptyState>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest page views on your website</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recent.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="hidden md:table-cell">Device</TableHead>
                    <TableHead className="hidden lg:table-cell">Source</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recent.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {row.path}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <CountryFlag code={row.countryCode} />
                          <span className="truncate">{row.country ?? "Unknown"}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1.5 capitalize">
                          <DeviceIcon type={row.deviceType} />
                          {row.deviceType ?? "—"}
                          {row.browser ? (
                            <span className="normal-case text-muted-foreground">
                              · {row.browser}
                            </span>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-[160px] truncate text-muted-foreground lg:table-cell">
                        {referrerHost(row.referrer)}
                      </TableCell>
                      <TableCell
                        className="text-right text-muted-foreground"
                        title={new Date(row.createdAt).toLocaleString()}
                      >
                        {timeAgo(row.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState>No recent page views.</EmptyState>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking &amp; integrations</CardTitle>
              <CardDescription>Analytics and ad platforms</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ul className="divide-y">
                <IntegrationRow
                  on={Boolean(analytics?.tracking.enabled)}
                  label="Visitor tracking"
                  hint="First-party page view analytics"
                />
                <IntegrationRow
                  on={Boolean(analytics?.tracking.googleTag)}
                  label="Google Analytics 4"
                  hint="Audience, age & gender reports"
                />
                <IntegrationRow
                  on={Boolean(analytics?.tracking.googleAds)}
                  label="Google Ads"
                  hint="Conversion tracking"
                />
                <IntegrationRow
                  on={Boolean(analytics?.tracking.metaPixel)}
                  label="Meta Pixel"
                  hint="Facebook & Instagram ads"
                />
                <IntegrationRow
                  on={Boolean(analytics?.tracking.metaCapi)}
                  label="Meta Conversions API"
                  hint="Server-side events"
                />
                <IntegrationRow
                  on={Boolean(analytics?.tracking.googleEnhancedConversions)}
                  label="Enhanced conversions"
                  hint="Google Ads match quality"
                />
              </ul>
              <Button
                render={<Link to="/admin/settings" />}
                variant="outline"
                size="sm"
              >
                <SettingsIcon />
                Tracking settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>People with access to this dashboard</CardDescription>
            <CardAction>
              <Button render={<Link to="/admin/staff" />} variant="ghost" size="sm">
                Manage
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid grid-cols-3 divide-x rounded-xl border">
              {[
                { label: "Total", value: staff.length },
                { label: "Admins", value: adminCount },
                { label: "Employees", value: employeeCount },
              ].map((item) => (
                <div key={item.label} className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-semibold tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
            {staff.length ? (
              <ul className="grid gap-3">
                {staff.slice(0, 4).map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role === "admin" ? "Admin" : "Employee"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No staff accounts yet.</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
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
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle>Staff accounts</CardTitle>
            <CardDescription>
              Real logins in the system. Adding someone on{" "}
              <Link
                to="/admin/team"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Team members
              </Link>{" "}
              automatically creates their staff account (username &amp;
              password).
            </CardDescription>
          </div>
          <Button render={<Link to="/admin/team" />} size="sm">
            <UserPlusIcon />
            Add on Team
          </Button>
        </CardHeader>
        <CardContent>
          {listError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading staff…
            </div>
          ) : (
            <StaffTable staff={staff} emptyLabel="No staff accounts yet." />
          )}
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
      description="Website performance at a glance"
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
      description="Live accounts — auto-created when you add Team members"
    >
      {() => <AdminStaffManager />}
    </DashboardLayout>
  );
}
