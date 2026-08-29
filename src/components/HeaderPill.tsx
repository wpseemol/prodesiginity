// components/ui/section-badge.tsx
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
    text?: string;
    className?: string;
    dotClassName?: string;
    inlineDivClassName?: string;
    icon?: React.ReactNode;
}

export function HeaderPill({
    text = "Our Numbers Speak",
    className,
    dotClassName,
    icon,
    inlineDivClassName,
}: SectionBadgeProps) {
    return (
        <div className={cn("flex justify-center mb-8 sm:mb-8", className)}>
            <div
                className={cn(
                    "inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary/85 dark:text-primary/80 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm",
                    inlineDivClassName,
                )}
            >
                {icon ?? (
                    <span
                        className={cn(
                            "w-2 h-2 rounded-full bg-primary animate-pulse",
                            dotClassName,
                        )}
                    />
                )}
                {text}
            </div>
        </div>
    );
}
