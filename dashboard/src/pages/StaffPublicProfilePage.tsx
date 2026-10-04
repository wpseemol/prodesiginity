import { useEffect, useState, type FormEvent } from "react";
import {
  ExternalLinkIcon,
  Loader2Icon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import { siteOrigin } from "@/config";
import { useImagePick } from "@/hooks/useImagePick";
import { apiFetch } from "@/lib/api";
import { updateDashboardUser, type DashboardUser } from "@/lib/session";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeamImageFields } from "@/components/team/TeamImageFields";
import {
  appendExtras,
  EMPTY_EXTRAS,
  extrasFromMember,
  invalidSocial,
  StaffProfileExtras,
  type ProfileExtras,
  type SocialKey,
} from "@/components/team/StaffProfileExtras";
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
import { Textarea } from "@/components/ui/textarea";

type MyTeamProfile = {
  id: number;
  slug: string;
  name: string;
  role: string;
  tagline: string | null;
  description: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
  photoTitle: string | null;
  avatarUrl: string | null;
  avatarShape: string;
  profileStyle: string;
  socials: Partial<Record<SocialKey, string>>;
  skills: string[];
  username: string | null;
};

type StaffPublicProfileManagerProps = {
  currentUser: DashboardUser;
  onUserUpdated: (user: DashboardUser) => void;
};

function StaffPublicProfileManager({
  currentUser,
  onUserUpdated,
}: StaffPublicProfileManagerProps) {
  const photo = useImagePick();
  const avatar = useImagePick();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MyTeamProfile | null>(null);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [extras, setExtras] = useState<ProfileExtras>(EMPTY_EXTRAS);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const applyMember = (row: MyTeamProfile) => {
    setMember(row);
    setName(row.name);
    setDesignation(row.role);
    setTagline(row.tagline ?? "");
    setDescription(row.description ?? "");
    setExtras(extrasFromMember(row));
    setRemovePhoto(false);
    setRemoveAvatar(false);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/team/me");
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Could not load your public profile.",
        );
        setMember(null);
        return;
      }
      applyMember(data.member as MyTeamProfile);
      photo.clear();
      avatar.clear();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const badSocial = invalidSocial(extras);
    if (badSocial) {
      toast.error(`${badSocial} link must be a full URL starting with https://`);
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", name);
      body.append("tagline", tagline.trim());
      body.append("description", description.trim());
      appendExtras(body, extras);
      if (photo.file) body.append("photo", photo.file);
      else if (removePhoto) body.append("removePhoto", "true");
      if (avatar.file) body.append("avatar", avatar.file);
      else if (removeAvatar) body.append("removeAvatar", "true");

      const res = await apiFetch("/team/me", {
        method: "PUT",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.message === "string"
            ? data.message
            : "Could not save your profile.",
        );
        return;
      }

      const saved = data.member as MyTeamProfile;
      applyMember(saved);
      photo.clear();
      avatar.clear();
      const nextUser: DashboardUser = {
        ...currentUser,
        fullName: saved.name,
        teamMember: { photoUrl: saved.photoUrl, avatarUrl: saved.avatarUrl },
      };
      await updateDashboardUser(nextUser);
      onUserUpdated(nextUser);
      toast.success("Your public team profile was updated.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Loading your profile…
      </div>
    );
  }

  if (error || !member) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No public profile</AlertTitle>
        <AlertDescription>
          {error ??
            "Ask an admin to add you on Team members so you get a staff login and public profile."}
        </AlertDescription>
      </Alert>
    );
  }

  const profileUrl = `${siteOrigin.replace(/\/$/, "")}/team/${member.slug.toLowerCase()}/`;

  return (
    <form className="mx-auto grid max-w-3xl gap-6" onSubmit={handleSubmit}>
      <Card className="overflow-hidden border-border/70 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
        <CardHeader className="border-b border-border/60 bg-primary/5 dark:bg-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRoundIcon className="size-4 text-primary" />
            Public team profile
          </CardTitle>
          <CardDescription>
            This is what visitors see on the marketing site. Update your photo,
            avatar, name, and description. Designation is set by an admin.
            {member.username ? (
              <span className="mt-1 block text-xs">Login: @{member.username}</span>
            ) : null}
          </CardDescription>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLinkIcon className="size-3.5" />
            View my profile page
          </a>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <TeamImageFields
            name={name}
            photo={photo}
            avatar={avatar}
            savedPhotoUrl={member.photoUrl}
            savedAvatarUrl={member.avatarUrl}
            removePhoto={removePhoto}
            onRemovePhotoChange={setRemovePhoto}
            removeAvatar={removeAvatar}
            onRemoveAvatarChange={setRemoveAvatar}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="staffName">Name</Label>
              <Input
                id="staffName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="staffDesignation">Designation</Label>
              <Input
                id="staffDesignation"
                value={designation}
                readOnly
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Only an admin can change your designation on Team members.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="staffTagline">Short tagline (optional)</Label>
            <Input
              id="staffTagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One-line highlight"
              maxLength={255}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="staffDescription">Description</Label>
            <Textarea
              id="staffDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors about your work, skills, and role on the team…"
              className="min-h-32"
              maxLength={4000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/4000 — leave a blank line between paragraphs.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-lg">Profile style, skills & socials</CardTitle>
          <CardDescription>
            Choose how your profile page looks and where visitors can find you.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <StaffProfileExtras value={extras} onChange={setExtras} idPrefix="staff" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2Icon className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <SaveIcon />
              Save public profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function StaffPublicProfilePage() {
  return (
    <DashboardLayout
      expectedRole="employer"
      title="My public profile"
      description="Edit how you appear on the ProDesignity website"
    >
      {({ user, setUser }) => (
        <StaffPublicProfileManager currentUser={user} onUserUpdated={setUser} />
      )}
    </DashboardLayout>
  );
}
