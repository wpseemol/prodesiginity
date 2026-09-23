import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { StaffRole } from "../config";
import {
  clearDashboardSession,
  getDashboardToken,
  getDashboardUser,
  type DashboardUser,
} from "../lib/session";

type StaffHomePageProps = {
  expectedRole: StaffRole;
  title: string;
  loginPath: string;
};

export default function StaffHomePage({
  expectedRole,
  title,
  loginPath,
}: StaffHomePageProps) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const nextToken = getDashboardToken();
      const nextUser = await getDashboardUser();
      if (cancelled) return;

      setToken(nextToken);
      setUser(nextUser);
      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!authReady) {
    return null;
  }

  if (!token || !user || user.role !== expectedRole) {
    return <Navigate to={loginPath} replace />;
  }

  const handleLogout = () => {
    clearDashboardSession();
    navigate(loginPath);
  };

  return (
    <div className="staff-home">
      <header className="staff-home__header">
        <div>
          <p className="staff-home__eyebrow">{title}</p>
          <h1>Welcome, {user.fullName}</h1>
          <p className="staff-home__meta">{user.email}</p>
        </div>
        <button type="button" className="staff-home__logout" onClick={handleLogout}>
          Sign out
        </button>
      </header>
      <section className="staff-home__body">
        <p>
          You are signed in to the {title.toLowerCase()}. More tools will appear
          here as they are built.
        </p>
      </section>
    </div>
  );
}
