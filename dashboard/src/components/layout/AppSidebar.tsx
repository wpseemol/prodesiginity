import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  UsersIcon,
  UsersRoundIcon,
  BriefcaseIcon,
  ContactRoundIcon,
  InboxIcon,
  UserRoundIcon,
  SettingsIcon,
  NewspaperIcon,
  FactoryIcon,
} from "lucide-react";
import type { DashboardUser } from "@/lib/session";
import { BrandLogo } from "@/components/BrandLogo";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  title: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
};

type AppSidebarProps = {
  user: DashboardUser;
  onLogout: () => void;
};

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const isAdmin = user.role === "admin";
  const homePath = isAdmin ? "/admin" : "/employee";
  const profilePath = isAdmin ? "/admin/profile" : "/employee/profile";

  const navItems: NavItem[] = isAdmin
    ? [
        { title: "Overview", to: "/admin", icon: LayoutDashboardIcon },
        { title: "Homepage", to: "/admin/homepage", icon: LayoutTemplateIcon },
        { title: "Services", to: "/admin/services", icon: BriefcaseIcon },
        { title: "Industries", to: "/admin/industries", icon: FactoryIcon },
        { title: "Blog", to: "/admin/blog", icon: NewspaperIcon },
        { title: "Careers", to: "/admin/careers", icon: InboxIcon },
        { title: "Team", to: "/admin/team", icon: UsersRoundIcon },
        { title: "Staff", to: "/admin/staff", icon: UsersIcon },
        { title: "Users", to: "/admin/users", icon: ContactRoundIcon },
        { title: "Settings", to: "/admin/settings", icon: SettingsIcon },
        { title: "Profile", to: profilePath, icon: UserRoundIcon },
      ]
    : [
        { title: "Dashboard", to: "/employee", icon: BriefcaseIcon },
        { title: "My articles", to: "/employee/blog", icon: NewspaperIcon },
        {
          title: "Public profile",
          to: "/employee/public-profile",
          icon: UsersRoundIcon,
        },
        { title: "Account", to: profilePath, icon: UserRoundIcon },
      ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex flex-col gap-1.5 px-1 group-data-[collapsible=icon]:items-center">
          <Link
            to={homePath}
            className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go to dashboard home"
          >
            <div className="group-data-[collapsible=icon]:hidden">
              <BrandLogo />
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
              <BrandLogo compact />
            </div>
          </Link>
          <p className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {isAdmin ? "Admin console" : "Staff portal"}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.to}
                    render={<Link to={item.to} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 px-2 pb-3">
        <Separator />
        <div className="flex items-center gap-2 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <UserAvatar account={user} />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Sign out">
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
