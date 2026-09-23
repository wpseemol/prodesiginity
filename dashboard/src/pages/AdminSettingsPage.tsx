import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ImageIcon,
  Loader2Icon,
  RotateCcwIcon,
  SaveIcon,
  SettingsIcon,
  ActivityIcon,
  LogInIcon,
  CheckCircle2Icon,
  CircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { WEBSITE_LOGOS } from "@/lib/brand";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SiteSettings = {
  id: number;
  siteName: string | null;
  faviconUrl: string | null;
  loginTitle: string | null;
  loginSubtitle: string | null;
  loginBadgeText: string | null;
  loginLogoUrl: string | null;
  trackingEnabled: boolean;
  metaPixelId: string | null;
  googleMeasurementId: string | null;
  googleAdsId: string | null;
  metaCapiTestEventCode: string | null;
  googleAdsConversionLabel: string | null;
  googleAdsCustomerId: string | null;
  metaCapiAccessTokenSet: boolean;
  metaCapiAccessTokenMasked: string | null;
  googleEnhancedConversionsApiKeySet: boolean;
  googleEnhancedConversionsApiKeyMasked: string | null;
  updatedAt: string;
};

type SettingsTab = "brand" | "login" | "favicon" | "tracking";

const TABS: {
  id: SettingsTab;
  label: string;
  icon: typeof SettingsIcon;
  hint: string;
}[] = [
  {
    id: "brand",
    label: "Brand",
    icon: SettingsIcon,
    hint: "Site name and logos shown on the website and dashboard.",
  },
  {
    id: "login",
    label: "Login screen",
    icon: LogInIcon,
    hint: "Copy shown on the staff login page.",
  },
  {
    id: "favicon",
    label: "Favicon",
    icon: ImageIcon,
    hint: "Browser tab icon for site and dashboard.",
  },
  {
    id: "tracking",
    label: "Ads tracking",
    icon: ActivityIcon,
    hint: "Meta Pixel, Google Tag, and server credentials.",
  },
];

