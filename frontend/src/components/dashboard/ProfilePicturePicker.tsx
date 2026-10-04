"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { authFetch, getAuthUser, setAuthUser, type AuthUser } from "@/lib/auth";
import { mediaUrl } from "@/config/api";
import { siteConfig } from "@/config/site";

type AvatarPreset = { id: number; url: string; label: string | null };

type ChooseAvatarResponse = {
    message?: string;
    user?: {
        avatarPreset?: { id: number; url: string } | null;
        googlePictureUrl?: string | null;
    };
};

type Props = {
    user: AuthUser;
    onChange: (user: AuthUser) => void;
};

export default function ProfilePicturePicker({ user, onChange }: Props) {
    const [presets, setPresets] = useState<AvatarPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | "google" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Sessions saved before avatars existed only stored the Google photo as `picture`.
    const googlePicture =
        user.googlePicture ?? (user.avatarPresetId ? null : (user.picture ?? null));
    const selected = user.avatarPresetId ?? "google";

    useEffect(() => {
        let cancelled = false;
        authFetch("/auth/avatar-presets")
            .then(async (res) => {
                if (cancelled) return;
                if (res.status === 401) {
                    setSessionExpired(true);
                    return;
                }
                const data = (await res.json().catch(() => ({}))) as {
                    presets?: AvatarPreset[];
                };
                if (!res.ok) throw new Error();
                setPresets(data.presets ?? []);
            })
            .catch(() => {
                if (!cancelled) setError("Could not load avatars. Please refresh the page.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const choose = async (presetId: number | null) => {
        if (saving !== null) return;
        setSaving(presetId ?? "google");
        setError(null);
        try {
            const res = await authFetch("/auth/me/avatar", {
                method: "PUT",
                body: JSON.stringify({ presetId }),
            });
            if (res.status === 401) {
                setSessionExpired(true);
                return;
            }
            const data = (await res.json().catch(() => ({}))) as ChooseAvatarResponse;
            if (!res.ok || !data.user) {
                setError(data.message || "Could not update your profile picture.");
                return;
            }
            const preset = data.user.avatarPreset ?? null;
            const google = data.user.googlePictureUrl ?? googlePicture;
            // authFetch may have rotated the tokens, so merge into the latest session.
            const next: AuthUser = {
                ...(getAuthUser() ?? user),
                avatarPresetId: preset?.id ?? null,
                googlePicture: google,
                picture: preset?.url ?? google,
            };
            setAuthUser(next);
            onChange(next);
        } catch {
            setError("Could not update your profile picture.");
        } finally {
            setSaving(null);
        }
    };

    if (sessionExpired) {
        return (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Your session has expired.{" "}
                <Link
                    href={siteConfig.loginPath}
                    className="font-semibold text-primary hover:underline"
                >
                    Sign in again
                </Link>{" "}
                to change your profile picture.
            </p>
        );
    }

    const optionClass = (active: boolean) =>
        `relative h-16 w-16 overflow-hidden rounded-2xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed ${
            active
                ? "border-primary shadow-md"
                : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        }`;

    const indicator = (key: number | "google") =>
        saving === key ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
            </span>
        ) : selected === key ? (
            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" />
            </span>
        ) : null;

    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold">Profile picture</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use your Google photo or pick one of our avatars.
            </p>

            {loading ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    Loading avatars…
                </p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-3" role="radiogroup">
                    {googlePicture ? (
                        <button
                            type="button"
                            role="radio"
                            aria-checked={selected === "google"}
                            aria-label="Google photo"
                            title="Google photo"
                            disabled={saving !== null}
                            onClick={() => void choose(null)}
                            className={optionClass(selected === "google")}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={googlePicture}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                            />
                            {indicator("google")}
                        </button>
                    ) : null}
                    {presets.map((preset) => {
                        const label = preset.label || "Avatar";
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                role="radio"
                                aria-checked={selected === preset.id}
                                aria-label={label}
                                title={label}
                                disabled={saving !== null}
                                onClick={() => void choose(preset.id)}
                                className={optionClass(selected === preset.id)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={mediaUrl(preset.url) ?? preset.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                {indicator(preset.id)}
                            </button>
                        );
                    })}
                    {!googlePicture && presets.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No avatars are available yet.
                        </p>
                    ) : null}
                </div>
            )}

            {error ? (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
