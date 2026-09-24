import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StaffRole } from "@/config";
import { logoutRequest, refreshSession } from "@/lib/api";
import {
  getAccessToken,
  getDashboardUser,
  getRefreshToken,
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
      let nextToken = await getAccessToken();
      let nextUser = await getDashboardUser();
      const refreshToken = await getRefreshToken();

      // Access cookie/JWT gone but refresh still present → silent renew.
      if ((!nextToken || !nextUser) && refreshToken) {
        const ok = await refreshSession();
        if (ok) {
          nextToken = await getAccessToken();
          nextUser = await getDashboardUser();
        }
      }

      if (cancelled) return;

      setToken(nextToken);
      setUser(nextUser);
      setReady(true);

      const roles = expectedRole
        ? Array.isArray(expectedRole)
          ? expectedRole
          : [expectedRole]
        : null;

      const roleOk =
        !roles ||
        (nextUser != null && roles.includes(nextUser.role as StaffRole));

      // Expired/invalid refresh ⇒ hard logout to login.
      if (!nextToken || !nextUser || !roleOk) {
        if (refreshToken && (!nextToken || !nextUser)) {
          // refreshSession already cleared cookies on failure
        }
        navigate(loginPath, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expectedRole, loginPath, navigate]);

  const logout = async () => {
    await logoutRequest();
    navigate(loginPath);
  };

  return { token, user, ready, logout, setUser };
}
