import { useEffect, useState } from "react";
import {
  LayoutDashboardIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import LoginForm from "@/components/LoginForm";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiBaseUrl, mediaUrl } from "@/config";
import logoDark from "@/assets/logo/prodesignity-logo-dark.svg";
import logoLight from "@/assets/logo/prodesignity-logo-light.svg";

type PublicSettings = {
  siteName: string | null;
  faviconUrl: string | null;
  loginTitle: string | null;
  loginSubtitle: string | null;
  loginBadgeText: string | null;
  loginLogoUrl: string | null;
};

const HIGHLIGHTS = [
  {
    icon: LayoutDashboardIcon,
    title: "One place for the website",
    text: "Homepage, services and settings, updated without touching code.",
  },
  {
    icon: NewspaperIcon,
    title: "Blog publishing",
    text: "Write articles with images and video, then publish when ready.",
  },
  {
    icon: UsersIcon,
    title: "Team and profiles",
    text: "Keep staff accounts and public team profiles up to date.",
  },
];

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

  const siteName = settings?.siteName ?? "ProDesignity";
  const loginLogo = mediaUrl(settings?.loginLogoUrl);

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#0B1020] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 size-[28rem] rounded-full bg-primary/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-40 size-[30rem] rounded-full bg-brand-violet/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div className="relative">
          <img
            src={logoDark}
            alt={siteName}
            width={250}
            height={80}
            className="-ml-1 h-20 w-auto"
          />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Run the {siteName} website from one{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              dashboard
            </span>
            .
          </h2>
          <ul className="mt-10 grid gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                  <Icon className="size-5 text-indigo-200" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/50">
          <span>
            © {new Date().getFullYear()} {siteName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5" />
            Secure staff access
          </span>
        </div>
      </aside>

      <main className="relative flex flex-col p-4 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 size-80 rounded-full bg-primary/10 blur-3xl lg:hidden"
        />

        <div className="relative flex items-center justify-between">
          <div className={loginLogo ? undefined : "lg:invisible"}>
            {loginLogo ? (
              <img
                src={loginLogo}
                alt={siteName}
                className="max-h-10 max-w-[160px] object-contain object-left"
              />
            ) : (
              <>
                <img
                  src={logoLight}
                  alt={siteName}
                  width={175}
                  height={56}
                  className="h-14 w-auto dark:hidden"
                />
                <img
                  src={logoDark}
                  alt=""
                  aria-hidden
                  width={175}
                  height={56}
                  className="hidden h-14 w-auto dark:block"
                />
              </>
            )}
          </div>
          <ThemeToggle />
        </div>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <LoginForm
              badgeText={settings?.loginBadgeText ?? undefined}
              title={settings?.loginTitle ?? undefined}
              subtitle={settings?.loginSubtitle ?? undefined}
            />
          </div>
        </div>

        <p className="relative text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} {siteName}
        </p>
      </main>
    </div>
  );
}
