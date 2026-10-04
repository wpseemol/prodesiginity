/**
 * components/team/StaffAvatar.tsx
 * ---------------------------------------------------------------------------
 * A staff member's avatar in their own frame shape (circle, squircle, hexagon
 * or blob) with a gradient ring in their profile style's colours.
 *
 * Source order: the uploaded avatar image → the portrait photo → initials on
 * the style gradient. `source="photo"` prefers the real headshot and only
 * falls back to the avatar when there is no photo.
 */

import SmartImage from "@/components/home/portfolio/SmartImage";
import type { AvatarShape, TeamMember } from "@/data/teamData";
import {
    resolveAvatarShape,
    resolveStaffStyle,
    type StaffStyle,
} from "@/data/staffStyles";
import { cn } from "@/lib/utils";

const SHAPE_CLASS: Record<AvatarShape, string> = {
    circle: "rounded-full",
    squircle: "rounded-[30%]",
    blob: "rounded-[58%_42%_55%_45%/45%_55%_45%_55%]",
    hexagon: "",
};

const HEXAGON = "polygon(50% 0, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)";

export function staffInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

interface StaffAvatarProps {
    member: TeamMember;
    /** Sizing classes, e.g. "h-20 w-20". */
    className?: string;
    style?: StaffStyle;
    shape?: AvatarShape;
    source?: "avatar" | "photo";
    ring?: boolean;
    /** `sizes` hint for the image. */
    sizes?: string;
    priority?: boolean;
}

export default function StaffAvatar({
    member,
    className = "h-16 w-16",
    style = resolveStaffStyle(member),
    shape = resolveAvatarShape(member, style),
    source = "avatar",
    ring = true,
    sizes = "160px",
    priority,
}: StaffAvatarProps) {
    const src =
        source === "avatar" ? member.avatar || member.photo : member.photo || member.avatar;
    const clipPath = shape === "hexagon" ? HEXAGON : undefined;

    return (
        <span
            className={cn(
                "relative inline-block shrink-0",
                ring && cn("bg-linear-to-br p-[3px] shadow-lg", style.classes.gradient),
                SHAPE_CLASS[shape],
                className,
            )}
            style={{ clipPath }}
        >
            <span
                className={cn(
                    "relative block h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800",
                    SHAPE_CLASS[shape],
                )}
                style={{ clipPath }}
            >
                {src ? (
                    <SmartImage
                        src={src}
                        alt={member.photoAlt ?? `${member.name}, ${member.role}`}
                        fallbackLabel={staffInitials(member.name)}
                        fill
                        sizes={sizes}
                        priority={priority}
                        className="object-cover"
                        draggable={false}
                    />
                ) : (
                    <span
                        className={cn(
                            "flex h-full w-full items-center justify-center bg-linear-to-br font-black text-white",
                            style.classes.gradient,
                        )}
                    >
                        {staffInitials(member.name)}
                    </span>
                )}
            </span>
        </span>
    );
}
