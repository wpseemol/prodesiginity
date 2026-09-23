import { useEffect, useState, type ComponentType, type FormEvent } from "react";
import {
  Loader2Icon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StaffPhoto = {
  id: number;
  url: string;
  altText: string | null;
};

type StaffUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: "admin" | "employer";
  created_at: string;
  photo?: StaffPhoto | null;
};

function staffInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function AdminOverview({ userName }: { userName: string }) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/admin/users");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setListError(
            typeof data.message === "string"
              ? data.message
              : "Could not load staff accounts.",
          );
          return;
        }
        setListError(null);
        setStaff(data.users ?? []);
      } catch {
        if (!cancelled) setListError("Could not reach the server.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const adminCount = staff.filter((member) => member.role === "admin").length;
  const employeeCount = staff.filter(
    (member) => member.role === "employer",
  ).length;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back, {userName.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage staff accounts and keep your team organized.
        </p>
      </div>

      {listError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load overview</AlertTitle>
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total staff"
          value={staff.length}
          hint="Admins and employees"
          icon={UsersIcon}
        />
        <StatCard
          title="Admins"
          value={adminCount}
          hint="Full console access"
          icon={ShieldCheckIcon}
        />
        <StatCard
          title="Employees"
          value={employeeCount}
          hint="Employer role accounts"
          icon={UserPlusIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent team</CardTitle>
          <CardDescription>
            Latest accounts currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable staff={staff.slice(0, 5)} emptyLabel="No staff yet." />
        </CardContent>
      </Card>
    </div>
  );
}

function StaffTable({
  staff,
  emptyLabel,
}: {
  staff: StaffUser[];
  emptyLabel: string;
}) {
  if (staff.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  {mediaUrl(member.photo?.url) ? (
                    <AvatarImage
                      src={mediaUrl(member.photo?.url)}
                      alt={member.fullName}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {staffInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.fullName}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              @{member.username}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {member.email}
            </TableCell>
            <TableCell>
              <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                {member.role === "admin" ? "Admin" : "Employee"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AdminStaffManager() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employer">("employer");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [listError, setListError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      const res = await apiFetch("/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setListError(
          typeof data.message === "string"
            ? data.message
            : "Could not load staff accounts.",
        );
        return;
      }
      setListError(null);
      setStaff(data.users ?? []);
    } catch {
      setListError("Could not reach the server.");
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ fullName, username, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Failed to create account.",
        );
        setStatus("idle");
        return;
      }

      toast.success(
        typeof data.message === "string"
          ? data.message
          : "Account created successfully.",
      );
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("employer");
      await loadStaff();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create staff account</CardTitle>
          <CardDescription>
            Add a new admin or employee (employer) account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jane.doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@prodesignity.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staffPassword">Password</Label>
              <Input
                id="staffPassword"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number, symbol"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "admin" || value === "employer") {
                    setRole(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employer">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Creating…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff accounts</CardTitle>
          <CardDescription>
            Admins and employees currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          ) : null}
          <StaffTable staff={staff} emptyLabel="No staff accounts yet." />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Overview"
      description="Admin dashboard home"
    >
      {({ user }) => <AdminOverview userName={user.fullName} />}
    </DashboardLayout>
  );
}

export function AdminStaffPage() {
  return (
    <DashboardLayout
      expectedRole="admin"
      title="Staff"
      description="Create and review team accounts"
    >
      {() => <AdminStaffManager />}
    </DashboardLayout>
  );
}
