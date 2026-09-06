"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Send, ArrowRight } from "lucide-react";

interface ContactFormProps {
    fadeInVariant: Variants;
}

export default function ContactForm({ fadeInVariant }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        service: "Shopify Development",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AService: ${formData.service}%0ASubject: ${formData.subject}%0AMessage: ${formData.message}`;
        window.open(`https://wa.me/8801738142398?text=${text}`, "_blank");
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={fadeInVariant}
            className="p-8 sm:p-10 rounded-3xl bg-card-bg dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color shadow-2xl relative"
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color dark:border-dark-border-color">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Send className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Send Us a Message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        We typically reply within 1–2 hours on WhatsApp &amp;
                        Email.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Phone Number (WhatsApp)
                        </label>
                        <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Service Needed
                        </label>
                        <select
                            value={formData.service}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    service: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all cursor-pointer"
                        >
                            <option value="Shopify Development">
                                Shopify Development
                            </option>
                            <option value="Web Design & Development">
                                Web Design & Development
                            </option>
                            <option value="Video Editing & Motion">
                                Video Editing & Motion
                            </option>
                            <option value="3D Animation & Visuals">
                                3D Animation & Visuals
                            </option>
                            <option value="Custom Project">
                                Custom Inquiries
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Subject *
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Project Inquiry / Redesign"
                        value={formData.subject}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                subject: e.target.value,
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Your Message *
                    </label>
                    <textarea
                        rows={4}
                        required
                        placeholder="Tell us about your project, timeline, and goals..."
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                message: e.target.value,
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-primary to-primary/80 hover:from-primary hover:to-teal-700 shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer"
                >
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </motion.div>
    );
}
