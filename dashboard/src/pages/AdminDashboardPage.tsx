import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "../config";

type StoredUser = {
  fullName: string;
  email: string;
  role: string;
};

type StaffUser = {
  id: number;
  fullName: string;
  email: string;
  role: "admin" | "employer";
  created_at: string;
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

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dashboard_token");
  const user = readUser();

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employer">("employer");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [token, user?.role, navigate]);

  const loadStaff = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setListError(
          typeof data.message === "string"
            ? data.message
            : "Could not load staff accounts.",
        );
        return;
      }
      setListError(null);
      setStaff(data.users ?? []);
    } catch {
      setListError("Could not reach the server.");
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") {
      void loadStaff();
    }
  }, [token, user?.role]);

  if (!token || !user || user.role !== "admin") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("dashboard_token");
    localStorage.removeItem("dashboard_user");
    navigate("/login");
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "Failed to create account.",
        );
        return;
      }

      setStatus("success");
      setMessage(
        typeof data.message === "string"
          ? data.message
          : "Account created successfully.",
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("employer");
      await loadStaff();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Please try again.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Admin dashboard</p>
          <h1>Welcome, {user.fullName}</h1>
          <p className="admin-page__meta">{user.email}</p>
        </div>
        <button type="button" className="admin-page__logout" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <div className="admin-page__grid">
        <section className="admin-card">
          <h2>Create staff account</h2>
          <p className="admin-card__lead">
            Add a new admin or employee (employer) account.
          </p>

          <form className="admin-form" onSubmit={handleCreate}>
            {message && (
              <div
                className={
                  status === "error"
                    ? "admin-form__alert admin-form__alert--error"
                    : "admin-form__alert admin-form__alert--success"
                }
                role="status"
              >
                {message}
              </div>
            )}

            <label className="admin-form__field">
              <span>Full name</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </label>

            <label className="admin-form__field">
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@prodesignity.com"
              />
            </label>

            <label className="admin-form__field">
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number, symbol"
              />
            </label>

            <label className="admin-form__field">
              <span>Role</span>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "admin" | "employer")
                }
              >
                <option value="employer">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="admin-form__submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creating…" : "Create account"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Staff accounts</h2>
          <p className="admin-card__lead">Admins and employees currently in the system.</p>

          {listError && (
            <div className="admin-form__alert admin-form__alert--error">
              {listError}
            </div>
          )}

          <ul className="staff-list">
            {staff.length === 0 && !listError ? (
              <li className="staff-list__empty">No staff accounts yet.</li>
            ) : (
              staff.map((member) => (
                <li key={member.id} className="staff-list__item">
                  <div>
                    <p className="staff-list__name">{member.fullName}</p>
                    <p className="staff-list__email">{member.email}</p>
                  </div>
                  <span
                    className={
                      member.role === "admin"
                        ? "staff-list__badge staff-list__badge--admin"
                        : "staff-list__badge staff-list__badge--employee"
                    }
                  >
                    {member.role === "admin" ? "Admin" : "Employee"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
