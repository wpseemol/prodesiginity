/**
 * Admin settings — brand/login/favicon/tracking + full frontend siteConfig.
 */
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
  MailIcon,
  Share2Icon,
  ScaleIcon,
  GlobeIcon,
  MapPinIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { WEBSITE_LOGOS } from "@/lib/brand";
import {
  EMPTY_SITE_CONFIG,
  normalizeSiteConfig,
  type SiteConfigForm,
} from "@/lib/siteConfigForm";
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

const TEXTAREA =
  "min-h-[88px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

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
  siteConfig?: SiteConfigForm;
  updatedAt: string;
};

type SettingsTab =
  | "brand"
  | "contact"
  | "social"
  | "commercial"
  | "legal"
  | "login"
  | "favicon"
  | "tracking";

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
    hint: "Site name, tagline, description, logos, OG image.",
  },
  {
    id: "contact",
    label: "Contact",
    icon: MailIcon,
    hint: "Email, phone, WhatsApp, and address.",
  },
  {
    id: "social",
    label: "Social",
    icon: Share2Icon,
    hint: "LinkedIn, Instagram, Behance, Dribbble, YouTube.",
  },
  {
    id: "commercial",
    label: "Commercial",
    icon: GlobeIcon,
    hint: "Service areas, languages, price range.",
  },
  {
    id: "legal",
    label: "Legal",
    icon: ScaleIcon,
    hint: "Jurisdiction and policy variables for Terms / Privacy.",
  },
  {
    id: "login",
    label: "Login",
    icon: LogInIcon,
    hint: "Staff login screen copy.",
  },
  {
    id: "favicon",
    label: "Favicon",
    icon: ImageIcon,
    hint: "Browser tab icon.",
  },
  {
    id: "tracking",
    label: "Tracking",
    icon: ActivityIcon,
    hint: "Meta Pixel, Google Tag, CAPI credentials.",
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

function TrackChip({ on, label }: { on: boolean; label: string }) {
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
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resettingLogo, setResettingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginSubtitle, setLoginSubtitle] = useState("");
  const [loginBadgeText, setLoginBadgeText] = useState("");
  const [cfg, setCfg] = useState<SiteConfigForm>(EMPTY_SITE_CONFIG);

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

  const patchCfg = (partial: Partial<SiteConfigForm>) =>
    setCfg((prev) => ({ ...prev, ...partial }));

  const applySettings = (next: SiteSettings) => {
    setSettings(next);
    setSiteName(next.siteName ?? "");
    setLoginTitle(next.loginTitle ?? "");
    setLoginSubtitle(next.loginSubtitle ?? "");
    setLoginBadgeText(next.loginBadgeText ?? "");
    setCfg(normalizeSiteConfig(next.siteConfig));
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

  const saveSiteConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          siteName: cfg.name || siteName,
          siteConfig: {
            ...cfg,
            serviceAreas: cfg.serviceAreas,
            languages: cfg.languages,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not save site config.",
        );
        return;
      }
      applySettings(data.settings as SiteSettings);
      toast.success("Site config saved — live site updates within ~60s.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
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
      toast.success("Login copy saved.");
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

  const saveConfigButton = (
    <Button type="submit" disabled={savingConfig} className="w-fit">
      {savingConfig ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
      Save site config
    </Button>
  );

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-card/90">
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
            <form className="grid gap-5" onSubmit={saveSiteConfig}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="cfgName" label="Site name">
                  <Input
                    id="cfgName"
                    value={cfg.name}
                    onChange={(e) => patchCfg({ name: e.target.value })}
                    required
                  />
                </Field>
                <Field id="cfgLegal" label="Legal name">
                  <Input
                    id="cfgLegal"
                    value={cfg.legalName}
                    onChange={(e) => patchCfg({ legalName: e.target.value })}
                    required
                  />
                </Field>
                <Field id="cfgDomain" label="Domain">
                  <Input
                    id="cfgDomain"
                    value={cfg.domain}
                    onChange={(e) => patchCfg({ domain: e.target.value })}
                  />
                </Field>
                <Field id="cfgUrl" label="Public site URL">
                  <Input
                    id="cfgUrl"
                    value={cfg.url}
                    onChange={(e) => patchCfg({ url: e.target.value })}
                    placeholder="https://prodesignity.com"
                  />
                </Field>
                <Field id="cfgFounded" label="Founded year">
                  <Input
                    id="cfgFounded"
                    value={cfg.founded}
                    onChange={(e) => patchCfg({ founded: e.target.value })}
                  />
                </Field>
                <Field id="cfgOg" label="OG image path" hint="Path or full URL">
                  <Input
                    id="cfgOg"
                    value={cfg.ogImage}
                    onChange={(e) => patchCfg({ ogImage: e.target.value })}
                  />
                </Field>
                <Field
                  id="cfgLogo"
                  label="Logo path"
                  hint="Used in schema / absolute URLs"
                  className="sm:col-span-2"
                >
                  <Input
                    id="cfgLogo"
                    value={cfg.logo}
                    onChange={(e) => patchCfg({ logo: e.target.value })}
                  />
                </Field>
                <Field id="cfgTagline" label="Tagline" className="sm:col-span-2">
                  <Input
                    id="cfgTagline"
                    value={cfg.tagline}
                    onChange={(e) => patchCfg({ tagline: e.target.value })}
                  />
                </Field>
                <Field
                  id="cfgDesc"
                  label="Description"
                  hint="Meta description & JSON-LD"
                  className="sm:col-span-2"
                >
                  <textarea
                    id="cfgDesc"
                    className={TEXTAREA}
                    value={cfg.description}
                    onChange={(e) => patchCfg({ description: e.target.value })}
                  />
                </Field>
              </div>

              <Separator />

              <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Dashboard / login logo</p>
                  {usingWebsiteLogo ? (
                    <Badge variant="secondary">Website logo</Badge>
                  ) : (
                    <Badge>Custom logo</Badge>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Light
                    </p>
                    <img
                      src={mediaUrl(WEBSITE_LOGOS.light)}
                      alt="Light logo"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Dark
                    </p>
                    <img
                      src={mediaUrl(WEBSITE_LOGOS.dark)}
                      alt="Dark logo"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
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
                <Field id="customLogo" label="Upload custom logo" hint="Optional override">
                  <Input
                    id="customLogo"
                    ref={logoRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  />
                </Field>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadingLogo}
                  onClick={() => void uploadCustomLogo()}
                  className="w-fit"
                >
                  {uploadingLogo ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <ImageIcon />
                  )}
                  Upload custom logo
                </Button>
              </div>

              {saveConfigButton}
            </form>
          ) : null}

          {/* Contact */}
          {tab === "contact" ? (
            <form className="grid gap-5" onSubmit={saveSiteConfig}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="email" label="Email">
                  <Input
                    id="email"
                    type="email"
                    value={cfg.email}
                    onChange={(e) => patchCfg({ email: e.target.value })}
                  />
                </Field>
                <Field id="privacyEmail" label="Privacy email">
                  <Input
                    id="privacyEmail"
                    type="email"
                    value={cfg.privacyEmail}
                    onChange={(e) => patchCfg({ privacyEmail: e.target.value })}
                  />
                </Field>
                <Field id="phone" label="Phone">
                  <Input
                    id="phone"
                    value={cfg.phone}
                    onChange={(e) => patchCfg({ phone: e.target.value })}
                  />
                </Field>
                <Field id="whatsapp" label="WhatsApp URL">
                  <Input
                    id="whatsapp"
                    value={cfg.whatsapp}
                    onChange={(e) => patchCfg({ whatsapp: e.target.value })}
                    placeholder="https://wa.me/8801..."
                  />
                </Field>
                <Field id="contactPath" label="Contact path">
                  <Input
                    id="contactPath"
                    value={cfg.contactPath}
                    onChange={(e) => patchCfg({ contactPath: e.target.value })}
                  />
                </Field>
              </div>
              <Separator />
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MapPinIcon className="size-4 text-primary" />
                Address
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="street" label="Street" className="sm:col-span-2">
                  <Input
                    id="street"
                    value={cfg.address.street}
                    onChange={(e) =>
                      patchCfg({
                        address: { ...cfg.address, street: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field id="city" label="City">
                  <Input
                    id="city"
                    value={cfg.address.city}
                    onChange={(e) =>
                      patchCfg({
                        address: { ...cfg.address, city: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field id="region" label="Region / division">
                  <Input
                    id="region"
                    value={cfg.address.region}
                    onChange={(e) =>
                      patchCfg({
                        address: { ...cfg.address, region: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field id="postal" label="Postal code">
                  <Input
                    id="postal"
                    value={cfg.address.postalCode}
                    onChange={(e) =>
                      patchCfg({
                        address: {
                          ...cfg.address,
                          postalCode: e.target.value,
                        },
                      })
                    }
                  />
                </Field>
                <Field id="country" label="Country code">
                  <Input
                    id="country"
                    value={cfg.address.country}
                    onChange={(e) =>
                      patchCfg({
                        address: { ...cfg.address, country: e.target.value },
                      })
                    }
                    placeholder="BD"
                  />
                </Field>
                <Field id="countryName" label="Country name" className="sm:col-span-2">
                  <Input
                    id="countryName"
                    value={cfg.address.countryName}
                    onChange={(e) =>
                      patchCfg({
                        address: {
                          ...cfg.address,
                          countryName: e.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </div>
              {saveConfigButton}
            </form>
          ) : null}

          {/* Social */}
          {tab === "social" ? (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveSiteConfig}>
              {(
                [
                  ["linkedin", "LinkedIn"],
                  ["instagram", "Instagram"],
                  ["behance", "Behance"],
                  ["dribbble", "Dribbble"],
                  ["youtube", "YouTube"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} id={key} label={label}>
                  <Input
                    id={key}
                    value={cfg.social[key]}
                    onChange={(e) =>
                      patchCfg({
                        social: { ...cfg.social, [key]: e.target.value },
                      })
                    }
                    placeholder="https://"
                  />
                </Field>
              ))}
              <div className="sm:col-span-2">{saveConfigButton}</div>
            </form>
          ) : null}

          {/* Commercial */}
          {tab === "commercial" ? (
            <form className="grid gap-4" onSubmit={saveSiteConfig}>
              <Field
                id="areas"
                label="Service areas"
                hint="One per line"
              >
                <textarea
                  id="areas"
                  className={TEXTAREA}
                  value={cfg.serviceAreas.join("\n")}
                  onChange={(e) =>
                    patchCfg({
                      serviceAreas: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field id="langs" label="Languages" hint="One per line">
                <textarea
                  id="langs"
                  className={TEXTAREA}
                  value={cfg.languages.join("\n")}
                  onChange={(e) =>
                    patchCfg({
                      languages: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field id="price" label="Price range" hint="Used in schema.org">
                <Input
                  id="price"
                  value={cfg.priceRange}
                  onChange={(e) => patchCfg({ priceRange: e.target.value })}
                  placeholder="$$"
                />
              </Field>
              {saveConfigButton}
            </form>
          ) : null}

          {/* Legal */}
          {tab === "legal" ? (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveSiteConfig}>
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                These values fill {"{{legal.*}}"} tokens in Terms &amp; Privacy.
              </p>
              {(
                [
                  ["jurisdiction", "Jurisdiction"],
                  ["governingLaw", "Governing law"],
                  ["courts", "Courts"],
                  ["deposit", "Deposit"],
                  ["revisionRounds", "Revision rounds"],
                  ["refundWindowDays", "Refund window (days)"],
                  ["approvalWindowDays", "Approval window (days)"],
                  ["latePaymentTerms", "Late payment terms"],
                  ["dataRetentionMonths", "Data retention (months)"],
                  ["minimumAge", "Minimum age"],
                  ["noticeDays", "Notice days"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} id={key} label={label}>
                  <Input
                    id={key}
                    value={cfg.legal[key]}
                    onChange={(e) =>
                      patchCfg({
                        legal: { ...cfg.legal, [key]: e.target.value },
                      })
                    }
                  />
                </Field>
              ))}
              <div className="sm:col-span-2">{saveConfigButton}</div>
            </form>
          ) : null}

          {/* Login */}
          {tab === "login" ? (
            <form
              className="grid gap-6 lg:grid-cols-[1fr_0.85fr]"
              onSubmit={handleSaveLogin}
            >
              <div className="grid gap-4 content-start">
                <Field id="loginBadge" label="Badge">
                  <Input
                    id="loginBadge"
                    value={loginBadgeText}
                    onChange={(e) => setLoginBadgeText(e.target.value)}
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
              <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </p>
                <div className="rounded-2xl border bg-background/90 p-5 shadow-sm">
                  <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {loginBadgeText || "Staff portal"}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">
                    {loginTitle || "Sign in"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {loginSubtitle}
                  </p>
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
                    alt="Favicon"
                    className="size-12 object-contain"
                  />
                </div>
                <p className="text-sm font-medium">
                  {settings?.faviconUrl ? "Custom favicon" : "Website mark"}
                </p>
              </div>
            </div>
          ) : null}

          {/* Tracking — keep compact from before */}
          {tab === "tracking" ? (
            <form className="grid gap-5" onSubmit={handleSaveTracking}>
              <div className="flex flex-wrap gap-2">
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
              </div>
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4",
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
                <Field id="metaPixelId" label="Meta Pixel ID">
                  <Input
                    id="metaPixelId"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                  />
                </Field>
                <Field id="gaId" label="GA4 Measurement ID">
                  <Input
                    id="gaId"
                    value={googleMeasurementId}
                    onChange={(e) => setGoogleMeasurementId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </Field>
                <Field id="adsId" label="Google Ads ID" className="sm:col-span-2 sm:max-w-md">
                  <Input
                    id="adsId"
                    value={googleAdsId}
                    onChange={(e) => setGoogleAdsId(e.target.value)}
                    placeholder="AW-XXXXXXXXXX"
                  />
                </Field>
              </div>
              <div className="grid gap-4 rounded-2xl border bg-muted/10 p-4 sm:grid-cols-2">
                <Field
                  id="capi"
                  label="Meta CAPI token"
                  hint="Leave blank to keep saved token"
                  className="sm:col-span-2"
                >
                  <Input
                    id="capi"
                    type="password"
                    value={metaCapiAccessToken}
                    onChange={(e) => {
                      setMetaCapiAccessToken(e.target.value);
                      setClearMetaToken(false);
                    }}
                    placeholder={
                      settings?.metaCapiAccessTokenSet
                        ? `Saved ${settings.metaCapiAccessTokenMasked ?? "••••"}`
                        : "Paste token"
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
                <Field id="testCode" label="Test event code">
                  <Input
                    id="testCode"
                    value={metaCapiTestEventCode}
                    onChange={(e) => setMetaCapiTestEventCode(e.target.value)}
                  />
                </Field>
                <Field id="custId" label="Ads customer ID">
                  <Input
                    id="custId"
                    value={googleAdsCustomerId}
                    onChange={(e) => setGoogleAdsCustomerId(e.target.value)}
                  />
                </Field>
                <Field id="conv" label="Conversion label">
                  <Input
                    id="conv"
                    value={googleAdsConversionLabel}
                    onChange={(e) =>
                      setGoogleAdsConversionLabel(e.target.value)
                    }
                  />
                </Field>
                <Field
                  id="gKey"
                  label="Enhanced Conversions API key"
                  className="sm:col-span-2"
                >
                  <Input
                    id="gKey"
                    type="password"
                    value={googleEnhancedKey}
                    onChange={(e) => {
                      setGoogleEnhancedKey(e.target.value);
                      setClearGoogleKey(false);
                    }}
                    placeholder={
                      settings?.googleEnhancedConversionsApiKeySet
                        ? `Saved ${settings.googleEnhancedConversionsApiKeyMasked ?? "••••"}`
                        : "Paste key"
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
      description="Site config, contact, social, legal, login, favicon, tracking"
    >
      {() => <SettingsManager />}
    </DashboardLayout>
  );
}
