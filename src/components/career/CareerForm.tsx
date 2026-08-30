"use client";

import { useState } from "react";
import {
    UploadCloud,
    Send,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CheckCircle2,
    Globe,
} from "lucide-react";
import { HeaderPill } from "@/components/HeaderPill";
import { OPEN_POSITIONS, BD_CITIES } from "@/data/careerData";

interface CareerFormProps {
    selectedRole: string;
    onRoleChange: (role: string) => void;
}

export default function CareerForm({
    selectedRole,
    onRoleChange,
}: CareerFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        portfolioUrl: "",
        experienceYears: "1-3 years",
        coverLetter: "",
    });

    const [resume, setResume] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("city", formData.city);
            data.append("jobTitle", selectedRole);
            data.append("portfolioUrl", formData.portfolioUrl);
            data.append("experienceYears", formData.experienceYears);
            data.append("coverLetter", formData.coverLetter);
            if (resume) data.append("resume", resume);

            const res = await fetch(
                "https://api.prodesignity.com/api/career/send-mail",
                {
                    method: "POST",
                    body: data,
                },
            );

            const jsonResult = await res.json();

            if (res.ok && jsonResult.success !== false) {
                setSubmitted(true);
            } else {
                setErrorMsg(
                    jsonResult.error ||
                        "Failed to submit application. Please check your data.",
                );
            }
        } catch (err) {
            setErrorMsg(
                (err as Error)?.message ||
                    "Network error. Please make sure the backend server is running.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="application-form" className="py-24 scroll-mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="text-center mb-12">
                    <HeaderPill text="Direct Application" className="mb-4" />
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Submit Your Candidacy
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Fill out your details, upload your CV, and your file
                        will be directly dispatched to our talent acquisition
                        desk.
                    </p>
                </div>

                <div className="bg-card-bg dark:bg-dark-card-bg rounded-3xl p-6 sm:p-10 border border-border-color dark:border-dark-border-color shadow-2xl">
                    {submitted ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                Application Submitted Successfully!
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                Thank you for applying,{" "}
                                <strong>{formData.name}</strong>. Our recruiting
                                team will review your resume for the{" "}
                                <strong>{selectedRole}</strong> position and
                                reach out to you at{" "}
                                <strong>{formData.email}</strong>.
                            </p>
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setResume(null);
                                        onRoleChange("");
                                        setFormData({
                                            name: "",
                                            email: "",
                                            phone: "",
                                            city: "",
                                            portfolioUrl: "",
                                            experienceYears: "1-3 years",
                                            coverLetter: "",
                                        });
                                    }}
                                    className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all cursor-pointer"
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errorMsg && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Target Role Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Target Role{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        required
                                        value={selectedRole}
                                        onChange={(e) =>
                                            onRoleChange(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none text-slate-800 dark:text-slate-200"
                                    >
                                        <option value="" disabled>
                                            Select your desired role
                                        </option>
                                        {OPEN_POSITIONS.map((pos) => (
                                            <option
                                                key={pos.id}
                                                value={pos.title}
                                                className="bg-white dark:bg-[#070B14]"
                                            >
                                                {pos.title} ({pos.department})
                                            </option>
                                        ))}
                                        <option
                                            value="General Consideration / Other"
                                            className="bg-white dark:bg-[#070B14]"
                                        >
                                            General Consideration / Other Role
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Full Name{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Parves Sikder"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Email Address{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="parves@example.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Phone & City */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                        WhatsApp Number{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+880 1XXXXXXXXX"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors text-slate-800 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                        Current City (BD){" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <select
                                            required
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    city: e.target.value,
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none text-slate-800 dark:text-slate-200"
                                        >
                                            <option value="" disabled>
                                                Select your city
                                            </option>
                                            {BD_CITIES.map((city) => (
                                                <option
                                                    key={city}
                                                    value={city}
                                                    className="bg-white dark:bg-[#070B14]"
                                                >
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Link */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Portfolio / Showreel / GitHub Link
                                </label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="url"
                                        placeholder="https://behance.net/username or https://github.com/..."
                                        value={formData.portfolioUrl}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                portfolioUrl: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Resume File Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Upload Resume / CV (PDF or DOCX){" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-color dark:border-dark-border-color rounded-2xl cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-slate-50/50 dark:bg-slate-900/40">
                                    <UploadCloud className="w-8 h-8 text-primary mb-2" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                                        {resume
                                            ? resume.name
                                            : "Click to select or drag & drop file"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">
                                        PDF, DOC, DOCX up to 10MB
                                    </span>
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Cover Note */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Short Cover Note / Introduction
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tell us briefly about your primary strengths, favorite tools, and availability..."
                                    value={formData.coverLetter}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            coverLetter: e.target.value,
                                        })
                                    }
                                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-border-color dark:border-dark-border-color text-sm focus:outline-none focus:border-primary transition-colors text-slate-800 dark:text-slate-200"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-brand-violet to-brand-blue hover:from-primary-hover hover:to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue dark:hover:from-dark-primary-hover dark:hover:to-dark-brand-blue text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <span>Submitting Application...</span>
                                ) : (
                                    <>
                                        <span>Submit Application</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
