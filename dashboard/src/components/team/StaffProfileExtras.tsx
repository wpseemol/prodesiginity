import { useState, type KeyboardEvent } from "react";
import {
  BoxIcon,
  ClapperboardIcon,
  CrownIcon,
  HeartHandshakeIcon,
  PaletteIcon,
  SparklesIcon,
  TerminalIcon,
  TrendingUpIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Public-profile extras shared by the staff "My public profile" page and the
 * admin Team members form: profile style, avatar frame, skills, socials.
 * Keys mirror backend-api/src/lib/zod/team.ts and the website's
 * data/staffStyles.ts.
 */

export const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook", color: "#1877F2", placeholder: "https://facebook.com/username" },
  { key: "instagram", label: "Instagram", color: "#DD2A7B", placeholder: "https://instagram.com/username" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", placeholder: "https://linkedin.com/in/username" },
  { key: "behance", label: "Behance", color: "#1769FF", placeholder: "https://behance.net/username" },
  { key: "dribbble", label: "Dribbble", color: "#EA4C89", placeholder: "https://dribbble.com/username" },
  { key: "artstation", label: "ArtStation", color: "#13AFF0", placeholder: "https://artstation.com/username" },
  { key: "x", label: "X (Twitter)", color: "#111111", placeholder: "https://x.com/username" },
  { key: "github", label: "GitHub", color: "#181717", placeholder: "https://github.com/username" },
  { key: "youtube", label: "YouTube", color: "#FF0000", placeholder: "https://youtube.com/@channel" },
  { key: "website", label: "Website / portfolio", color: "#6366F1", placeholder: "https://your-portfolio.com" },
] as const;

export type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];

const PROFILE_STYLES: {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  swatch: string;
}[] = [
  { key: "auto", label: "Auto", hint: "Picked from designation", icon: SparklesIcon, swatch: "from-slate-400 to-slate-600" },
  { key: "lead", label: "Founder", hint: "Spotlight frame", icon: CrownIcon, swatch: "from-amber-400 via-fuchsia-500 to-indigo-600" },
  { key: "designer", label: "3D Designer", hint: "Render viewport", icon: BoxIcon, swatch: "from-violet-600 via-indigo-600 to-blue-600" },
  { key: "graphic", label: "Graphic Designer", hint: "Colour poster", icon: PaletteIcon, swatch: "from-fuchsia-500 via-pink-500 to-orange-400" },
  { key: "developer", label: "Developer", hint: "Terminal", icon: TerminalIcon, swatch: "from-emerald-500 via-green-500 to-lime-400" },
  { key: "animator", label: "Animator", hint: "Motion timeline", icon: ClapperboardIcon, swatch: "from-amber-400 via-orange-500 to-red-500" },
  { key: "marketing", label: "Marketing", hint: "Growth banner", icon: TrendingUpIcon, swatch: "from-sky-500 via-blue-500 to-indigo-500" },
  { key: "people", label: "People / HR", hint: "Friendly banner", icon: HeartHandshakeIcon, swatch: "from-cyan-500 via-teal-500 to-emerald-400" },
];

const AVATAR_SHAPES: { key: string; label: string; className: string; clip?: string }[] = [
  { key: "auto", label: "Auto", className: "rounded-md border-2 border-dashed border-muted-foreground/40 bg-transparent" },
  { key: "circle", label: "Circle", className: "rounded-full" },
  { key: "squircle", label: "Squircle", className: "rounded-[30%]" },
  { key: "hexagon", label: "Hexagon", className: "", clip: "polygon(50% 0, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)" },
  { key: "blob", label: "Blob", className: "rounded-[58%_42%_55%_45%/45%_55%_45%_55%]" },
];

export type ProfileExtras = {
  profileStyle: string;
  avatarShape: string;
  skills: string[];
  socials: Partial<Record<SocialKey, string>>;
};

export const EMPTY_EXTRAS: ProfileExtras = {
  profileStyle: "auto",
  avatarShape: "auto",
  skills: [],
  socials: {},
};

export function extrasFromMember(member: {
  profileStyle?: string | null;
  avatarShape?: string | null;
  skills?: string[] | null;
  socials?: Partial<Record<SocialKey, string>> | null;
}): ProfileExtras {
  return {
    profileStyle: member.profileStyle || "auto",
    avatarShape: member.avatarShape || "auto",
    skills: member.skills ?? [],
    socials: member.socials ?? {},
  };
}

