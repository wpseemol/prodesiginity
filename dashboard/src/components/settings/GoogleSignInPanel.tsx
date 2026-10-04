import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  Loader2Icon,
  SaveIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { siteOrigin } from "@/config";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

type GoogleSettings = {
  clientId: string | null;
  clientSecretSet: boolean;
  clientSecretMasked: string | null;
  usingEnvClientId: boolean;
  enabled: boolean;
  updatedAt: string;
};

const CREDENTIALS_URL = "https://console.cloud.google.com/apis/credentials";

export function GoogleSignInPanel() {
  const [settings, setSettings] = useState<GoogleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [clearSecret, setClearSecret] = useState(false);

  const apply = (next: GoogleSettings) => {
    setSettings(next);
    setClientId(next.clientId ?? "");
    setClientSecret("");
    setClearSecret(false);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/settings/google");
      const data = (await res.json().catch(() => ({}))) as {
        settings?: GoogleSettings;
        message?: string;
      };
      if (!res.ok || !data.settings) {
        throw new Error(data.message || "Could not load Google sign-in settings");
      }
      apply(data.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Google sign-in settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && !settings) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load Google sign-in settings</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/admin/settings/google", {
        method: "PUT",
        body: JSON.stringify({
          clientId: clientId.trim(),
          ...(clientSecret.trim() ? { clientSecret: clientSecret.trim() } : {}),
          ...(clearSecret ? { clearClientSecret: true } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        settings?: GoogleSettings;
        message?: string;
      };
      if (!res.ok || !data.settings) {
        toast.error(data.message || "Could not save Google sign-in settings");
        return;
      }
      apply(data.settings);
      toast.success("Google sign-in settings saved");
    } catch {
      toast.error("Network error, settings were not saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={save}>
      <div
        className={cn(
          "flex flex-wrap items-start gap-3 rounded-xl border p-4",
          settings.enabled
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-amber-500/30 bg-amber-500/5",
        )}
      >
        {settings.enabled ? (
          <CheckCircle2Icon className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <TriangleAlertIcon className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {settings.enabled
              ? "Clients can sign in with Google"
              : "Google sign-in is not set up"}
          </p>
          <p className="text-xs text-muted-foreground">
            {settings.usingEnvClientId
              ? "Using GOOGLE_CLIENT_ID from the server environment. Save a client ID here to override it."
              : settings.enabled
                ? `The "Sign in with Google" button on ${siteOrigin}/login uses this client.`
                : "Add your OAuth client ID below to turn on the Google button on the website login page."}
          </p>
        </div>
        <Badge variant="secondary" className="font-normal">
          {settings.enabled ? "On" : "Off"}
        </Badge>
      </div>

      <section className="grid gap-2 rounded-xl border bg-muted/20 p-4 text-sm">
        <p className="font-semibold">Where to get these</p>
        <ol className="grid list-decimal gap-1 pl-5 text-muted-foreground">
          <li>
            Open{" "}
            <a
              href={CREDENTIALS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Google Cloud Console → Credentials
              <ExternalLinkIcon className="size-3" />
            </a>
            .
          </li>
          <li>Create credentials → OAuth client ID → Application type “Web application”.</li>
          <li>
            Under “Authorized JavaScript origins” add your website address, for example{" "}
            <code className="rounded bg-muted px-1">{siteOrigin}</code>.
          </li>
          <li>Copy the Client ID and Client secret into the fields below and save.</li>
        </ol>
      </section>

      <div className="grid gap-1.5">
        <Label htmlFor="google-client-id" className="text-sm font-medium">
          Client ID
        </Label>
        <Input
          id="google-client-id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="1234567890-abc123.apps.googleusercontent.com"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          Public value used by the sign-in button. Leave empty to turn Google sign-in off.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="google-client-secret" className="text-sm font-medium">
          Client secret
        </Label>
        <Input
          id="google-client-secret"
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          placeholder={
            settings.clientSecretSet
              ? `Saved (${settings.clientSecretMasked}) — type to replace`
              : "GOCSPX-…"
          }
          autoComplete="new-password"
          disabled={clearSecret}
        />
        <p className="text-xs text-muted-foreground">
          Stored encrypted and never shown again. The website button only needs the client ID; the secret is kept for
          server-side Google features.
        </p>
        {settings.clientSecretSet ? (
          <label
            htmlFor="google-clear-secret"
            className="mt-1 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground"
          >
            <Switch id="google-clear-secret" checked={clearSecret} onCheckedChange={setClearSecret} />
            Remove the saved secret
          </label>
        ) : null}
      </div>

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
        Save Google sign-in
      </Button>
    </form>
  );
}
