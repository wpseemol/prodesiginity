import { HeaderPill } from "@/components/HeaderPill";
import PortfolioBackground from "@/components/home/portfolio/PortfolioBackground";
import { OPEN_POSITIONS } from "@/data/careerData";

export default function CareerHero() {
    return (
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-border-color dark:border-dark-border-color">
            <PortfolioBackground />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
                <HeaderPill
                    text="Careers at ProDesignity"
                    className="mb-6 sm:mb-8"
                />

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                    Build the Future of Digital Commerce <br />
                    <span className="bg-linear-to-r from-primary via-brand-violet to-cyan-500 dark:from-primary dark:via-dark-primary dark:to-cyan-400 bg-clip-text text-transparent">
                        With Elite Creators
                    </span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    We are looking for exceptional video editors, full-stack
                    Shopify developers, brand strategists, and 3D artists ready
                    to produce world-class creative output.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="#openings"
                        className="px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all cursor-pointer"
                    >
                        Explore Open Positions ({OPEN_POSITIONS.length})
                    </a>
                    <a
                        href="#application-form"
                        className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-dark-card-bg text-slate-800 dark:text-slate-200 border border-border-color dark:border-dark-border-color font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                        Direct Fast Apply
                    </a>
                </div>
            </div>
        </section>
    );
}
