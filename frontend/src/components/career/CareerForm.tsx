"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Clock,
    FileText,
    X,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { HeaderPill } from "@/components/HeaderPill";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { apiBaseUrl } from "@/config/api";
import { BD_CITIES, type CareersContent, type JobPosition } from "@/data/careerData";
import {
    CAREER_DEFAULTS,
    COVER_MAX,
    EXPERIENCE_LEVELS,
    GENERAL_ROLE,
    RESUME_ACCEPT,
    careerSchemaFor,
    type CareerFormInput,
    type CareerFormValues,
} from "@/lib/validation/career";
import { cn } from "@/lib/utils";

interface CareerFormProps {
    content: CareersContent["form"];
    jobs: JobPosition[];
    selectedRole: string;
    onRoleChange: (role: string) => void;
}

type Submitted = { name: string; email: string; role: string; reference?: string };

const SERVER_FIELDS = new Set<keyof CareerFormInput>([
    "jobTitle",
    "name",
    "email",
    "phone",
    "city",
    "experience",
    "portfolioUrl",
    "coverLetter",
    "resume",
    "consent",
]);

const MIME_BY_EXT: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const FIELD =
    "w-full rounded-xl border border-border-color bg-slate-50 py-3.5 pr-4 pl-10 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none aria-[invalid=true]:border-rose-500 aria-[invalid=true]:bg-rose-50/40 dark:border-dark-border-color dark:bg-slate-900/80 dark:text-slate-200 dark:aria-[invalid=true]:bg-rose-950/20";
const SELECT = cn(FIELD, "cursor-pointer appearance-none");
const ICON = "pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400";

function Required() {
    return (
        <span className="text-rose-500" aria-hidden="true">
            *
        </span>
    );
}

function WithIcon({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <div className="relative">
            {icon}
            {children}
        </div>
    );
}

