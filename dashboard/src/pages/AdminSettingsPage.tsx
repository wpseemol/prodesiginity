import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ImageIcon,
  Loader2Icon,
  RotateCcwIcon,
  SaveIcon,
  SettingsIcon,
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

type SiteSettings = {
  id: number;
  siteName: string | null;
  faviconUrl: string | null;
  loginTitle: string | null;
  loginSubtitle: string | null;
  loginBadgeText: string | null;
  loginLogoUrl: string | null;
  updatedAt: string;
};

function SettingsManager() {
  const faviconRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resettingLogo, setResettingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginSubtitle, setLoginSubtitle] = useState("");
  const [loginBadgeText, setLoginBadgeText] = useState("");

  const usingWebsiteLogo = !settings?.loginLogoUrl;

  const applySettings = (next: SiteSettings) => {
    setSettings(next);
    setSiteName(next.siteName ?? "");
    setLoginTitle(next.loginTitle ?? "");
    setLoginSubtitle(next.loginSubtitle ?? "");
    setLoginBadgeText(next.loginBadgeText ?? "");
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
      toast.success("General settings saved.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
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
      toast.success("Restored existing website logo.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setResettingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground">
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

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      {/* 1. General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="size-4 text-primary" />
            General
          </CardTitle>
          <CardDescription>
            Core website identity used across the marketing site and dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSaveGeneral}>
            <div className="grid gap-2 sm:max-w-md">
              <Label htmlFor="siteName">Site name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Site logo</p>
                  <p className="text-xs text-muted-foreground">
                    Same ProDesignity logos used on the website header.
                  </p>
                </div>
                {usingWebsiteLogo ? (
                  <Badge variant="secondary">Using website logo</Badge>
                ) : (
                  <Badge>Custom logo active</Badge>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-white p-4 dark:bg-white">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Light
                  </p>
                  <img
                    src={WEBSITE_LOGOS.light}
                    alt="ProDesignity light logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="rounded-xl border bg-slate-950 p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Dark
                  </p>
                  <img
                    src={WEBSITE_LOGOS.dark}
                    alt="ProDesignity dark logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>

              {!usingWebsiteLogo && settings?.loginLogoUrl ? (
                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                  <img
                    src={mediaUrl(settings.loginLogoUrl)}
                    alt="Custom logo"
                    className="h-9 w-auto object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Custom override</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {settings.loginLogoUrl}
                    </p>
                  </div>
                </div>
              ) : null}

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

              <div className="grid gap-2 sm:max-w-md">
                <Label htmlFor="customLogo">
                  Optional: replace with a custom logo
                </Label>
                <Input
                  id="customLogo"
                  ref={logoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadingLogo}
                  onClick={() => void uploadCustomLogo()}
                  className="w-fit"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <ImageIcon />
                      Upload custom logo
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="loginBadge">Login badge</Label>
                <Input
                  id="loginBadge"
                  value={loginBadgeText}
                  onChange={(e) => setLoginBadgeText(e.target.value)}
                  placeholder="Staff portal"
                  required
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="loginTitle">Login title</Label>
                <Input
                  id="loginTitle"
                  value={loginTitle}
                  onChange={(e) => setLoginTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="loginSubtitle">Login subtitle</Label>
                <Input
                  id="loginSubtitle"
                  value={loginSubtitle}
                  onChange={(e) => setLoginSubtitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-fit">
              {saving ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save general settings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Favicon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-4 text-primary" />
            Favicon
          </CardTitle>
          <CardDescription>
            Browser tab icon for the website and staff dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            <img
              src={
                settings?.faviconUrl
                  ? mediaUrl(settings.faviconUrl)
                  : WEBSITE_LOGOS.mark
              }
              alt="Current favicon"
              className="size-10 object-contain"
            />
            <div className="min-w-0 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                {settings?.faviconUrl ? "Custom favicon" : "Website mark"}
              </p>
              <p className="truncate">
                {settings?.faviconUrl ?? WEBSITE_LOGOS.mark}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:max-w-md">
            <Label htmlFor="faviconFile">Upload favicon</Label>
            <Input
              id="faviconFile"
              ref={faviconRef}
              type="file"
              accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/jpeg,image/webp,image/gif"
            />
            <p className="text-xs text-muted-foreground">
              ICO, PNG, or SVG · max 2 MB
            </p>
          </div>
          <Button
            type="button"
            disabled={uploadingFavicon}
            onClick={() => void uploadFavicon()}
            className="w-fit"
          >
            {uploadingFavicon ? (
              <>
                <Loader2Icon className="animate-spin" />
                Uploading…
              </>
            ) : (
              "Save favicon"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="General settings"
      description="Website name, logo, login copy, and favicon"
    >
      {() => <SettingsManager />}
    </DashboardLayout>
  );
}