export function appendExtras(body: FormData, extras: ProfileExtras) {
  body.append("profileStyle", extras.profileStyle);
  body.append("avatarShape", extras.avatarShape);
  body.append("skills", JSON.stringify(extras.skills));
  const socials = Object.fromEntries(
    SOCIAL_FIELDS.map(({ key }) => [key, extras.socials[key]?.trim() ?? ""]),
  );
  body.append("socials", JSON.stringify(socials));
}

/** First social URL that is filled in but not a full http(s) URL. */
export function invalidSocial(extras: ProfileExtras): string | null {
  for (const field of SOCIAL_FIELDS) {
    const value = extras.socials[field.key]?.trim();
    if (value && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(value)) return field.label;
  }
  return null;
}

interface StaffProfileExtrasProps {
  value: ProfileExtras;
  onChange: (next: ProfileExtras) => void;
  /** Tighter layout for the narrow admin form. */
  compact?: boolean;
  idPrefix?: string;
}

export function StaffProfileExtras({
  value,
  onChange,
  compact = false,
  idPrefix = "profile",
}: StaffProfileExtrasProps) {
  const [skillDraft, setSkillDraft] = useState("");

  const set = <K extends keyof ProfileExtras>(key: K, next: ProfileExtras[K]) =>
    onChange({ ...value, [key]: next });

  const addSkills = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.slice(0, 40));
    if (parts.length === 0) return;
    const merged = [...value.skills];
    for (const part of parts) {
      if (!merged.some((s) => s.toLowerCase() === part.toLowerCase())) merged.push(part);
    }
    set("skills", merged.slice(0, 12));
    setSkillDraft("");
  };

  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkills(skillDraft);
    } else if (e.key === "Backspace" && !skillDraft && value.skills.length > 0) {
      set("skills", value.skills.slice(0, -1));
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label>Profile page style</Label>
        <p className="text-xs text-muted-foreground">
          Each style gives the public profile its own layout and colours.
        </p>
        <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
          {PROFILE_STYLES.map((style) => {
            const selected = value.profileStyle === style.key;
            const Icon = style.icon;
            return (
              <button
                key={style.key}
                type="button"
                onClick={() => set("profileStyle", style.key)}
                aria-pressed={selected}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-2.5 text-left transition",
                  selected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary"
                    : "border-border/70 hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <span className={cn("mb-2 flex h-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", style.swatch)}>
                  <Icon className="size-4" />
                </span>
                <span className="block text-xs font-semibold leading-tight">{style.label}</span>
                <span className="block text-[10px] leading-tight text-muted-foreground">{style.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Avatar frame</Label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_SHAPES.map((shape) => {
            const selected = value.avatarShape === shape.key;
            return (
              <button
                key={shape.key}
                type="button"
                onClick={() => set("avatarShape", shape.key)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/70 hover:border-primary/40",
                )}
              >
                <span
                  className={cn("size-8 bg-gradient-to-br from-primary to-violet-500", shape.className)}
                  style={shape.clip ? { clipPath: shape.clip } : undefined}
                />
                {shape.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-skills`}>Skills ({value.skills.length}/12)</Label>
        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50">
          {value.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {skill}
              <button
                type="button"
                onClick={() => set("skills", value.skills.filter((s) => s !== skill))}
                aria-label={`Remove ${skill}`}
                className="rounded hover:bg-primary/20"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <input
            id={`${idPrefix}-skills`}
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={onSkillKey}
            onBlur={() => addSkills(skillDraft)}
            placeholder={value.skills.length ? "" : "Product CGI, Blender, Packaging…"}
            disabled={value.skills.length >= 12}
            className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add. Left empty, the profile shows defaults for the style.
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Social accounts</Label>
        <p className="text-xs text-muted-foreground">
          Full links, e.g. https://facebook.com/yourname. Empty fields are hidden.
        </p>
        <div className={cn("grid gap-2.5", !compact && "sm:grid-cols-2")}>
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.key} className="grid gap-1">
              <label
                htmlFor={`${idPrefix}-social-${field.key}`}
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: field.color }} />
                {field.label}
              </label>
              <Input
                id={`${idPrefix}-social-${field.key}`}
                type="url"
                inputMode="url"
                value={value.socials[field.key] ?? ""}
                onChange={(e) =>
                  set("socials", { ...value.socials, [field.key]: e.target.value })
                }
                placeholder={field.placeholder}
                maxLength={255}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
