import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { StaffRole } from "@/config";
import { apiFetch, logoutRequest } from "@/lib/api";
import {
  updateDashboardUser,
  type DashboardUser,
} from "@/lib/session";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfilePhotoManager } from "@/components/ProfilePhotoManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";

type ProfilePageProps = {
  expectedRole: StaffRole;
};

function ProfileManager({
  user,
  onUserUpdated,
}: {
  user: DashboardUser;
  onUserUpdated: (user: DashboardUser) => void;
}) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body: Record<string, string> = {};
    if (fullName !== user.fullName) body.fullName = fullName;
    if (username !== user.username) body.username = username;
    if (email !== user.email) body.email = email;
    if (password) {
      body.password = password;
      body.currentPassword = currentPassword;
    }

    if (Object.keys(body).length === 0) {
      toast.message("No changes to save.");
      setSaving(false);
      return;
    }

    try {
      const res = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not update profile.",
        );
        return;
      }

      const nextUser = data.user as DashboardUser;
      await updateDashboardUser(nextUser);
      onUserUpdated(nextUser);
      setCurrentPassword("");
      setPassword("");
      toast.success("Profile updated.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch("/auth/me", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not delete account.",
        );
        return;
      }

      setConfirmDeleteOpen(false);
      await logoutRequest();
      toast.success("Account deleted.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  const requestDelete = (e: FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast.message("Enter your password to delete the account.");
      return;
    }
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="grid gap-6">
      <ProfilePhotoManager user={user} onUserUpdated={onUserUpdated} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your name, username, email, or password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleUpdate}>
            <div className="grid gap-2">
              <Label htmlFor="profileFullName">Full name</Label>
              <Input
                id="profileFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileUsername">Username</Label>
              <Input
                id="profileUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileEmail">Email</Label>
              <Input
                id="profileEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only when changing password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
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
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently remove your login and profile from the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="destructive">
            <AlertTitle>Irreversible</AlertTitle>
            <AlertDescription>
              Enter your password to confirm deletion of @{user.username}.
            </AlertDescription>
          </Alert>
          <form className="grid gap-4" onSubmit={requestDelete}>
            <div className="grid gap-2">
              <Label htmlFor="deletePassword">Password</Label>
              <Input
                id="deletePassword"
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2Icon />
                  Delete my account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => {
          if (!deleting) setConfirmDeleteOpen(open);
        }}
        title="Delete your account permanently?"
        description={`This removes @${user.username} and cannot be undone.`}
        confirmLabel="Delete account"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

export default function ProfilePage({ expectedRole }: ProfilePageProps) {
  return (
    <DashboardLayout
      expectedRole={expectedRole}
      title="Profile"
      description="Manage your account"
    >
      {({ user, setUser }) => (
        <ProfileManager
          key={`${user.id}-${user.username}-${user.email}-${user.photo?.id ?? "n"}`}
          user={user}
          onUserUpdated={setUser}
        />
      )}
    </DashboardLayout>
  );
}
