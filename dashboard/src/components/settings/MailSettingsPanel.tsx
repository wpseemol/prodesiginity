import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  BanIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  Loader2Icon,
  SaveIcon,
  SendIcon,
  ServerIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

type MailProvider = "none" | "resend" | "smtp";

type MailSettings = {
  provider: MailProvider;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  notifyEmail: string;
  resendApiKeySet: boolean;
  resendApiKeyMasked: string | null;
  smtpPreset: string;
  smtpHost: string;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassSet: boolean;
  careersAutoReply: boolean;
  notifyOnApplication: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
  ready: boolean;
  problem: string | null;
  encryptionKeyConfigured: boolean;
  updatedAt: string;
};

type SmtpPreset = {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  hint: string;
};

const SMTP_PRESETS: SmtpPreset[] = [
  {
    id: "gmail",
    label: "Gmail / Google Workspace",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    hint: "Use your full Gmail address and a 16-character App Password (Google Account → Security → App passwords).",
  },
  {
    id: "outlook",
    label: "Outlook / Microsoft 365",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    hint: "Sign in with your mailbox address. SMTP AUTH must be enabled for the mailbox in Microsoft 365 admin.",
  },
  {
    id: "zoho",
    label: "Zoho Mail",
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    hint: "Use smtp.zoho.eu or smtp.zoho.in if your account is hosted in those regions.",
  },
  {
    id: "brevo",
    label: "Brevo (Sendinblue)",
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    hint: "Username is your Brevo SMTP login; the password is an SMTP key from Brevo → SMTP & API.",
  },
  {
    id: "mailgun",
    label: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    hint: "Use the SMTP credentials of your verified sending domain. EU accounts use smtp.eu.mailgun.org.",
  },
  {
    id: "sendgrid",
    label: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    hint: 'Username is literally "apikey"; the password is your SendGrid API key.',
  },
  {
    id: "ses",
    label: "Amazon SES",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    secure: false,
    hint: "Replace the region in the host with your SES region and use SES SMTP credentials (not IAM keys).",
  },
  {
    id: "hostinger",
    label: "Hostinger",
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    hint: "Use the email account and password you created in hPanel → Emails.",
  },
  {
    id: "cpanel",
    label: "cPanel / hosting mailbox",
    host: "mail.yourdomain.com",
    port: 465,
    secure: true,
    hint: "Replace the host with your domain's mail server from cPanel → Email Accounts → Connect Devices.",
  },
  {
    id: "custom",
    label: "Custom SMTP server",
    host: "",
    port: 587,
    secure: false,
    hint: "Port 465 uses SSL/TLS from the start; port 587 upgrades with STARTTLS.",
  },
];

const PROVIDERS: {
  id: MailProvider;
  label: string;
  description: string;
  icon: typeof ZapIcon;
}[] = [
  {
    id: "resend",
    label: "Resend",
    description: "API-based sending. Fast setup with a verified domain.",
    icon: ZapIcon,
  },
  {
    id: "smtp",
    label: "SMTP",
    description: "Gmail, Outlook, Zoho, Brevo, your host's mailbox or any server.",
    icon: ServerIcon,
  },
  {
    id: "none",
    label: "Off",
    description: "No emails are sent. Notifications stay in the dashboard.",
    icon: BanIcon,
  },
];

type FormState = {
  provider: MailProvider;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  notifyEmail: string;
  resendApiKey: string;
  clearResendApiKey: boolean;
  smtpPreset: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  clearSmtpPass: boolean;
  careersAutoReply: boolean;
  notifyOnApplication: boolean;
};

