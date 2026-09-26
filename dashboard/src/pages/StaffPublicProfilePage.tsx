import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CameraIcon,
  Loader2Icon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { formatImageHint, IMAGE_SPECS } from "@/lib/imageSpecs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  name: string;
  role: string;
  tagline: string | null;
  description: string | null;
  photoUrl: string;
  photoAlt: string | null;
  photoTitle: string | null;
  username: string | null;
};

function StaffPublicProfileManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MyTeamProfile | null>(null);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const currentPhotoSrc =
    photoPreview ||
    (member?.photoUrl ? mediaUrl(member.photoUrl) : undefined);

  const clearPhotoSelection = () => {
    setPhotoFile(null);
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyMember = (row: MyTeamProfile) => {
    setMember(row);
    setName(row.name);
    setDesignation(row.role);
    setTagline(row.tagline ?? "");
    setDescription(row.description ?? "");
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
      clearPhotoSelection();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", name);
      body.append("tagline", tagline.trim());
      body.append("description", description.trim());
      if (photoFile) body.append("photo", photoFile);

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

      applyMember(data.member as MyTeamProfile);
      clearPhotoSelection();
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

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden border-border/70 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
      <CardHeader className="border-b border-border/60 bg-primary/5 dark:bg-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserRoundIcon className="size-4 text-primary" />
          Public team profile
        </CardTitle>
        <CardDescription>
          This is what visitors see on the marketing site. Update your photo,
          name, and description. Designation is set by an admin.
          {member.username ? (
            <span className="mt-1 block text-xs">Login: @{member.username}</span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative size-28 shrink-0 overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-primary/5 shadow-inner transition hover:border-primary/50"
            >
              {currentPhotoSrc ? (
                <img
                  src={currentPhotoSrc}
                  alt={name || "Profile"}
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <CameraIcon className="size-5 opacity-70" />
                  <span className="text-[10px] font-medium uppercase">
                    Photo
                  </span>
                </div>
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <p className="text-sm font-medium">Profile photo</p>
              <p className="text-xs text-muted-foreground">
                {photoFile
                  ? `New file: ${photoFile.name}`
                  : formatImageHint(IMAGE_SPECS.teamPhoto)}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <CameraIcon />
                  Change photo
                </Button>
                {photoFile ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearPhotoSelection}
                  >
                    Undo
                  </Button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
          </div>

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
              {description.length}/4000
            </p>
          </div>

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
        </form>
      </CardContent>
    </Card>
  );
}

export default function StaffPublicProfilePage() {
  return (
    <DashboardLayout
      expectedRole="employer"
      title="My public profile"
      description="Edit how you appear on the ProDesignity website"
    >
      {() => <StaffPublicProfileManager />}
    </DashboardLayout>
  );
}
