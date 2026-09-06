"use client";

/**
 * Free-discovery-call booker: pick a future date, pick a slot, confirm.
 *
 * Static-export notes
 * -------------------
 * The site builds to plain HTML, so there is no Next server to talk to. The
 * form posts to `/api/book-call.php`, a PHP endpoint that ships in /public and
 * therefore lands next to the HTML on Hostinger. That file creates the Zoom
 * meeting and sends the emails. If it is missing or errors, the widget falls
 * back to a prefilled WhatsApp message so an enquiry is never lost.
 *
 * Hydration note
 * --------------
 * "Today" is baked into the HTML at build time, which could be weeks before a
 * visitor loads the page. Every date calculation is therefore gated behind
 * `isClient`, so the prerendered markup never claims a stale month or disables
 * the wrong days. The clock is read exactly once per session and threaded
 * through as `nowMs`, which keeps the derived values pure and stable across
 * re-renders.
 */

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

/* ---------------------------------------------------------------------------
   Studio availability. Bangladesh does not observe DST, so a fixed +6 offset
   is safe and avoids shipping a timezone library.
   --------------------------------------------------------------------------- */

const STUDIO_UTC_OFFSET_HOURS = 6;
const STUDIO_TZ_LABEL = "Dhaka (GMT+6)";

/** Slot start times, in studio local hours (24h). */
const SLOT_HOURS = [10, 11, 12, 14, 15, 16, 17, 18, 20];

/** 0 = Sunday. Friday is the studio's day off — "Saturday to Thursday". */
const CLOSED_WEEKDAYS = [5];

const MEETING_MINUTES = 30;
/** How far ahead the calendar will let someone book. */
const BOOKING_WINDOW_DAYS = 60;
/** Same-day bookings need breathing room. */
const MIN_LEAD_HOURS = 4;

const API_ENDPOINT = "/api/book-call.php";

/** useSyncExternalStore needs a subscribe function; nothing ever changes. */
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

/* ---------------------------------------------------------------------------
   Date helpers. Everything works on "civil date" keys (YYYY-MM-DD) so the UI
   never has to reason about the visitor's offset.
   --------------------------------------------------------------------------- */

function dateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseKey(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    return { year, month: month - 1, day };
}

