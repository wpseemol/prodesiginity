import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BanIcon, Loader2Icon, PlusIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { readMessage } from "@/components/services/serviceTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type BlockedEmail = {
  id: number;
  email: string;
  reason: string | null;
  createdAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlockedEmailsManager() {
  const [rows, setRows] = useState<BlockedEmail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [unblock, setUnblock] = useState<BlockedEmail | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch("/careers/blocked");
      if (!res.ok) throw new Error(await readMessage(res, "Could not load blocked emails"));
      const data = (await res.json()) as { blocked: BlockedEmail[] };
      setRows(data.blocked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load blocked emails");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setFormError("Enter a valid email address");
      return;
    }
    if (rows?.some((r) => r.email === value)) {
      setFormError("This email is already blocked");
      return;
    }
    setFormError(null);
    setAdding(true);
    try {
      const res = await apiFetch("/careers/blocked", {
        method: "POST",
        body: JSON.stringify({ email: value, ...(reason.trim() ? { reason: reason.trim() } : {}) }),
      });
      if (!res.ok) {
        setFormError(await readMessage(res, "Could not block this email"));
        return;
      }
      const data = (await res.json()) as { blocked: BlockedEmail };
      setRows((prev) => [data.blocked, ...(prev ?? []).filter((r) => r.id !== data.blocked.id)]);
      setEmail("");
      setReason("");
      toast.success(`${data.blocked.email} can no longer apply`);
    } catch {
      setFormError("Could not reach the server.");
    } finally {
      setAdding(false);
    }
  };

  const remove = async () => {
    if (!unblock) return;
    setRemoving(true);
    try {
      const res = await apiFetch(`/careers/blocked?email=${encodeURIComponent(unblock.email)}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) {
        toast.error(await readMessage(res, "Unblock failed"));
        return;
      }
      setRows((prev) => (prev ?? []).filter((r) => r.id !== unblock.id));
      toast.success(`${unblock.email} can apply again`);
      setUnblock(null);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BanIcon className="size-4" />
            Block an email
          </CardTitle>
          <CardDescription>
            Applications from blocked emails are rejected on the careers page. You can also block an
            applicant from their application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="block-email">Email</Label>
              <Input
                id="block-email"
                type="email"
                value={email}
                maxLength={254}
                placeholder="name@example.com"
                aria-invalid={formError ? true : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Input
                id="block-reason"
                value={reason}
                maxLength={255}
                placeholder="e.g. Spam applications"
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
              Block
            </Button>
          </form>
          {formError ? <p className="mt-2 text-xs font-medium text-destructive">{formError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Blocked emails</CardTitle>
            <CardDescription>
              {rows === null ? "Loading…" : `${rows.length} blocked ${rows.length === 1 ? "email" : "emails"}`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCwIcon />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-3">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {rows === null ? (
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No blocked emails. Everyone can apply.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.reason ? `${row.reason} · ` : ""}Blocked {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setUnblock(row)}>
                    <ShieldCheckIcon />
                    Unblock
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={unblock !== null}
        onOpenChange={(open) => {
          if (!open) setUnblock(null);
        }}
        title="Unblock this email?"
        description={unblock ? `${unblock.email} will be able to apply for jobs again.` : ""}
        confirmLabel="Unblock"
        destructive={false}
        loading={removing}
        onConfirm={remove}
      />
    </div>
  );
}
