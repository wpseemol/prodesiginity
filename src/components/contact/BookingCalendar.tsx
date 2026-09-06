"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Globe,
    Loader2,
    MessageSquare,
    Video,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const STUDIO_UTC_OFFSET_HOURS = 6;
const STUDIO_TZ_LABEL = "Dhaka (GMT+6)";
const SLOT_HOURS = [10, 11, 12, 14, 15, 16, 17, 18, 20];
const CLOSED_WEEKDAYS = [5];
const MEETING_MINUTES = 30;
const BOOKING_WINDOW_DAYS = 60;
const MIN_LEAD_HOURS = 4;
const API_ENDPOINT = "/api/book-call.php";

const SUBSCRIBE_NOOP = () => () => {};
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
});

type Step = "date" | "time" | "details";
type Status = "idle" | "sending" | "done" | "fallback";

interface BookingResult {
    joinUrl?: string;
    meetingId?: string;
    passcode?: string;
}

function dateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseKey(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    return { year, month: month - 1, day };
}

function slotInstant(key: string, hour: number): Date {
    const { year, month, day } = parseKey(key);
    return new Date(
        Date.UTC(year, month, day, hour - STUDIO_UTC_OFFSET_HOURS, 0, 0),
    );
}

function formatStudioHour(hour: number): string {
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:00 ${suffix}`;
}

function toIcsStamp(date: Date): string {
    return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

export default function BookingCalendar() {
    const [step, setStep] = useState<Step>("date");
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        notes: "",
    });
    const [status, setStatus] = useState<Status>("idle");
    const [result, setResult] = useState<BookingResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isClient = useSyncExternalStore(
        SUBSCRIBE_NOOP,
        () => true,
        () => false,
    );
    // eslint-disable-next-line react-hooks/purity
    const nowMs = useMemo(() => (isClient ? Date.now() : 0), [isClient]);

    const visitorTz = useMemo(() => {
        if (!isClient) return "";
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return "";
        }
    }, [isClient]);

    const { viewYear, viewMonth } = useMemo(() => {
        const base = new Date(nowMs);
        const shifted = new Date(
            base.getFullYear(),
            base.getMonth() + monthOffset,
            1,
        );
        return {
            viewYear: shifted.getFullYear(),
            viewMonth: shifted.getMonth(),
        };
    }, [nowMs, monthOffset]);

    const { todayKey, maxKey } = useMemo(() => {
        if (!isClient) return { todayKey: "", maxKey: "" };
        const now = new Date(nowMs);
        const max = new Date(nowMs);
        max.setDate(max.getDate() + BOOKING_WINDOW_DAYS);
        return {
            todayKey: dateKey(now.getFullYear(), now.getMonth(), now.getDate()),
            maxKey: dateKey(max.getFullYear(), max.getMonth(), max.getDate()),
        };
    }, [isClient, nowMs]);

    const cells = useMemo(() => {
        if (!isClient) return [];
        const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const out: ({ key: string; day: number; disabled: boolean } | null)[] =
            Array.from({ length: firstWeekday }, () => null);

        for (let day = 1; day <= daysInMonth; day += 1) {
            const key = dateKey(viewYear, viewMonth, day);
            const weekday = new Date(viewYear, viewMonth, day).getDay();
            const disabled =
                key < todayKey ||
                key > maxKey ||
                CLOSED_WEEKDAYS.includes(weekday);
            out.push({ key, day, disabled });
        }
        return out;
    }, [isClient, viewYear, viewMonth, todayKey, maxKey]);

    const slots = useMemo(() => {
        if (!selectedDate) return [];
        const cutoff = nowMs + MIN_LEAD_HOURS * 3600_000;
        return SLOT_HOURS.map((hour) => {
            const instant = slotInstant(selectedDate, hour);
            return {
                hour,
                instant,
                disabled: instant.getTime() < cutoff,
                studioLabel: formatStudioHour(hour),
                localLabel: new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                }).format(instant),
            };
        });
    }, [selectedDate, nowMs]);

    const canGoBackAMonth = monthOffset > 0;
    const shiftMonth = (delta: number) =>
        setMonthOffset((v) => Math.max(0, v + delta));

    const chosenInstant =
        selectedDate && selectedHour !== null
            ? slotInstant(selectedDate, selectedHour)
            : null;

    const longDate = chosenInstant
        ? new Intl.DateTimeFormat(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
          }).format(chosenInstant)
        : "";

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!chosenInstant || !selectedDate || selectedHour === null) return;

        setStatus("sending");
        setError(null);

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            company: form.company.trim(),
            notes: form.notes.trim(),
            date: selectedDate,
            studioHour: selectedHour,
            startUtc: chosenInstant.toISOString(),
            durationMinutes: MEETING_MINUTES,
            visitorTimezone: visitorTz,
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = (await response.json()) as {
                ok?: boolean;
                error?: string;
                joinUrl?: string;
                meetingId?: string;
                passcode?: string;
            };

            if (!data.ok) throw new Error(data.error || "Booking failed");

            setResult({
                joinUrl: data.joinUrl,
                meetingId: data.meetingId,
                passcode: data.passcode,
            });
            setStatus("done");
        } catch (err) {
            console.warn("Booking endpoint unavailable:", err);
            setError(
                "Could not auto-confirm. Connect via WhatsApp for immediate confirmation.",
            );
            setStatus("fallback");
        }
    };

    const downloadIcs = () => {
        if (!chosenInstant) return;
        const end = new Date(
            chosenInstant.getTime() + MEETING_MINUTES * 60_000,
        );
        const description = result?.joinUrl
            ? `Zoom link: ${result.joinUrl}`
            : `Contact: ${siteConfig.email}`;

        const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            `PRODID:-//${siteConfig.name}//Booking//EN`,
            "BEGIN:VEVENT",
            `UID:${chosenInstant.getTime()}@${siteConfig.domain}`,
            `DTSTAMP:${toIcsStamp(new Date())}`,
            `DTSTART:${toIcsStamp(chosenInstant)}`,
            `DTEND:${toIcsStamp(end)}`,
            `SUMMARY:Strategy call with ${siteConfig.name}`,
            `DESCRIPTION:${description}`,
            result?.joinUrl ? `URL:${result.joinUrl}` : "",
            "END:VEVENT",
            "END:VCALENDAR",
        ]
            .filter(Boolean)
            .join("\r\n");

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "prodesignity-call.ics";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setStep("date");
        setSelectedDate(null);
        setSelectedHour(null);
        setStatus("idle");
        setResult(null);
        setError(null);
    };

    const shellClass =
        "w-full rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border-color dark:border-dark-border-color shadow-lg overflow-hidden";

    if (!isClient) {
        return (
            <div className={cn(shellClass, "p-5 space-y-3")}>
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
        );
    }

    if (status === "done") {
        return (
            <div className={cn(shellClass, "p-5 sm:p-6")}>
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Call Confirmed!
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Check {form.email} for details.
                        </p>
                    </div>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border-color dark:border-dark-border-color text-xs space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                        {longDate}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                        {selectedHour !== null &&
                            formatStudioHour(selectedHour)}{" "}
                        {STUDIO_TZ_LABEL} (30 min)
                    </p>
                </div>

                <div className="mt-3.5 flex gap-2">
                    {result?.joinUrl && (
                        <a
                            href={result.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
                        >
                            <Video className="w-3.5 h-3.5" />
                            Zoom Link
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={downloadIcs}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Calendar (.ics)
                    </button>
                </div>

                <button
                    type="button"
                    onClick={reset}
                    className="mt-2.5 w-full text-[11px] text-slate-400 hover:text-primary transition-colors text-center"
                >
                    Book another time
                </button>
            </div>
        );
    }

    return (
        <div className={shellClass}>
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-color dark:border-dark-border-color">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center">
                        <Video className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            30-Min Strategy Call
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Free on Zoom · No pitch
                        </p>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <span className={cn(step === "date" && "text-primary")}>
                        Date
                    </span>
                    <span>›</span>
                    <span className={cn(step === "time" && "text-primary")}>
                        Time
                    </span>
                    <span>›</span>
                    <span className={cn(step === "details" && "text-primary")}>
                        Details
                    </span>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {/* Step 1: Date */}
                {step === "date" && (
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                disabled={!canGoBackAMonth}
                                aria-label="Previous month"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {MONTH_FORMAT.format(
                                    new Date(viewYear, viewMonth, 1),
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                aria-label="Next month"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {WEEKDAY_LABELS.map((label, i) => (
                                <span
                                    key={`${label}-${i}`}
                                    className="text-center text-[9px] font-bold text-slate-400 dark:text-slate-500"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((cell, idx) =>
                                cell === null ? (
                                    <span
                                        key={`blank-${idx}`}
                                        className="h-7 w-7"
                                    />
                                ) : (
                                    <button
                                        key={cell.key}
                                        type="button"
                                        disabled={cell.disabled}
                                        onClick={() => {
                                            setSelectedDate(cell.key);
                                            setSelectedHour(null);
                                            setStep("time");
                                        }}
                                        className={cn(
                                            "h-7 w-7 mx-auto rounded-md text-[11px] font-semibold flex items-center justify-center transition-all",
                                            cell.disabled
                                                ? "text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed"
                                                : "text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary",
                                            selectedDate === cell.key &&
                                                "bg-primary text-white hover:bg-primary hover:text-white",
                                        )}
                                    >
                                        {cell.day}
                                    </button>
                                ),
                            )}
                        </div>

                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                            <CalendarDays className="w-3 h-3 text-primary" />
                            Saturday – Thursday availability
                        </p>
                    </div>
                )}

                {/* Step 2: Time Slots */}
                {step === "time" && selectedDate && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={() => setStep("date")}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-primary transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Back
                            </button>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {new Intl.DateTimeFormat(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                }).format(slotInstant(selectedDate, 12))}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {slots.map((slot) => (
                                <button
                                    key={slot.hour}
                                    type="button"
                                    disabled={slot.disabled}
                                    onClick={() => {
                                        setSelectedHour(slot.hour);
                                        setStep("details");
                                    }}
                                    className={cn(
                                        "py-2 px-1.5 rounded-lg border text-center transition-all",
                                        slot.disabled
                                            ? "border-border-color dark:border-dark-border-color opacity-30 cursor-not-allowed"
                                            : "border-border-color dark:border-dark-border-color hover:border-primary hover:bg-primary/5",
                                        selectedHour === slot.hour &&
                                            "border-primary bg-primary/10",
                                    )}
                                >
                                    <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                        {slot.studioLabel}
                                    </span>
                                    <span className="block text-[9px] text-slate-400 dark:text-slate-500">
                                        {slot.localLabel}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Minimal Form */}
                {step === "details" && chosenInstant && (
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        <div className="flex items-center justify-between mb-1">
                            <button
                                type="button"
                                onClick={() => setStep("time")}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-primary transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Change Slot
                            </button>
                            <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {longDate} @{" "}
                                {selectedHour !== null &&
                                    formatStudioHour(selectedHour)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Your Name *"
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                placeholder="Your Email *"
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <input
                            type="text"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                            placeholder="Website / Brand name or what to discuss (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        {status === "fallback" && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {status === "sending" ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Reserving Slot…
                                </>
                            ) : (
                                <>
                                    Confirm Free Zoom Call
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
