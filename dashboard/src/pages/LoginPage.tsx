import { useEffect, useState } from "react";
import LoginForm from "@/components/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiBaseUrl, mediaUrl } from "@/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PublicSettings = {
  siteName: string | null;
  faviconUrl: string | null;
  loginTitle: string | null;
  loginSubtitle: string | null;
  loginBadgeText: string | null;
  loginLogoUrl: string | null;
};

export default function LoginPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/settings`);
        const data = await res.json();
        if (!cancelled && res.ok && data.settings) {
          setSettings(data.settings as PublicSettings);
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginLogo = mediaUrl(settings?.loginLogoUrl);

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-50/60 p-4 dark:bg-[#070B14]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-10 size-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-10 size-96 rounded-full bg-brand-violet/10 blur-3xl dark:bg-brand-violet/15"
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="relative w-full max-w-md border-border/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:bg-[#0D121F]/90 dark:shadow-black/60">
        <CardHeader className="items-center pb-2 sm:items-start">
          {loginLogo ? (
            <img
              src={loginLogo}
              alt={settings?.siteName ?? "ProDesignity"}
              className="mb-2 max-h-9 max-w-[160px] object-contain object-left"
            />
          ) : (
            <BrandLogo className="mb-2" />
          )}
          <CardTitle className="sr-only">
            {settings?.siteName ?? "ProDesignity"} staff sign in
          </CardTitle>
          <CardDescription className="sr-only">
            Sign in to the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            badgeText={settings?.loginBadgeText ?? undefined}
            title={settings?.loginTitle ?? undefined}
            subtitle={settings?.loginSubtitle ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
