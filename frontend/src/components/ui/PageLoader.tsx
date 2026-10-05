import { cn } from "@/lib/utils";

const DOT_DELAYS = ["0s", "0.15s", "0.3s"];
const SKELETON_WIDTHS = ["w-full", "w-11/12", "w-2/3"];

/**
 * Full-section loading state shown while a page waits on the API: a spinning
 * gradient ring, a label with pulsing dots and a shimmering content skeleton.
 * Hook-free, so it renders in server and client components alike.
 */
export default function PageLoader({
    label = "Loading",
    className,
}: {
    label?: string;
    className?: string;
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-white px-4 font-sans transition-colors duration-300 dark:bg-[#070B14]",
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-brand-violet/25 via-primary/20 to-cyan-400/20 blur-3xl animate-pulse motion-reduce:animate-none"
            />

            <div aria-hidden="true" className="relative h-24 w-24">
                <div className="loader-ring absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--color-brand-violet),var(--color-primary),#22d3ee,transparent)] animate-spin [animation-duration:1.2s] motion-reduce:animate-none" />
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-primary/30 dark:border-dark-primary/30 animate-spin-reverse motion-reduce:animate-none" />
                <div className="absolute inset-[34%] rounded-full bg-linear-to-br from-brand-violet to-brand-blue shadow-lg shadow-primary/40 dark:from-dark-brand-violet dark:to-dark-brand-blue animate-pulse motion-reduce:animate-none" />
            </div>

            <p className="relative mt-8 flex items-center text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                {label}
                <span aria-hidden="true" className="ml-1.5 flex gap-1">
                    {DOT_DELAYS.map((delay) => (
                        <span
                            key={delay}
                            style={{ animationDelay: delay }}
                            className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-dark-primary animate-loader-dot motion-reduce:animate-none"
                        />
                    ))}
                </span>
            </p>

            <div aria-hidden="true" className="relative mt-6 w-full max-w-xs space-y-2.5">
                {SKELETON_WIDTHS.map((width) => (
                    <div
                        key={width}
                        className={cn(
                            "relative mx-auto h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80",
                            width,
                        )}
                    >
                        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/10 animate-shimmer motion-reduce:animate-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
