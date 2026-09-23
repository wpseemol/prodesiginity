import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import EmployeeLoginPage from "./pages/EmployeeLoginPage";
import PortalHomePage from "./pages/PortalHomePage";
import StaffHomePage from "./pages/StaffHomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalHomePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/employee/login" element={<EmployeeLoginPage />} />
        <Route
          path="/admin"
          element={
            <StaffHomePage
              expectedRole="admin"
              title="Admin dashboard"
              loginPath="/admin/login"
            />
          }
        />
        <Route
          path="/employee"
          element={
            <StaffHomePage
              expectedRole="employer"
              title="Employee dashboard"
              loginPath="/employee/login"
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
