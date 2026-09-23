import { CAREER_PERKS } from "@/data/careerData";

export default function CareerPerks() {
    return (
        <section className="py-20 border-b border-border-color dark:border-dark-border-color">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Why You&apos;ll Love Working Here
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        Zero micromanagement, autonomous workflows, and real
                        impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CAREER_PERKS.map((perk, i) => {
                        const Icon = perk.icon;
                        return (
                            <div
                                key={i}
                                className="p-6 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:shadow-md transition-all space-y-3"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary flex items-center justify-center">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {perk.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {perk.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
