import type { DashboardPhoto, DashboardTeamImages } from "@/lib/session";

export type StaffAccount = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: "admin" | "employer";
  created_at: string;
  disabledAt: string | null;
  photo?: DashboardPhoto | null;
  teamMember?: DashboardTeamImages | null;
};

/** Website account (role `user`), usually created by Google sign-in. */
export type ClientAccount = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  created_at: string;
  disabledAt: string | null;
  signInMethod: "google" | "password";
  lastActiveAt: string | null;
};
