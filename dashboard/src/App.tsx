import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AdminDashboardPage, {
  AdminStaffPage,
} from "@/pages/AdminDashboardPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import StaffHomePage from "@/pages/StaffHomePage";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/staff" element={<AdminStaffPage />} />
            <Route
              path="/admin/profile"
              element={<ProfilePage expectedRole="admin" />}
            />
            <Route path="/employee" element={<StaffHomePage />} />
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
  );
}
