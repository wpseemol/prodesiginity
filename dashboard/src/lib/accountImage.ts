import { mediaUrl } from "@/config";
import type { DashboardTeamImages } from "@/lib/session";

export type AccountImages = {
  fullName: string;
  photo?: { url: string } | null;
  avatarPreset?: { url: string } | null;
  teamMember?: DashboardTeamImages | null;
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Account photo → chosen avatar → team portrait → team avatar. `undefined` means show initials. */
export function accountImageUrl(account: AccountImages): string | undefined {
  return (
    mediaUrl(account.photo?.url) ??
    mediaUrl(account.avatarPreset?.url) ??
    mediaUrl(account.teamMember?.photoUrl) ??
    mediaUrl(account.teamMember?.avatarUrl)
  );
}
