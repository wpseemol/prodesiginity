import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  UsersIcon,
  UsersRoundIcon,
  BriefcaseIcon,
  UserRoundIcon,
  SettingsIcon,
} from "lucide-react";
import type { DashboardUser } from "@/lib/session";
import { BrandLogo } from "@/components/BrandLogo";
import { mediaUrl } from "@/config";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const isAdmin = user.role === "admin";
  const profilePath = isAdmin ? "/admin/profile" : "/employee/profile";

  const navItems: NavItem[] = isAdmin
    ? [
        { title: "Overview", to: "/admin", icon: LayoutDashboardIcon },
        { title: "Homepage", to: "/admin/homepage", icon: LayoutTemplateIcon },
        { title: "Services", to: "/admin/services", icon: BriefcaseIcon },
        { title: "Team", to: "/admin/team", icon: UsersRoundIcon },
        { title: "Staff", to: "/admin/staff", icon: UsersIcon },
        { title: "Settings", to: "/admin/settings", icon: SettingsIcon },
        { title: "Profile", to: profilePath, icon: UserRoundIcon },
      ]
    : [
        { title: "Workspace", to: "/employee", icon: BriefcaseIcon },
        { title: "Profile", to: profilePath, icon: UserRoundIcon },
      ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex flex-col gap-1.5 px-1 group-data-[collapsible=icon]:items-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <BrandLogo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <BrandLogo compact />
          </div>
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
          <Avatar className="size-8">
            {mediaUrl(user.photo?.url) ? (
              <AvatarImage
                src={mediaUrl(user.photo?.url)}
                alt={user.fullName}
              />
            ) : null}
            <AvatarFallback className="text-xs">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
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
