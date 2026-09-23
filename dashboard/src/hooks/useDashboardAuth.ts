import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StaffRole } from "@/config";
import {
  clearDashboardSession,
  getDashboardToken,
  getDashboardUser,
  type DashboardUser,
} from "@/lib/session";

type UseDashboardAuthOptions = {
  expectedRole?: StaffRole | StaffRole[];
  loginPath?: string;
};

export function useDashboardAuth({
  expectedRole,
  loginPath = "/login",
}: UseDashboardAuthOptions = {}) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const nextToken = getDashboardToken();
      const nextUser = await getDashboardUser();
      if (cancelled) return;

      setToken(nextToken);
      setUser(nextUser);
      setReady(true);

      const roles = expectedRole
        ? Array.isArray(expectedRole)
          ? expectedRole
          : [expectedRole]
        : null;

      const roleOk = !roles || (nextUser != null && roles.includes(nextUser.role as StaffRole));

      if (!nextToken || !nextUser || !roleOk) {
        navigate(loginPath, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expectedRole, loginPath, navigate]);

  const logout = () => {
    clearDashboardSession();
    navigate(loginPath);
  };

  return { token, user, ready, logout };
}
