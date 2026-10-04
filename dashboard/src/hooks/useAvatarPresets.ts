import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type AvatarPreset = { id: number; url: string; label: string | null };

/** The admin's avatar presets (Settings → Avatars); `null` while loading. */
export function useAvatarPresets() {
  const [presets, setPresets] = useState<AvatarPreset[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/auth/avatar-presets")
      .then((res) => (res.ok ? res.json() : { presets: [] }))
      .then((data: { presets?: AvatarPreset[] }) => {
        if (!cancelled) setPresets(data.presets ?? []);
      })
      .catch(() => {
        if (!cancelled) setPresets([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return presets;
}