function toForm(s: MailSettings): FormState {
  return {
    provider: s.provider,
    fromName: s.fromName,
    fromEmail: s.fromEmail,
    replyTo: s.replyTo,
    notifyEmail: s.notifyEmail,
    resendApiKey: "",
    clearResendApiKey: false,
    smtpPreset: s.smtpPreset || "custom",
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort ? String(s.smtpPort) : "",
    smtpSecure: s.smtpSecure,
    smtpUser: s.smtpUser,
    smtpPass: "",
    clearSmtpPass: false,
    careersAutoReply: s.careersAutoReply,
    notifyOnApplication: s.notifyOnApplication,
  };
}

function Field({
  id,
  label,
  hint,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function MailSettingsPanel({ adminEmail }: { adminEmail?: string }) {
  const [settings, setSettings] = useState<MailSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState(adminEmail ?? "");
  const [testing, setTesting] = useState(false);

  const apply = (next: MailSettings) => {
    setSettings(next);
    setForm(toForm(next));
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/settings/mail");
      const data = (await res.json().catch(() => ({}))) as { settings?: MailSettings; message?: string };
      if (!res.ok || !data.settings) throw new Error(data.message || "Could not load mail settings");
      apply(data.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load mail settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!testTo && adminEmail) setTestTo(adminEmail);
  }, [adminEmail, testTo]);

  if (loading && !form) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !form || !settings) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load mail settings</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const providerName = settings.provider === "resend" ? "Resend" : "SMTP";
  const healthy = settings.ready && settings.lastTestOk !== false;
  const statusTitle = !settings.ready
    ? "Email sending is not active"
    : settings.lastTestOk === false
      ? `${providerName} is configured, but the last test failed`
      : `Sending with ${providerName}`;

  const patch = (partial: Partial<FormState>) => setForm((prev) => (prev ? { ...prev, ...partial } : prev));
  const preset = SMTP_PRESETS.find((p) => p.id === form.smtpPreset) ?? SMTP_PRESETS[SMTP_PRESETS.length - 1];

  const choosePreset = (id: string) => {
    const next = SMTP_PRESETS.find((p) => p.id === id);
    if (!next) return;
    patch({
      smtpPreset: next.id,
      smtpHost: next.host,
      smtpPort: String(next.port),
      smtpSecure: next.secure,
    });
  };

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    const port = form.smtpPort.trim() ? Number(form.smtpPort) : null;
    if (port !== null && (!Number.isInteger(port) || port < 1 || port > 65535)) {
      toast.error("SMTP port must be a number between 1 and 65535");
      return false;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/admin/settings/mail", {
        method: "PUT",
        body: JSON.stringify({
          provider: form.provider,
          fromName: form.fromName,
          fromEmail: form.fromEmail,
          replyTo: form.replyTo,
          notifyEmail: form.notifyEmail,
          ...(form.resendApiKey.trim() ? { resendApiKey: form.resendApiKey.trim() } : {}),
          ...(form.clearResendApiKey ? { clearResendApiKey: true } : {}),
          smtpPreset: form.smtpPreset,
          smtpHost: form.smtpHost,
          smtpPort: port,
          smtpSecure: form.smtpSecure,
          smtpUser: form.smtpUser,
          ...(form.smtpPass ? { smtpPass: form.smtpPass } : {}),
          ...(form.clearSmtpPass ? { clearSmtpPass: true } : {}),
          careersAutoReply: form.careersAutoReply,
          notifyOnApplication: form.notifyOnApplication,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { settings?: MailSettings; message?: string };
      if (!res.ok || !data.settings) {
        toast.error(data.message || "Could not save mail settings");
        return false;
      }
      apply(data.settings);
      toast.success("Mail settings saved");
      return true;
    } catch {
      toast.error("Network error, settings were not saved");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim())) {
      toast.error("Enter a valid email address for the test");
      return;
    }
    const dirty = JSON.stringify(form) !== JSON.stringify(toForm(settings));
    if (dirty && !(await save())) return;

    setTesting(true);
    try {
      const res = await apiFetch("/admin/settings/mail/test", {
        method: "POST",
        body: JSON.stringify({ to: testTo.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { settings?: MailSettings; message?: string };
      if (data.settings) setSettings(data.settings);
      if (!res.ok) {
        toast.error(data.message || "The test email failed");
        return;
      }
      toast.success(data.message || "Test email sent");
    } catch {
      toast.error("Network error, the test email was not sent");
    } finally {
      setTesting(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={save}>
      <div
        className={cn(
          "flex flex-wrap items-start gap-3 rounded-xl border p-4",
          healthy ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5",
        )}
      >
        {healthy ? (
          <CheckCircle2Icon className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <TriangleAlertIcon className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{statusTitle}</p>
          <p className="text-xs text-muted-foreground">
            {settings.ready
              ? `From ${settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail}`
              : settings.problem}
          </p>
          {settings.lastTestAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Last test {new Date(settings.lastTestAt).toLocaleString()}:{" "}
              <span className={settings.lastTestOk ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                {settings.lastTestOk ? "delivered" : settings.lastError || "failed"}
              </span>
            </p>
          ) : null}
        </div>
        <Badge variant="secondary" className="font-normal">
          {settings.provider === "none" ? "Off" : settings.provider.toUpperCase()}
        </Badge>
      </div>

      {!settings.encryptionKeyConfigured ? (
        <Alert>
          <ShieldAlertIcon />
          <AlertTitle>Set a dedicated encryption key</AlertTitle>
          <AlertDescription>
            API keys and passwords are encrypted with the JWT secret. Add <code>SETTINGS_ENCRYPTION_KEY</code> to the
            backend environment so rotating the JWT secret never locks you out of saved credentials.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Provider</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROVIDERS.map((p) => {
            const active = form.provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => patch({ provider: p.id })}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <p.icon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="grid gap-4">
        <h3 className="text-sm font-semibold">Sender</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mailFromName" label="From name" hint="Shown in the recipient's inbox, e.g. ProDesignity Careers.">
            <Input
              id="mailFromName"
              value={form.fromName}
              maxLength={120}
              onChange={(e) => patch({ fromName: e.target.value })}
            />
          </Field>
          <Field
            id="mailFromEmail"
            label="From email"
            hint={
              form.provider === "resend"
                ? "Must be on a domain verified in Resend."
                : "Most SMTP servers require this to match the login mailbox."
            }
          >
            <Input
              id="mailFromEmail"
              type="email"
              value={form.fromEmail}
              placeholder="careers@yourdomain.com"
              onChange={(e) => patch({ fromEmail: e.target.value })}
            />
          </Field>
          <Field id="mailReplyTo" label="Reply-to" hint="Optional. Candidate replies go here instead.">
            <Input
              id="mailReplyTo"
              type="email"
              value={form.replyTo}
              placeholder="hr@yourdomain.com"
              onChange={(e) => patch({ replyTo: e.target.value })}
            />
          </Field>
          <Field id="mailNotify" label="Admin alert email" hint="Where new-application alerts are sent.">
            <Input
              id="mailNotify"
              type="email"
              value={form.notifyEmail}
              placeholder="you@yourdomain.com"
              onChange={(e) => patch({ notifyEmail: e.target.value })}
            />
          </Field>
        </div>
      </section>

      {form.provider === "resend" ? (
        <>
          <Separator />
          <section className="grid gap-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ZapIcon className="size-4" />
              Resend
            </h3>
            <Field
              id="resendKey"
              label="API key"
              hint={
                <>
                  Create a key with “Sending access” at{" "}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    resend.com/api-keys
                  </a>
                  . Saved keys are encrypted and never shown again.
                </>
              }
            >
              <div className="relative">
                <KeyRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="resendKey"
                  type="password"
                  className="pl-9 font-mono"
                  value={form.resendApiKey}
                  autoComplete="new-password"
                  placeholder={
                    settings.resendApiKeySet ? `Saved ${settings.resendApiKeyMasked ?? "••••"}` : "re_xxxxxxxxxxxx"
                  }
                  onChange={(e) => patch({ resendApiKey: e.target.value, clearResendApiKey: false })}
                />
              </div>
            </Field>
            {settings.resendApiKeySet ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.clearResendApiKey}
                  onChange={(e) => patch({ clearResendApiKey: e.target.checked, resendApiKey: "" })}
                />
                Remove the saved API key
              </label>
            ) : null}
          </section>
        </>
      ) : null}

      {form.provider === "smtp" ? (
        <>
          <Separator />
          <section className="grid gap-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ServerIcon className="size-4" />
              SMTP server
            </h3>
            <div className="flex flex-wrap gap-2">
              {SMTP_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => choosePreset(p.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    form.smtpPreset === p.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{preset.hint}</p>

            <div className="grid gap-4 sm:grid-cols-6">
              <Field id="smtpHost" label="Host" className="sm:col-span-4">
                <Input
                  id="smtpHost"
                  value={form.smtpHost}
                  placeholder="smtp.example.com"
                  onChange={(e) => patch({ smtpHost: e.target.value.trim() })}
                />
              </Field>
              <Field id="smtpPort" label="Port" className="sm:col-span-2">
                <Input
                  id="smtpPort"
                  inputMode="numeric"
                  value={form.smtpPort}
                  placeholder="587"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    patch({
                      smtpPort: value,
                      ...(value === "465" ? { smtpSecure: true } : value === "587" ? { smtpSecure: false } : {}),
                    });
                  }}
                />
              </Field>
              <Field id="smtpUser" label="Username" className="sm:col-span-3">
                <Input
                  id="smtpUser"
                  value={form.smtpUser}
                  autoComplete="off"
                  placeholder="you@yourdomain.com"
                  onChange={(e) => patch({ smtpUser: e.target.value })}
                />
              </Field>
              <Field id="smtpPass" label="Password / app password" className="sm:col-span-3">
                <Input
                  id="smtpPass"
                  type="password"
                  value={form.smtpPass}
                  autoComplete="new-password"
                  placeholder={settings.smtpPassSet ? "Saved •••••••• (leave blank to keep)" : "Password"}
                  onChange={(e) => patch({ smtpPass: e.target.value, clearSmtpPass: false })}
                />
              </Field>
            </div>
            {settings.smtpPassSet ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.clearSmtpPass}
                  onChange={(e) => patch({ clearSmtpPass: e.target.checked, smtpPass: "" })}
                />
                Remove the saved password
              </label>
            ) : null}
            <ToggleRow
              id="smtpSecure"
              title="Use SSL/TLS (port 465)"
              description="Turn off for port 587 or 25; the connection is upgraded with STARTTLS instead."
              checked={form.smtpSecure}
              onChange={(smtpSecure) => patch({ smtpSecure })}
            />
          </section>
        </>
      ) : null}

      <Separator />

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Careers emails</h3>
        <ToggleRow
          id="careersAutoReply"
          title="Confirm applications to candidates"
          description="Sends the applicant an automatic “we received your application” email with their reference number."
          checked={form.careersAutoReply}
          onChange={(careersAutoReply) => patch({ careersAutoReply })}
        />
        <ToggleRow
          id="notifyOnApplication"
          title="Email me about new applications"
          description="Sends an alert to the admin alert email. Dashboard notifications are always on."
          checked={form.notifyOnApplication}
          onChange={(notifyOnApplication) => patch({ notifyOnApplication })}
        />
      </section>

      <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 lg:flex-row lg:items-end lg:justify-between">
        <Field id="mailTestTo" label="Send a test email to" className="flex-1 lg:max-w-sm">
          <Input id="mailTestTo" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void sendTest()}
            disabled={testing || saving || form.provider === "none"}
          >
            {testing ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            Save &amp; send test
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Save mail settings
          </Button>
        </div>
      </div>
    </form>
  );
}
