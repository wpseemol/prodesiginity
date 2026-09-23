import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StaffHomePage from "./pages/StaffHomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <StaffHomePage
              expectedRole="admin"
              title="Admin dashboard"
              loginPath="/login"
            />
          }
        />
        <Route
          path="/employee"
          element={
            <StaffHomePage
              expectedRole="employer"
              title="Employee dashboard"
              loginPath="/login"
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
