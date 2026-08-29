"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Award, Users } from "lucide-react";
import Counter from "./Counter";

export default function HeroBadges() {
    return (
        <>
            {/* Top Left: Experience Badge */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-4 -left-2 sm:-top-5 sm:-left-4 md:-left-6 z-20 group cursor-default"
            >
                <div className="relative flex flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/95 dark:bg-[#0c101c]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-transform duration-200 group-hover:scale-105">
                    <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-dark-primary shrink-0" />
                        <span className="text-base sm:text-lg lg:text-xl font-black bg-linear-to-r from-brand-violet to-primary dark:from-dark-brand-violet dark:to-dark-primary bg-clip-text text-transparent leading-none">
                            5+
                        </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight mt-1">
                        Years of
                        <br />
                        Experience
                    </span>
                </div>
            </motion.div>

            {/* Top Right: Team Members Badge */}
            <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                }}
                className="absolute -top-4 -right-2 sm:-top-5 sm:-right-4 md:-right-6 z-20 group cursor-default"
            >
                <div className="relative flex flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/95 dark:bg-[#0c101c]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-orange-500/5 transition-transform duration-200 group-hover:scale-105">
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-orange dark:text-dark-brand-orange shrink-0" />
                        <span className="text-base sm:text-lg lg:text-xl font-black text-brand-orange dark:text-dark-brand-orange leading-none">
                            12+
                        </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight mt-1">
                        Creative
                        <br />
                        Team
                    </span>
                </div>
            </motion.div>

            {/* Bottom Left: Completed Projects Badge */}
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                }}
                className="absolute -bottom-5 left-2 sm:left-4 md:left-6 z-20 group cursor-default"
            >
                <div className="relative flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-white/95 dark:bg-[#0c101c]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-emerald-500/5 transition-transform duration-200 group-hover:scale-105">
                    <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                    </div>

                    <div className="text-left">
                        <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            <Counter target={500} />+ Projects
                        </p>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            Delivered Worldwide
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
