"use client";

import { useState } from "react";
import CareerHero from "@/components/career/CareerHero";
import CareerPerks from "@/components/career/CareerPerks";
import CareerOpenings from "@/components/career/CareerOpenings";
import CareerForm from "@/components/career/CareerForm";
import type { CareersData } from "@/lib/careers";
import { useCareersData } from "@/lib/useCareersData";

export default function CareersPageView({ initial }: { initial: CareersData }) {
    const { content, jobs } = useCareersData(initial);
    const [selectedRole, setSelectedRole] = useState("");

    const handleSelectRole = (roleTitle: string) => {
        setSelectedRole(roleTitle);
        const formElement = document.getElementById("application-form");
        if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <main className="relative bg-white dark:bg-[#070B14] text-slate-900 dark:text-white transition-colors duration-300 font-sans select-none overflow-hidden">
            <CareerHero content={content.hero} openingsCount={jobs.length} />
            <CareerForm
                content={content.form}
                jobs={jobs}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
            />
            <CareerPerks content={content.perks} />
            <CareerOpenings
                content={content.openings}
                jobs={jobs}
                onSelectRole={handleSelectRole}
            />
        </main>
    );
}
