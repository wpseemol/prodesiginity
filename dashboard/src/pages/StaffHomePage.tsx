import { Navigate, useNavigate } from "react-router-dom";
import type { StaffRole } from "../config";

type StaffHomePageProps = {
  expectedRole: StaffRole;
  title: string;
  loginPath: string;
};

type StoredUser = {
  fullName: string;
  email: string;
  role: string;
};

function readUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("dashboard_user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export default function StaffHomePage({
  expectedRole,
  title,
  loginPath,
}: StaffHomePageProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("dashboard_token");
  const user = readUser();

  if (!token || !user || user.role !== expectedRole) {
    return <Navigate to={loginPath} replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("dashboard_token");
    localStorage.removeItem("dashboard_user");
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
