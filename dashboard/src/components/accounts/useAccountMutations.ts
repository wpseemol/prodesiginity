import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export type AccountRef = {
  id: number;
  fullName: string;
  username: string;
  disabledAt: string | null;
};

export type PendingAccountAction = { kind: "disable" | "delete"; account: AccountRef };

async function errorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return typeof data.message === "string" ? data.message : fallback;
}

/** Disable / enable / delete for any account, with a pending action to confirm. */
export function useAccountMutations({
  onDisabledChange,
  onDeleted,
}: {
  onDisabledChange: (id: number, disabledAt: string | null) => void;
  onDeleted: (id: number) => void;
}) {
  const [pending, setPending] = useState<PendingAccountAction | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const setDisabled = async (account: AccountRef, disabled: boolean) => {
    setWorkingId(account.id);
    try {
      const res = await apiFetch(`/admin/users/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({ disabled }),
      });
      if (!res.ok) {
        toast.error(await errorMessage(res, "Could not update account."));
        return false;
      }
      const data = await res.json();
      onDisabledChange(account.id, data.user?.disabledAt ?? null);
      toast.success(disabled ? `${account.fullName} can no longer sign in.` : `${account.fullName} can sign in again.`);
      return true;
    } catch {
      toast.error("Could not reach the server.");
      return false;
    } finally {
      setWorkingId(null);
    }
  };

  const remove = async (account: AccountRef) => {
    setWorkingId(account.id);
    try {
      const res = await apiFetch(`/admin/users/${account.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await errorMessage(res, "Could not delete account."));
        return false;
      }
      onDeleted(account.id);
      toast.success(`Deleted @${account.username}.`);
      return true;
    } catch {
      toast.error("Could not reach the server.");
      return false;
    } finally {
      setWorkingId(null);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    const done =
      pending.kind === "delete"
        ? await remove(pending.account)
        : await setDisabled(pending.account, true);
    if (done) setPending(null);
  };

  return {
    pending,
    setPending,
    workingId,
    enable: (account: AccountRef) => setDisabled(account, false),
    confirmPending,
  };
}
