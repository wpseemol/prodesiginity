import type { ReactNode } from "react";
import type { StaffRole } from "@/config";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardUser } from "@/lib/session";

type DashboardLayoutProps = {
  expectedRole: StaffRole | StaffRole[];
  title: string;
  description?: string;
  children: (ctx: {
    token: string;
    user: DashboardUser;
    setUser: (user: DashboardUser) => void;
  }) => ReactNode;
};

export function DashboardLayout({
  expectedRole,
  title,
  description,
  children,
}: DashboardLayoutProps) {
  const { token, user, ready, logout, setUser } = useDashboardAuth({
    expectedRole,
  });

  if (!ready || !token || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={() => void logout()} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <ThemeToggle />
        </header>
        <div className="relative flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 size-72 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
          />
          <div className="relative flex flex-1 flex-col gap-6">
            {children({ token, user, setUser })}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
