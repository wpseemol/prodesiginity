/**
 * components/team/StaffPortrait.tsx
 * ---------------------------------------------------------------------------
 * Fills its (positioned) parent with a member's portrait: the photo, else the
 * avatar, else large initials on their profile style's gradient.
 */

import SmartImage from "@/components/home/portfolio/SmartImage";
import { staffInitials } from "@/components/team/StaffAvatar";
import type { TeamMember } from "@/data/teamData";
import { resolveStaffStyle } from "@/data/staffStyles";
import { staffImage } from "@/lib/team-api";
import { cn } from "@/lib/utils";

interface StaffPortraitProps {
    member: TeamMember;
    alt?: string;
    sizes: string;
    priority?: boolean;
    /** Applied to the image (e.g. object-cover, hover zoom). */
    className?: string;
    /** Text size of the initials fallback. */
    initialsClassName?: string;
    draggable?: boolean;
}

export default function StaffPortrait({
    member,
    alt = member.photoAlt ?? `${member.name}, ${member.role}`,
    sizes,
    priority,
    className = "object-cover",
    initialsClassName = "text-5xl",
    draggable,
}: StaffPortraitProps) {
    const src = staffImage(member);

    if (src) {
        return (
            <SmartImage
                src={src}
                alt={alt}
                fallbackLabel={staffInitials(member.name)}
                fill
                sizes={sizes}
                priority={priority}
                className={className}
                draggable={draggable}
            />
        );
    }

    return (
        <span
            role="img"
            aria-label={alt}
            className={cn(
                "absolute inset-0 flex items-center justify-center bg-linear-to-br font-black tracking-tight text-white",
                resolveStaffStyle(member).classes.gradient,
                initialsClassName,
            )}
        >
            {staffInitials(member.name)}
        </span>
    );
}
