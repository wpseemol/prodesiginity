import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { SiteDocumentBranding } from "@/components/SiteDocumentBranding";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import { AdminStaffPage, AdminUsersPage } from "@/pages/AdminAccountsPage";
import AdminCareersPage from "@/pages/AdminCareersPage";
import AdminHomepagePage from "@/pages/AdminHomepagePage";
import AdminTeamPage from "@/pages/AdminTeamPage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import AdminServicesPage from "@/pages/AdminServicesPage";
import AdminIndustriesPage from "@/pages/AdminIndustriesPage";
import { AdminBlogPage, StaffBlogPage } from "@/pages/BlogPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffPublicProfilePage from "@/pages/StaffPublicProfilePage";

export default function App() {
  return (
    <ReduxProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <SiteDocumentBranding />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/staff" element={<AdminStaffPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/homepage" element={<AdminHomepagePage />} />
              <Route path="/admin/team" element={<AdminTeamPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/industries" element={<AdminIndustriesPage />} />
              <Route path="/admin/blog" element={<AdminBlogPage />} />
              <Route path="/admin/careers" element={<AdminCareersPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route
                path="/admin/profile"
                element={<ProfilePage expectedRole="admin" />}
              />
              <Route path="/employee" element={<StaffHomePage />} />
              <Route path="/employee/blog" element={<StaffBlogPage />} />
              <Route
                path="/employee/public-profile"
                element={<StaffPublicProfilePage />}
              />
              <Route
                path="/employee/profile"
                element={<ProfilePage expectedRole="employer" />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
