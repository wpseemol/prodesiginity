"use client";

import { MapPin } from "lucide-react";
import { OPEN_POSITIONS } from "@/data/careerData";

interface CareerOpeningsProps {
    onSelectRole: (roleTitle: string) => void;
}

export default function CareerOpenings({ onSelectRole }: CareerOpeningsProps) {
    return (
        <section
            id="openings"
            className="py-20 scroll-mt-12 border-b border-border-color dark:border-dark-border-color"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary dark:text-dark-primary">
                            Current Opportunities
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                            Open Positions
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 md:mt-0">
                        Select any role below to prefill the application form.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {OPEN_POSITIONS.map((job) => (
                        <div
                            key={job.id}
                            className="p-7 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-3 py-1 rounded-md bg-primary/10 text-primary dark:text-dark-primary text-[10px] font-black uppercase tracking-wider">
                                        {job.department}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {job.salary}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                                    {job.title}
                                </h3>

                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                    {job.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border-color dark:border-dark-border-color flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />{" "}
                                        {job.location}
                                    </span>
                                    <span>•</span>
                                    <span>{job.experience}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onSelectRole(job.title)}
                                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
