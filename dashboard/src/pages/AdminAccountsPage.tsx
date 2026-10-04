import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2Icon, SearchIcon, UserPlusIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ClientAccount, StaffAccount } from "@/components/accounts/accountTypes";
import {
  AccountActionsMenu,
  AccountStatusBadge,
} from "@/components/accounts/AccountActionsMenu";
import { EditAccountSheet } from "@/components/accounts/EditAccountSheet";
import { useAccountMutations } from "@/components/accounts/useAccountMutations";
import { timeAgo } from "@/components/overview/analytics";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function loadList<T>(path: string, fallback: string): Promise<{ users: T[] } | { error: string }> {
  try {
    const res = await apiFetch(path);
    const data = await res.json();
    if (!res.ok) {
      return { error: typeof data.message === "string" ? data.message : fallback };
    }
    return { users: (data.users ?? []) as T[] };
  } catch {
    return { error: "Could not reach the server." };
  }
}

function ListState({ loading, error, children }: { loading: boolean; error: string | null; children: ReactNode }) {
  return (
    <>
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading accounts…
        </div>
      ) : (
        children
      )}
    </>
  );
}

function StaffManager({ currentUserId }: { currentUserId: number }) {
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaffAccount | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadList<StaffAccount>("/admin/users", "Could not load staff accounts.").then((result) => {
      if (cancelled) return;
      if ("error" in result) setError(result.error);
      else setStaff(result.users);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutations = useAccountMutations({
    onDisabledChange: (id, disabledAt) =>
      setStaff((rows) => rows.map((row) => (row.id === id ? { ...row, disabledAt } : row))),
    onDeleted: (id) => setStaff((rows) => rows.filter((row) => row.id !== id)),
  });
  const pending = mutations.pending;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>Staff accounts</CardTitle>
          <CardDescription>
            Dashboard logins. Adding someone on{" "}
            <Link to="/admin/team" className="font-medium text-primary underline-offset-4 hover:underline">
              Team members
            </Link>{" "}
            creates their account. Edit, disable or delete it here.
          </CardDescription>
        </div>
        <Button render={<Link to="/admin/team" />} size="sm">
          <UserPlusIcon />
          Add on Team
        </Button>
      </CardHeader>
      <CardContent>
        <ListState loading={loading} error={error}>
          {staff.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No staff accounts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => {
                  const isSelf = member.id === currentUserId;
                  return (
                    <TableRow key={member.id} className={member.disabledAt ? "opacity-60" : undefined}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar account={member} />
                          <span className="font-medium">{member.fullName}</span>
                          {isSelf ? <Badge variant="secondary">You</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        @{member.username}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                          {member.role === "admin" ? "Admin" : "Employee"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AccountStatusBadge disabledAt={member.disabledAt} disabledLabel="Disabled" />
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <Button render={<Link to="/admin/profile" />} variant="ghost" size="sm">
                            Profile
                          </Button>
                        ) : (
                          <AccountActionsMenu
                            account={member}
                            working={mutations.workingId === member.id}
                            disableLabel="Disable"
                            enableLabel="Enable"
                            onEdit={() => setEditing(member)}
                            onDisable={() => mutations.setPending({ kind: "disable", account: member })}
                            onEnable={() => void mutations.enable(member)}
                            onDelete={() => mutations.setPending({ kind: "delete", account: member })}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ListState>
      </CardContent>

      <EditAccountSheet
        account={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={(saved) => {
          setStaff((rows) => rows.map((row) => (row.id === saved.id ? saved : row)));
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) mutations.setPending(null);
        }}
        title={
          pending?.kind === "delete"
            ? `Delete @${pending.account.username}?`
            : `Disable @${pending?.account.username ?? ""}?`
        }
        description={
          pending?.kind === "delete"
            ? "Their login is removed permanently. A linked Team profile stays on the website, and their articles are kept without an author account."
            : "They are signed out within 15 minutes and can't sign in until you enable the account again."
        }
        confirmLabel={pending?.kind === "delete" ? "Delete account" : "Disable account"}
        loading={pending !== null && mutations.workingId === pending.account.id}
        onConfirm={mutations.confirmPending}
      />
    </Card>
  );
}

function ClientManager() {
  const [users, setUsers] = useState<ClientAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const q = search.trim();
    const timer = window.setTimeout(() => {
      void loadList<ClientAccount>(
        `/admin/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        "Could not load user accounts.",
      ).then((result) => {
        if (cancelled) return;
        if ("error" in result) setError(result.error);
        else {
          setError(null);
          setUsers(result.users);
        }
        setLoading(false);
      });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  const mutations = useAccountMutations({
    onDisabledChange: (id, disabledAt) =>
      setUsers((rows) => rows.map((row) => (row.id === id ? { ...row, disabledAt } : row))),
    onDeleted: (id) => setUsers((rows) => rows.filter((row) => row.id !== id)),
  });
  const pending = mutations.pending;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Website users</CardTitle>
        <CardDescription>
          Client accounts created by signing in on the website. Block someone to stop them signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or username…"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <ListState loading={loading} error={error}>
          {users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search.trim() ? "No users match your search." : "No website users yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Sign-in</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="hidden lg:table-cell">Last active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className={user.disabledAt ? "opacity-60" : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar account={user} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">
                        {user.signInMethod === "google" ? "Google" : "Password"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className="hidden text-muted-foreground lg:table-cell"
                      title={user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : undefined}
                    >
                      {user.lastActiveAt ? timeAgo(user.lastActiveAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <AccountStatusBadge disabledAt={user.disabledAt} disabledLabel="Blocked" />
                    </TableCell>
                    <TableCell className="text-right">
                      <AccountActionsMenu
                        account={user}
                        working={mutations.workingId === user.id}
                        disableLabel="Block"
                        enableLabel="Unblock"
                        onDisable={() => mutations.setPending({ kind: "disable", account: user })}
                        onEnable={() => void mutations.enable(user)}
                        onDelete={() => mutations.setPending({ kind: "delete", account: user })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ListState>
      </CardContent>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) mutations.setPending(null);
        }}
        title={
          pending?.kind === "delete"
            ? `Delete ${pending.account.fullName}?`
            : `Block ${pending?.account.fullName ?? ""}?`
        }
        description={
          pending?.kind === "delete"
            ? "Their account is removed permanently. If they sign in with Google again, a new empty account is created. Block them instead to keep them out."
            : "They are signed out within 15 minutes and can't sign in on the website until you unblock them."
        }
        confirmLabel={pending?.kind === "delete" ? "Delete account" : "Block user"}
        loading={pending !== null && mutations.workingId === pending.account.id}
        onConfirm={mutations.confirmPending}
      />
    </Card>
  );
}

export function AdminStaffPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Staff"
      description="Dashboard logins for admins and employees"
    >
      {({ user }) => <StaffManager currentUserId={user.id} />}
    </DashboardLayout>
  );
}

export function AdminUsersPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Users"
      description="Client accounts from the website"
    >
      {() => <ClientManager />}
    </DashboardLayout>
  );
}
