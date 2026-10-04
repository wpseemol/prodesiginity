import { useState, type FormEvent } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { StaffAccount } from "@/components/accounts/accountTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ROLE_LABELS = { admin: "Admin", employer: "Employee" } as const;

type EditAccountSheetProps = {
  account: StaffAccount | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (account: StaffAccount) => void;
};

export function EditAccountSheet({ account, onOpenChange, onSaved }: EditAccountSheetProps) {
  return (
    <Sheet open={account !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {account ? (
          <EditAccountForm key={account.id} account={account} onSaved={onSaved} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditAccountForm({
  account,
  onSaved,
}: {
  account: StaffAccount;
  onSaved: (account: StaffAccount) => void;
}) {
  const [fullName, setFullName] = useState(account.fullName);
  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email);
  const [role, setRole] = useState(account.role);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const body: Record<string, string> = {};
    if (fullName.trim() !== account.fullName) body.fullName = fullName.trim();
    if (username.trim() !== account.username) body.username = username.trim();
    if (email.trim() !== account.email) body.email = email.trim();
    if (role !== account.role) body.role = role;
    if (password) {
      body.password = password;
      body.currentPassword = currentPassword;
    }
    if (Object.keys(body).length === 0) {
      toast.message("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/admin/users/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.message === "string" ? data.message : "Could not update account.");
        return;
      }
      toast.success("Account updated.");
      onSaved(data.user as StaffAccount);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="flex min-h-full flex-col" onSubmit={handleSubmit}>
      <SheetHeader>
        <SheetTitle>Edit account</SheetTitle>
        <SheetDescription>
          Changes apply to @{account.username}&apos;s dashboard login.
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-4 px-4">
        <div className="grid gap-2">
          <Label htmlFor="accountFullName">Full name</Label>
          <Input
            id="accountFullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="accountUsername">Username</Label>
          <Input
            id="accountUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="accountEmail">Email</Label>
          <Input
            id="accountEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value === "admin" ? "admin" : "employer")}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{ROLE_LABELS[role]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin: full dashboard access</SelectItem>
              <SelectItem value="employer">Employee: articles and own profile</SelectItem>
            </SelectContent>
          </Select>
          {account.role === "admin" && role === "employer" ? (
            <p className="text-xs text-muted-foreground">
              If this person is the team lead, the lead badge is removed too.
            </p>
          ) : null}
        </div>

        <Separator />

        <div className="grid gap-2">
          <Label htmlFor="accountNewPassword">New password (optional)</Label>
          <Input
            id="accountNewPassword"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </div>
        {password ? (
          <div className="grid gap-2">
            <Label htmlFor="accountAdminPassword">Your admin password</Label>
            <Input
              id="accountAdminPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Changing the password signs this person out everywhere.
            </p>
          </div>
        ) : null}
      </div>

      <SheetFooter>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2Icon className="animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}