/** The exact instant a slot starts, converted from studio time to UTC. */
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

    /**
     * How many months forward the grid has been paged. Derived from the
     * current month rather than stored as an absolute year/month pair, so
     * there is no state to seed from a clock the server does not have.
     */
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

    /**
     * Client detection without a mount effect. The server snapshot is false,
     * the client snapshot is true, and React re-renders once after hydration —
     * which is exactly the signal needed, without setting state in an effect.
     */
    const isClient = useSyncExternalStore(
        SUBSCRIBE_NOOP,
        () => true,
        () => false,
    );

    /**
     * One reading of the clock for the whole widget.
     *
     * `Date.now()` is impure, so it is called once here and every derived
     * value below takes `nowMs` as an input instead of reading the clock
     * again. That makes the calendar deterministic for a given render pass —
     * two components can never disagree about which day "today" is.
     */
    // eslint-disable-next-line react-hooks/purity -- read once, then threaded through as data
    const nowMs = useMemo(() => (isClient ? Date.now() : 0), [isClient]);

    /** The visitor's own timezone label, for the "your time" line. */
    const visitorTz = useMemo(() => {
        if (!isClient) return "";
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return "";
        }
    }, [isClient]);

    /** The month the grid is currently showing. */
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

    /** First bookable day and last bookable day, as YYYY-MM-DD keys. */
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

    /**
     * The month grid: leading blanks so the 1st lands on the right weekday,
     * then every day with a flag saying whether it can be booked.
     */
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

    /** Slots for the chosen date, with anything already past filtered out. */
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

    // Paging back past the current month would only show unbookable days.
    const canGoBackAMonth = monthOffset > 0;

    const shiftMonth = (delta: number) =>
        setMonthOffset((value) => Math.max(0, value + delta));

    const chosenInstant =
        selectedDate && selectedHour !== null
            ? slotInstant(selectedDate, selectedHour)
            : null;

    const longDate = chosenInstant
        ? new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
          }).format(chosenInstant)
        : "";

    /* ---------------------------------------------------------------------
       Submission
       --------------------------------------------------------------------- */

    const whatsappFallbackUrl = () => {
        const lines = [
            "Hello ProDesignity, I would like to book a free strategy call.",
            `Name: ${form.name}`,
            `Email: ${form.email}`,
            form.company ? `Company: ${form.company}` : "",
            `Preferred slot: ${longDate}`,
            `Studio time: ${selectedHour !== null ? formatStudioHour(selectedHour) : ""} ${STUDIO_TZ_LABEL}`,
            form.notes ? `Notes: ${form.notes}` : "",
        ].filter(Boolean);
        return `${siteConfig.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    };

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
            // The endpoint is not reachable yet, or PHP errored. Rather than
            // showing a dead end, hand the visitor a working alternative.
            console.warn("Booking endpoint unavailable:", err);
            setError(
                "We could not confirm the slot automatically. Send it through WhatsApp and we will confirm within 1–2 hours.",
            );
            setStatus("fallback");
        }
    };

    /** Calendar file so the slot lands in the visitor's own calendar too. */
    const downloadIcs = () => {
        if (!chosenInstant) return;
        const end = new Date(
            chosenInstant.getTime() + MEETING_MINUTES * 60_000,
        );
        const description = result?.joinUrl
            ? `Zoom link: ${result.joinUrl}`
            : `We will email the Zoom link before the call. Contact: ${siteConfig.email}`;

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

        const blob = new Blob([ics], {
            type: "text/calendar;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "prodesignity-strategy-call.ics";
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

    /* ---------------------------------------------------------------------
       Render
       --------------------------------------------------------------------- */

    const shellClass =
        "w-full rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border border-border-color dark:border-dark-border-color shadow-xl overflow-hidden";

    // Skeleton until the client knows what day it is.
    if (!isClient) {
        return (
            <div className={cn(shellClass, "p-6 space-y-4")}>
                <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
        );
    }

    /* ---- Success ---- */
    if (status === "done") {
        return (
            <div className={cn(shellClass, "p-6 sm:p-7")}>
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Check className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                            Call booked
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            A confirmation is on its way to {form.email}.
                        </p>
                    </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border-color dark:border-dark-border-color space-y-1.5">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {longDate}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedHour !== null &&
                            formatStudioHour(selectedHour)}{" "}
                        {STUDIO_TZ_LABEL} · {MEETING_MINUTES} minutes
                    </p>
                    {result?.meetingId && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Meeting ID: {result.meetingId}
                            {result.passcode
                                ? ` · Passcode: ${result.passcode}`
                                : ""}
                        </p>
                    )}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                    {result?.joinUrl && (
                        <a
                            href={result.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/85 transition-colors"
                        >
                            <Video className="w-4 h-4" aria-hidden="true" />
                            Join on Zoom
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={downloadIcs}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-border-color dark:border-dark-border-color hover:border-primary/40 transition-colors"
                    >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Add to calendar
                    </button>
                </div>

                <button
                    type="button"
                    onClick={reset}
                    className="mt-3 w-full text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
                >
                    Book another slot
                </button>
            </div>
        );
    }

    return (
        <div className={shellClass}>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border-color dark:border-dark-border-color">
                <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary dark:text-dark-primary flex items-center justify-center">
                        <Video className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            Zoom strategy call
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {MEETING_MINUTES} minutes · free · no commitment
                        </p>
                    </div>
                </div>
                <ol className="hidden sm:flex items-center gap-1.5" aria-label="Progress">
                    {(["date", "time", "details"] as Step[]).map((id, i) => (
                        <li
                            key={id}
                            className={cn(
                                "w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-colors",
                                step === id
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                            )}
                            aria-current={step === id ? "step" : undefined}
                        >
                            {i + 1}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="p-5 sm:p-6">
                {/* ------------------------- Step 1: date ------------------------- */}
                {step === "date" && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                disabled={!canGoBackAMonth}
                                aria-label="Previous month"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                {MONTH_FORMAT.format(
                                    new Date(viewYear, viewMonth, 1),
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                aria-label="Next month"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div
                            className="grid grid-cols-7 gap-1 mb-1.5"
                            aria-hidden="true"
                        >
                            {WEEKDAY_LABELS.map((label, i) => (
                                <span
                                    key={`${label}-${i}`}
                                    className="text-center text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 py-1"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((cell, index) =>
                                cell === null ? (
                                    <span key={`blank-${index}`} />
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
                                        aria-label={cell.key}
                                        className={cn(
                                            "aspect-square rounded-lg text-xs font-semibold transition-all",
                                            cell.disabled
                                                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed line-through decoration-1"
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

                        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                            <CalendarDays
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                            />
                            Available Saturday to Thursday, up to{" "}
                            {BOOKING_WINDOW_DAYS} days ahead.
                        </p>
                    </div>
                )}

                {/* ------------------------- Step 2: time ------------------------- */}
                {step === "time" && selectedDate && (
                    <div>
                        <button
                            type="button"
                            onClick={() => setStep("date")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-4"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Change date
                        </button>

                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {new Intl.DateTimeFormat(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            }).format(slotInstant(selectedDate, 12))}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                            Times shown in {STUDIO_TZ_LABEL}
                            {visitorTz ? ` · yours in ${visitorTz}` : ""}
                        </p>

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
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
                                        "px-3 py-2.5 rounded-xl border text-left transition-all",
                                        slot.disabled
                                            ? "border-border-color dark:border-dark-border-color opacity-40 cursor-not-allowed"
                                            : "border-border-color dark:border-dark-border-color hover:border-primary hover:bg-primary/5",
                                        selectedHour === slot.hour &&
                                            "border-primary bg-primary/10",
                                    )}
                                >
                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                                        {slot.studioLabel}
                                    </span>
                                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                                        {slot.localLabel} your time
                                    </span>
                                </button>
                            ))}
                        </div>

                        {slots.every((slot) => slot.disabled) && (
                            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                                Every slot on this day has passed. Pick another
                                date.
                            </p>
                        )}
                    </div>
                )}

                {/* ----------------------- Step 3: details ------------------------ */}
                {step === "details" && chosenInstant && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setStep("time")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Change time
                        </button>

                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5">
                            <Clock
                                className="w-4 h-4 mt-0.5 text-primary shrink-0"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                    {longDate}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {selectedHour !== null &&
                                        formatStudioHour(selectedHour)}{" "}
                                    {STUDIO_TZ_LABEL} · {MEETING_MINUTES} min on
                                    Zoom
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Full name *
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Jane Doe"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Email *
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="jane@company.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                Company
                            </span>
                            <input
                                type="text"
                                value={form.company}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        company: e.target.value,
                                    })
                                }
                                placeholder="Optional"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                What would you like to cover?
                            </span>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                placeholder="A sentence is enough — it just helps us prepare."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-border-color dark:border-dark-border-color text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </label>

                        {status === "fallback" && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                    {error}
                                </p>
                                <a
                                    href={whatsappFallbackUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                >
                                    <MessageSquare
                                        className="w-3.5 h-3.5"
                                        aria-hidden="true"
                                    />
                                    Send on WhatsApp
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-brand-violet to-brand-blue dark:from-dark-brand-violet dark:to-dark-brand-blue shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-60 transition-all"
                        >
                            {status === "sending" ? (
                                <>
                                    <Loader2
                                        className="w-4 h-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                    Booking your slot…
                                </>
                            ) : (
                                <>
                                    Confirm Zoom booking
                                    <ArrowRight
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                    />
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                            We will email the Zoom link straight away. No card,
                            no obligation.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