function Field({
  id,
  label,
  hint,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function TrackChip({
  on,
  label,
}: {
  on: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        on
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {on ? (
        <CheckCircle2Icon className="size-3.5" />
      ) : (
        <CircleIcon className="size-3.5" />
      )}
      {label}
    </span>
  );
}

function SettingsManager() {
  const faviconRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<SettingsTab>("brand");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resettingLogo, setResettingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginSubtitle, setLoginSubtitle] = useState("");
  const [loginBadgeText, setLoginBadgeText] = useState("");

  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [googleMeasurementId, setGoogleMeasurementId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [metaCapiAccessToken, setMetaCapiAccessToken] = useState("");
  const [metaCapiTestEventCode, setMetaCapiTestEventCode] = useState("");
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState("");
  const [googleAdsCustomerId, setGoogleAdsCustomerId] = useState("");
  const [googleEnhancedKey, setGoogleEnhancedKey] = useState("");
  const [clearMetaToken, setClearMetaToken] = useState(false);
  const [clearGoogleKey, setClearGoogleKey] = useState(false);

  const usingWebsiteLogo = !settings?.loginLogoUrl;
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  const applySettings = (next: SiteSettings) => {
    setSettings(next);
    setSiteName(next.siteName ?? "");
    setLoginTitle(next.loginTitle ?? "");
    setLoginSubtitle(next.loginSubtitle ?? "");
    setLoginBadgeText(next.loginBadgeText ?? "");
    setTrackingEnabled(Boolean(next.trackingEnabled));
    setMetaPixelId(next.metaPixelId ?? "");
    setGoogleMeasurementId(next.googleMeasurementId ?? "");
    setGoogleAdsId(next.googleAdsId ?? "");
    setMetaCapiTestEventCode(next.metaCapiTestEventCode ?? "");
    setGoogleAdsConversionLabel(next.googleAdsConversionLabel ?? "");
    setGoogleAdsCustomerId(next.googleAdsCustomerId ?? "");
    setMetaCapiAccessToken("");
    setGoogleEnhancedKey("");
    setClearMetaToken(false);
    setClearGoogleKey(false);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/settings");
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Could not load settings.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSaveGeneral = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          siteName,
          loginTitle,
          loginSubtitle,
          loginBadgeText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not save settings.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      toast.success("Saved.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTracking = async (e: FormEvent) => {
    e.preventDefault();
    setSavingTracking(true);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          trackingEnabled,
          metaPixelId,
          googleMeasurementId,
          googleAdsId,
          metaCapiTestEventCode,
          googleAdsConversionLabel,
          googleAdsCustomerId,
          ...(metaCapiAccessToken.trim()
            ? { metaCapiAccessToken: metaCapiAccessToken.trim() }
            : {}),
          ...(clearMetaToken ? { clearMetaCapiAccessToken: true } : {}),
          ...(googleEnhancedKey.trim()
            ? { googleEnhancedConversionsApiKey: googleEnhancedKey.trim() }
            : {}),
          ...(clearGoogleKey
            ? { clearGoogleEnhancedConversionsApiKey: true }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not save tracking settings.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      toast.success("Tracking saved.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSavingTracking(false);
    }
  };

  const uploadFavicon = async () => {
    const file = faviconRef.current?.files?.[0];
    if (!file) {
      toast.message("Choose a favicon file first.");
      return;
    }
    setUploadingFavicon(true);
    try {
      const body = new FormData();
      body.append("favicon", file);
      const res = await apiFetch("/admin/settings/favicon", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not upload favicon.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      if (faviconRef.current) faviconRef.current.value = "";
      toast.success("Favicon updated.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const uploadCustomLogo = async () => {
    const file = logoRef.current?.files?.[0];
    if (!file) {
      toast.message("Choose a logo file first.");
      return;
    }
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("logo", file);
      const res = await apiFetch("/admin/settings/login-logo", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not upload logo.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      if (logoRef.current) logoRef.current.value = "";
      toast.success("Custom logo saved.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const restoreWebsiteLogo = async () => {
    setResettingLogo(true);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ useWebsiteLogo: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not restore website logo.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      toast.success("Restored website logo.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setResettingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
        Loading settings…
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load settings</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const faviconSrc = settings?.faviconUrl
    ? mediaUrl(settings.faviconUrl)
    : mediaUrl(WEBSITE_LOGOS.mark);

  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-card/90 overflow-hidden">
        <CardHeader className="gap-3 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <activeTab.icon className="size-4" />
              </span>
              Settings
            </CardTitle>
            <CardDescription>{activeTab.hint}</CardDescription>
          </div>
          {settings?.updatedAt ? (
            <Badge variant="secondary" className="w-fit font-normal">
              Updated {new Date(settings.updatedAt).toLocaleString()}
            </Badge>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-5 pt-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <Separator />

          {/* Brand */}
          {tab === "brand" ? (
            <form
              className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
              onSubmit={handleSaveGeneral}
            >
              <div className="grid gap-5 content-start">
                <Field id="siteName" label="Site name">
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                  />
                </Field>

                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">Logo</p>
                    {usingWebsiteLogo ? (
                      <Badge variant="secondary">Website logo</Badge>
                    ) : (
                      <Badge>Custom logo</Badge>
                    )}
                  </div>

                  {!usingWebsiteLogo && settings?.loginLogoUrl ? (
                    <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-3">
                      <img
                        src={mediaUrl(settings.loginLogoUrl)}
                        alt="Custom logo"
                        className="h-9 w-auto object-contain"
                      />
                      <p className="truncate text-xs text-muted-foreground">
                        {settings.loginLogoUrl}
                      </p>
                    </div>
                  ) : null}

                  <Field id="customLogo" label="Upload custom logo" hint="JPEG, PNG, WebP, SVG">
                    <Input
                      id="customLogo"
                      ref={logoRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploadingLogo}
                      onClick={() => void uploadCustomLogo()}
                    >
                      {uploadingLogo ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <ImageIcon />
                      )}
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={resettingLogo || usingWebsiteLogo}
                      onClick={() => void restoreWebsiteLogo()}
                    >
                      {resettingLogo ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <RotateCcwIcon />
                      )}
                      Use website logo
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-fit">
                  {saving ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <SaveIcon />
                  )}
                  Save brand
                </Button>
              </div>

              <div className="grid gap-3 content-start">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live preview
                </p>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Light header
                  </p>
                  <img
                    src={mediaUrl(WEBSITE_LOGOS.light)}
                    alt="Light logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Dark header
                  </p>
                  <img
                    src={mediaUrl(WEBSITE_LOGOS.dark)}
                    alt="Dark logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    Site name preview
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    {siteName || "ProDesignity"}
                  </p>
                </div>
              </div>
            </form>
          ) : null}

          {/* Login */}
          {tab === "login" ? (
            <form
              className="grid gap-6 lg:grid-cols-[1fr_0.85fr]"
              onSubmit={handleSaveGeneral}
            >
              <div className="grid gap-4 content-start">
                <Field id="loginBadge" label="Badge">
                  <Input
                    id="loginBadge"
                    value={loginBadgeText}
                    onChange={(e) => setLoginBadgeText(e.target.value)}
                    placeholder="Staff portal"
                    required
                  />
                </Field>
                <Field id="loginTitle" label="Title">
                  <Input
                    id="loginTitle"
                    value={loginTitle}
                    onChange={(e) => setLoginTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field id="loginSubtitle" label="Subtitle">
                  <Input
                    id="loginSubtitle"
                    value={loginSubtitle}
                    onChange={(e) => setLoginSubtitle(e.target.value)}
                    required
                  />
                </Field>
                <Button type="submit" disabled={saving} className="w-fit">
                  {saving ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <SaveIcon />
                  )}
                  Save login copy
                </Button>
              </div>

              <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Login preview
                </p>
                <div className="rounded-2xl border bg-background/90 p-5 shadow-sm backdrop-blur">
                  <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {loginBadgeText || "Staff portal"}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">
                    {loginTitle || "Sign in to your account"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {loginSubtitle ||
                      "Use your username or email to access the dashboard."}
                  </p>
                  <div className="mt-5 grid gap-2">
                    <div className="h-9 rounded-lg border bg-muted/40" />
                    <div className="h-9 rounded-lg border bg-muted/40" />
                    <div className="mt-1 h-9 rounded-lg bg-primary/90" />
                  </div>
                </div>
              </div>
            </form>
          ) : null}

          {/* Favicon */}
          {tab === "favicon" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
              <div className="grid gap-4 content-start">
                <Field
                  id="faviconFile"
                  label="Upload favicon"
                  hint="ICO, PNG, or SVG · max 2 MB"
                >
                  <Input
                    id="faviconFile"
                    ref={faviconRef}
                    type="file"
                    accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/jpeg,image/webp,image/gif"
                  />
                </Field>
                <Button
                  type="button"
                  disabled={uploadingFavicon}
                  onClick={() => void uploadFavicon()}
                  className="w-fit"
                >
                  {uploadingFavicon ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <SaveIcon />
                  )}
                  Save favicon
                </Button>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-muted/20 p-8">
                <div className="flex size-20 items-center justify-center rounded-2xl border bg-background shadow-sm">
                  <img
                    src={faviconSrc}
                    alt="Current favicon"
                    className="size-12 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {settings?.faviconUrl ? "Custom favicon" : "Website mark"}
                  </p>
                  <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                    {settings?.faviconUrl ?? WEBSITE_LOGOS.mark}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                  <img
                    src={faviconSrc}
                    alt=""
                    className="size-3.5 object-contain"
                  />
                  <span className="font-medium text-foreground">
                    {siteName || "ProDesignity"}
                  </span>
                  <span>— tab preview</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Tracking */}
          {tab === "tracking" ? (
            <form className="grid gap-6" onSubmit={handleSaveTracking}>
              <div className="flex flex-wrap items-center gap-2">
                <TrackChip on={trackingEnabled} label="Enabled" />
                <TrackChip on={Boolean(metaPixelId.trim())} label="Meta Pixel" />
                <TrackChip
                  on={Boolean(googleMeasurementId.trim())}
                  label="GA4"
                />
                <TrackChip
                  on={Boolean(settings?.metaCapiAccessTokenSet)}
                  label="Meta CAPI"
                />
                <TrackChip
                  on={Boolean(settings?.googleEnhancedConversionsApiKeySet)}
                  label="Google Enhanced"
                />
              </div>

              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-colors",
                  trackingEnabled
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-muted/20",
                )}
              >
                <span>
                  <span className="block text-sm font-semibold">
                    Tracking on website
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Loads pixels and records visits for Overview.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="size-5 accent-primary"
                  checked={trackingEnabled}
                  onChange={(e) => setTrackingEnabled(e.target.checked)}
                />
              </label>

              <div className="grid gap-4 rounded-2xl border bg-muted/10 p-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browser
                </p>
                <Field id="metaPixelId" label="Meta Pixel ID">
                  <Input
                    id="metaPixelId"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    placeholder="123456789012345"
                    autoComplete="off"
                  />
                </Field>
                <Field id="googleMeasurementId" label="GA4 Measurement ID">
                  <Input
                    id="googleMeasurementId"
                    value={googleMeasurementId}
                    onChange={(e) => setGoogleMeasurementId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    autoComplete="off"
                  />
                </Field>
                <Field
                  id="googleAdsId"
                  label="Google Ads ID"
                  hint="Optional"
                  className="sm:col-span-2 sm:max-w-md"
                >
                  <Input
                    id="googleAdsId"
                    value={googleAdsId}
                    onChange={(e) => setGoogleAdsId(e.target.value)}
                    placeholder="AW-XXXXXXXXXX"
                    autoComplete="off"
                  />
                </Field>
              </div>

              <div className="grid gap-4 rounded-2xl border bg-muted/10 p-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meta CAPI (server)
                </p>
                <Field
                  id="metaCapiToken"
                  label="Access token"
                  hint="Leave blank to keep the saved token"
                  className="sm:col-span-2"
                >
                  <Input
                    id="metaCapiToken"
                    type="password"
                    value={metaCapiAccessToken}
                    onChange={(e) => {
                      setMetaCapiAccessToken(e.target.value);
                      setClearMetaToken(false);
                    }}
                    placeholder={
                      settings?.metaCapiAccessTokenSet
                        ? `Saved ${settings.metaCapiAccessTokenMasked ?? "••••"}`
                        : "Paste access token"
                    }
                    autoComplete="new-password"
                  />
                </Field>
                {settings?.metaCapiAccessTokenSet ? (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={clearMetaToken}
                      onChange={(e) => {
                        setClearMetaToken(e.target.checked);
                        if (e.target.checked) setMetaCapiAccessToken("");
                      }}
                    />
                    Clear saved token
                  </label>
                ) : null}
                <Field id="metaCapiTest" label="Test event code" hint="Optional">
                  <Input
                    id="metaCapiTest"
                    value={metaCapiTestEventCode}
                    onChange={(e) => setMetaCapiTestEventCode(e.target.value)}
                    placeholder="TEST12345"
                    autoComplete="off"
                  />
                </Field>
              </div>

              <div className="grid gap-4 rounded-2xl border bg-muted/10 p-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Google Enhanced Conversions (server)
                </p>
                <Field id="googleAdsCustomerId" label="Ads customer ID">
                  <Input
                    id="googleAdsCustomerId"
                    value={googleAdsCustomerId}
                    onChange={(e) => setGoogleAdsCustomerId(e.target.value)}
                    placeholder="123-456-7890"
                    autoComplete="off"
                  />
                </Field>
                <Field id="googleAdsConversionLabel" label="Conversion label">
                  <Input
                    id="googleAdsConversionLabel"
                    value={googleAdsConversionLabel}
                    onChange={(e) =>
                      setGoogleAdsConversionLabel(e.target.value)
                    }
                    placeholder="AbC-D_efGHiJklMN"
                    autoComplete="off"
                  />
                </Field>
                <Field
                  id="googleEnhancedKey"
                  label="API key"
                  hint="Leave blank to keep the saved key"
                  className="sm:col-span-2"
                >
                  <Input
                    id="googleEnhancedKey"
                    type="password"
                    value={googleEnhancedKey}
                    onChange={(e) => {
                      setGoogleEnhancedKey(e.target.value);
                      setClearGoogleKey(false);
                    }}
                    placeholder={
                      settings?.googleEnhancedConversionsApiKeySet
                        ? `Saved ${settings.googleEnhancedConversionsApiKeyMasked ?? "••••"}`
                        : "Paste API key"
                    }
                    autoComplete="new-password"
                  />
                </Field>
                {settings?.googleEnhancedConversionsApiKeySet ? (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={clearGoogleKey}
                      onChange={(e) => {
                        setClearGoogleKey(e.target.checked);
                        if (e.target.checked) setGoogleEnhancedKey("");
                      }}
                    />
                    Clear saved API key
                  </label>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                Age &amp; gender stay in Meta Ads Manager / GA4 Demographics.
                Overview countries come from CDN headers or MaxMind GeoLite2
                (run <code className="rounded bg-muted px-1">npm run geoip:download</code>{" "}
                on the API with your MaxMind license key).
              </p>

              <Button type="submit" disabled={savingTracking} className="w-fit">
                {savingTracking ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SaveIcon />
                )}
                Save tracking
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Settings"
      description="Brand, login, favicon, and ads tracking"
    >
      {() => <SettingsManager />}
    </DashboardLayout>
  );
}
