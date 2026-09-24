export default function PortfolioBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* 1. Base Perspective Grid (High Precision & Contrast for Dark/Light) */}
            <div
                className="absolute inset-0 opacity-[0.5] dark:opacity-[0.16]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.22) 1px, transparent 1px)
          `,
                    backgroundSize: "36px 36px",
                    maskImage:
                        "radial-gradient(ellipse 85% 65% at 50% 35%, #000 65%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 85% 65% at 50% 35%, #000 65%, transparent 100%)",
                }}
            />

            {/* 2. Diagonal Laser Shimmer Light Beam */}
            <div className="absolute -inset-x-1/2 -top-1/2 h-[200%] w-[200%] overflow-hidden pointer-events-none opacity-40 dark:opacity-60">
                <div className="w-45 sm:w-70 h-[150%] bg-linear-to-r from-transparent via-primary/25 dark:via-primary/35 to-transparent blur-2xl animate-grid-shimmer" />
            </div>

            {/* 3. Pulsing Central Core Beacon */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 sm:w-187.5 h-75 sm:h-105 bg-linear-to-r from-primary/15 via-primary/15 to-cyan-500/15 dark:from-primary/20 dark:via-primary/15 dark:to-cyan-400/20 rounded-full blur-3xl animate-glow-pulse" />

            {/* 4. Ambient Floating Brand Orbs */}
            <div className="absolute top-1/3 left-4 sm:left-12 w-[320px] sm:w-112.5 h-80 sm:h-112.5 bg-brand-violet/10 dark:bg-dark-brand-violet/15 rounded-full blur-3xl animate-float-orb" />

            <div
                className="absolute top-1/2 right-4 sm:right-12 w-[320px] sm:w-112.5 h-80 sm:h-112.5 bg-brand-blue/10 dark:bg-dark-brand-blue/15 rounded-full blur-3xl animate-float-orb"
                style={{ animationDelay: "3s" }}
            />

            {/* 5. Top & Bottom Smooth Vignette Blend */}
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white dark:from-[#070B14] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white dark:from-[#070B14] to-transparent" />
        </div>
    );
}