function formatBytes(bytes: number) {
    return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Browsers sometimes send an empty type for Word files; the API needs the real one. */
function withMimeType(file: File) {
    const expected = MIME_BY_EXT[file.name.split(".").pop()?.toLowerCase() ?? ""];
    return file.type || !expected ? file : new File([file], file.name, { type: expected });
}

export default function CareerForm({ content, jobs, selectedRole, onRoleChange }: CareerFormProps) {
    const schema = useMemo(() => careerSchemaFor(jobs.map((job) => job.title)), [jobs]);
    const form = useForm<CareerFormInput, unknown, CareerFormValues>({
        resolver: zodResolver(schema),
        defaultValues: CAREER_DEFAULTS,
        mode: "onTouched",
    });
    const { isSubmitting } = form.formState;

    const [submitted, setSubmitted] = useState<Submitted | null>(null);
    const [serverError, setServerError] = useState("");
    const [dragging, setDragging] = useState(false);
    const startedAt = useRef(0);
    const honeypot = useRef<HTMLInputElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        startedAt.current = Date.now();
    }, []);

    useEffect(() => {
        if (selectedRole && selectedRole !== form.getValues("jobTitle")) {
            form.setValue("jobTitle", selectedRole, { shouldValidate: true, shouldDirty: true });
        }
    }, [selectedRole, form]);

    const coverLength =
        useWatch({ control: form.control, name: "coverLetter" })?.length ?? 0;

    const pickFile = (file: File | undefined) => {
        form.setValue("resume", file, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragging(false);
        pickFile(event.dataTransfer.files?.[0]);
    };

    const onSubmit = async (values: CareerFormValues) => {
        setServerError("");

        const body = new FormData();
        body.append("jobTitle", values.jobTitle);
        body.append("name", values.name);
        body.append("email", values.email);
        body.append("phone", values.phone);
        body.append("city", values.city);
        body.append("experience", values.experience);
        body.append("portfolioUrl", values.portfolioUrl);
        body.append("coverLetter", values.coverLetter);
        body.append("consent", String(values.consent));
        body.append("website", honeypot.current?.value ?? "");
        body.append("startedAt", String(startedAt.current));
        body.append("resume", withMimeType(values.resume as File));

        try {
            const res = await fetch(`${apiBaseUrl}/careers/apply`, { method: "POST", body });
            const data = (await res.json().catch(() => ({}))) as {
                message?: string;
                field?: string;
                reference?: string;
            };

            if (!res.ok) {
                const field = data.field as keyof CareerFormInput | undefined;
                if (field && SERVER_FIELDS.has(field)) {
                    form.setError(field, { message: data.message }, { shouldFocus: true });
                } else {
                    setServerError(data.message || "We could not submit your application. Please try again.");
                }
                return;
            }

            setSubmitted({
                name: values.name,
                email: values.email,
                role: values.jobTitle,
                reference: data.reference,
            });
        } catch {
            setServerError("Network error. Check your connection and try again.");
        }
    };

    const startOver = () => {
        setSubmitted(null);
        setServerError("");
        form.reset(CAREER_DEFAULTS);
        onRoleChange("");
        startedAt.current = Date.now();
    };

    return (
        <section id="application-form" className="scroll-mt-12 py-24">
            <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <HeaderPill text={content.badge} className="mb-4" />
                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{content.title}</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{content.subtitle}</p>
                </div>

                <div className="rounded-3xl border border-border-color bg-card-bg p-6 shadow-2xl sm:p-10 dark:border-dark-border-color dark:bg-dark-card-bg">
                    {submitted ? (
                        <div className="space-y-4 py-12 text-center" role="status">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                Application submitted
                            </h3>
                            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                Thank you for applying, <strong>{submitted.name}</strong>. Our hiring team will
                                review your CV for the <strong>{submitted.role}</strong> role and reply to{" "}
                                <strong>{submitted.email}</strong>.
                            </p>
                            {submitted.reference ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Reference:{" "}
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                                        {submitted.reference}
                                    </span>
                                </p>
                            ) : null}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={startOver}
                                    className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white transition-all hover:bg-primary-hover"
                                >
                                    Submit another application
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                onSubmit={(event) => form.handleSubmit(onSubmit)(event)}
                                noValidate
                                className="relative space-y-5"
                                aria-busy={isSubmitting}
                            >
                                {serverError ? (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400"
                                    >
                                        {serverError}
                                    </div>
                                ) : null}

                                {/* Honeypot: invisible to people, bots fill it in. */}
                                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                                    <label>
                                        Website
                                        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                                    </label>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="jobTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Target role <Required />
                                            </FormLabel>
                                            <WithIcon icon={<Briefcase className={ICON} />}>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            onRoleChange(e.target.value);
                                                        }}
                                                        className={SELECT}
                                                    >
                                                        <option value="" disabled>
                                                            Select your desired role
                                                        </option>
                                                        {jobs.map((pos) => (
                                                            <option key={pos.id} value={pos.title} className="bg-white dark:bg-[#070B14]">
                                                                {pos.title} ({pos.department})
                                                            </option>
                                                        ))}
                                                        <option value={GENERAL_ROLE} className="bg-white dark:bg-[#070B14]">
                                                            General consideration / other role
                                                        </option>
                                                    </select>
                                                </FormControl>
                                            </WithIcon>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Full name <Required />
                                                </FormLabel>
                                                <WithIcon icon={<User className={ICON} />}>
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            autoComplete="name"
                                                            maxLength={80}
                                                            placeholder="e.g. Parves Sikder"
                                                            className={FIELD}
                                                        />
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Email address <Required />
                                                </FormLabel>
                                                <WithIcon icon={<Mail className={ICON} />}>
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            type="email"
                                                            inputMode="email"
                                                            autoComplete="email"
                                                            spellCheck={false}
                                                            maxLength={254}
                                                            placeholder="parves@example.com"
                                                            className={FIELD}
                                                        />
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    WhatsApp number <Required />
                                                </FormLabel>
                                                <WithIcon icon={<Phone className={ICON} />}>
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            type="tel"
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            maxLength={20}
                                                            placeholder="+880 1XXXXXXXXX"
                                                            className={FIELD}
                                                        />
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current city (BD) <Required />
                                                </FormLabel>
                                                <WithIcon icon={<MapPin className={ICON} />}>
                                                    <FormControl>
                                                        <select {...field} className={SELECT}>
                                                            <option value="" disabled>
                                                                Select your city
                                                            </option>
                                                            {BD_CITIES.map((city) => (
                                                                <option key={city} value={city} className="bg-white dark:bg-[#070B14]">
                                                                    {city}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Experience <Required />
                                                </FormLabel>
                                                <WithIcon icon={<Clock className={ICON} />}>
                                                    <FormControl>
                                                        <select {...field} className={SELECT}>
                                                            {EXPERIENCE_LEVELS.map((level) => (
                                                                <option key={level} value={level} className="bg-white dark:bg-[#070B14]">
                                                                    {level}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="portfolioUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Portfolio / showreel / GitHub</FormLabel>
                                                <WithIcon icon={<Globe className={ICON} />}>
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            type="url"
                                                            inputMode="url"
                                                            autoComplete="url"
                                                            spellCheck={false}
                                                            maxLength={300}
                                                            placeholder="https://behance.net/username"
                                                            className={FIELD}
                                                        />
                                                    </FormControl>
                                                </WithIcon>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="resume"
                                    render={({ field: { value, onBlur, name, ref } }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Resume / CV <Required />
                                            </FormLabel>
                                            {value instanceof File ? (
                                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                                        <FileText className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                                                            {value.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{formatBytes(value.size)}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            pickFile(undefined);
                                                            if (fileInput.current) fileInput.current.value = "";
                                                        }}
                                                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                                                        aria-label="Remove file"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : null}
                                            <label
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragging(true);
                                                }}
                                                onDragLeave={() => setDragging(false)}
                                                onDrop={onDrop}
                                                className={cn(
                                                    "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50/50 p-6 transition-colors hover:border-primary dark:bg-slate-900/40",
                                                    dragging ? "border-primary bg-primary/5" : "border-border-color dark:border-dark-border-color",
                                                    form.formState.errors.resume && "border-rose-500",
                                                    value instanceof File && "hidden",
                                                )}
                                            >
                                                <UploadCloud className="mb-2 h-8 w-8 text-primary" />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Click to select or drag &amp; drop your CV
                                                </span>
                                                <span className="mt-1 text-[10px] text-slate-400">PDF, DOC or DOCX · up to 5 MB</span>
                                                <FormControl>
                                                    <input
                                                        ref={(el) => {
                                                            fileInput.current = el;
                                                            ref(el);
                                                        }}
                                                        name={name}
                                                        onBlur={onBlur}
                                                        type="file"
                                                        accept={RESUME_ACCEPT}
                                                        onChange={(e) => pickFile(e.target.files?.[0])}
                                                        className="sr-only"
                                                    />
                                                </FormControl>
                                            </label>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="coverLetter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Short cover note</FormLabel>
                                                <span
                                                    className={cn(
                                                        "text-[11px] tabular-nums",
                                                        coverLength > COVER_MAX ? "font-bold text-rose-500" : "text-slate-400",
                                                    )}
                                                >
                                                    {coverLength}/{COVER_MAX}
                                                </span>
                                            </div>
                                            <FormControl>
                                                <textarea
                                                    {...field}
                                                    rows={4}
                                                    maxLength={COVER_MAX + 100}
                                                    placeholder="Your strongest skills, favourite tools and when you can start…"
                                                    className={cn(FIELD, "resize-y py-3.5 pl-3.5")}
                                                />
                                            </FormControl>
                                            <FormDescription>Plain text only. Links go in the portfolio field.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="consent"
                                    render={({ field: { value, onChange, onBlur, name, ref } }) => (
                                        <FormItem>
                                            <div className="flex items-start gap-3">
                                                <FormControl>
                                                    <input
                                                        ref={ref}
                                                        name={name}
                                                        onBlur={onBlur}
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => onChange(e.target.checked)}
                                                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border-color accent-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="cursor-pointer text-[11px] leading-relaxed font-medium tracking-normal normal-case">
                                                    I agree that ProDesignity may store my details and CV to review this
                                                    application, as described in the{" "}
                                                    <a href="/privacy-policy/" className="font-bold text-primary hover:underline">
                                                        privacy policy
                                                    </a>
                                                    .
                                                </FormLabel>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-brand-violet to-brand-blue px-6 py-4 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:from-primary-hover hover:to-brand-blue disabled:cursor-not-allowed disabled:opacity-60 dark:from-dark-brand-violet dark:to-dark-brand-blue"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting application…
                                        </>
                                    ) : (
                                        <>
                                            Submit application
                                            <Send className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    Your CV is stored privately and only our hiring team can open it.
                                </p>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
        </section>
    );
}
