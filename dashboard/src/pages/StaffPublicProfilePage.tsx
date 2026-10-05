import { useDeferredValue, useEffect, useState, type FormEvent } from "react";
import {
  ExternalLinkIcon,
  EyeIcon,
  Loader2Icon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl, siteOrigin } from "@/config";
import { useImagePick } from "@/hooks/useImagePick";
import { useAvatarPresets } from "@/hooks/useAvatarPresets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { apiFetch } from "@/lib/api";
import { jumpToEdit } from "@/lib/jumpToEdit";
import { updateDashboardUser, type DashboardUser } from "@/lib/session";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  clearDraft,
  loadDraft,
  resetPreviewWidth,
  setField,
  setPreviewOpen,
  setPreviewWidth,
  togglePreview,
  PUBLIC_PROFILE_PREVIEW_WIDTH,
  type PublicProfileDraft,
} from "@/lib/store/publicProfileSlice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CollapsedPreviewRail, ResizeHandle } from "@/components/preview/PreviewKit";
import { TeamImageFields } from "@/components/team/TeamImageFields";
import { PublicProfileLivePreview } from "@/components/team/PublicProfileLivePreview";
import { profileSpotTarget, type ProfileSpot } from "@/components/team/publicProfileDraft";
import { appendAvatarChoice, type AvatarChoice } from "@/lib/avatarChoice";
import {
  appendExtras,
  extrasFromMember,
  invalidSocial,
  StaffProfileExtras,
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  isLead?: boolean;
};

type StaffPublicProfileManagerProps = {
  currentUser: DashboardUser;
  onUserUpdated: (user: DashboardUser) => void;
};

const draftFromMember = (row: MyTeamProfile): PublicProfileDraft => ({
  name: row.name,
  tagline: row.tagline ?? "",
  description: row.description ?? "",
  extras: extrasFromMember(row),
});

function StaffPublicProfileManager({
  currentUser,
  onUserUpdated,
}: StaffPublicProfileManagerProps) {
  const dispatch = useAppDispatch();
  const photo = useImagePick();
  const presets = useAvatarPresets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MyTeamProfile | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice>("keep");

  const draft = useAppSelector((s) => s.publicProfile.draft);
  const ui = useAppSelector((s) => s.publicProfile.ui);
  const set = <K extends keyof PublicProfileDraft>(key: K, value: PublicProfileDraft[K]) =>
    dispatch(setField({ key, value } as Parameters<typeof setField>[0]));

  /* ---------------------------------------------------- Live preview UI */
  const wideScreen = useMediaQuery("(min-width: 1280px)");
  const [previewSheet, setPreviewSheet] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const previewDraft = useDeferredValue(draft);

  const applyMember = (row: MyTeamProfile) => {
    const next = draftFromMember(row);
    setMember(row);
    setSavedSnapshot(JSON.stringify(next));
    dispatch(loadDraft(next));
    setRemovePhoto(false);
    setAvatarChoice("keep");
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
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => {
      dispatch(clearDraft());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty =
    (draft !== null && JSON.stringify(draft) !== savedSnapshot) ||
    photo.file !== null ||
    removePhoto ||
    avatarChoice !== "keep";

  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  /** Scrolls to a field, focuses it and flashes it. */
  const jumpTo = (target: { target: string; focus?: string }) => {
    const delay = previewSheet ? 220 : 0;
    setPreviewSheet(false);
    if (delay) window.setTimeout(() => jumpToEdit(target), delay);
    else jumpToEdit(target);
  };
  const editSpot = (spot: ProfileSpot) => jumpTo(profileSpotTarget(spot));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member || !draft) return;

    const badSocial = invalidSocial(draft.extras);
    if (badSocial) {
      toast.error(`${badSocial} link must be a full URL starting with https://`);
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", draft.name);
      body.append("tagline", draft.tagline.trim());
      body.append("description", draft.description.trim());
      appendExtras(body, draft.extras);
      if (photo.file) body.append("photo", photo.file);
      else if (removePhoto) body.append("removePhoto", "true");
      appendAvatarChoice(body, avatarChoice);

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

  if (error || !member || !draft) {
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

  // What the website shows in the round avatar after saving: avatar → photo.
  const photoSrc = photo.preview || (!removePhoto ? mediaUrl(member.photoUrl) : undefined);
  const avatarUrl =
    avatarChoice === "none"
      ? null
      : avatarChoice === "keep"
        ? member.avatarUrl
        : (presets?.find((p) => p.id === avatarChoice)?.url ?? null);
  const avatarSrc = mediaUrl(avatarUrl) || photoSrc || undefined;
  const previewWidth = dragWidth ?? ui.previewWidth;

  const preview = (props: { onExpand?: () => void; onCollapse: () => void; className: string }) =>
    previewDraft ? (
      <PublicProfileLivePreview
        draft={previewDraft}
        role={member.role}
        isLead={Boolean(member.isLead)}
        avatarSrc={avatarSrc}
        onEdit={editSpot}
        onJump={jumpTo}
        {...props}
      />
    ) : null;

  return (
    <div className="grid gap-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRoundIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Public team profile</p>
            <p className="text-xs text-muted-foreground">
              {dirty ? (
                <span className="font-medium text-amber-600 dark:text-amber-400">Unsaved changes</span>
              ) : (
                "Everything is saved"
              )}
              {member.username ? ` · Login: @${member.username}` : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={wideScreen && ui.previewOpen ? "secondary" : "outline"}
            size="sm"
            aria-pressed={wideScreen ? ui.previewOpen : undefined}
            title={
              wideScreen
                ? ui.previewOpen
                  ? "Hide the live preview"
                  : "Show the live preview"
                : "Open the live preview"
            }
            onClick={() => (wideScreen ? dispatch(togglePreview()) : setPreviewSheet(true))}
          >
            <EyeIcon />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLinkIcon className="size-4" />
            <span className="hidden sm:inline">View on website</span>
          </a>
          <Button type="submit" form="public-profile-form" size="sm" disabled={saving || !dirty}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      <div
        className="grid gap-5"
        style={
          wideScreen
            ? { gridTemplateColumns: `minmax(0,1fr) ${ui.previewOpen ? `${previewWidth}px` : "2.75rem"}` }
            : undefined
        }
      >
        <form id="public-profile-form" className="grid content-start gap-6" onSubmit={handleSubmit}>
          <Card className="overflow-hidden border-border/70 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
            <CardHeader className="border-b border-border/60 bg-primary/5 dark:bg-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRoundIcon className="size-4 text-primary" />
                About you
              </CardTitle>
              <CardDescription>
                This is what visitors see on the website. Watch the preview update as you type. Designation is
                set by an admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <div id="pp-field-images" data-slot="field" className="scroll-mt-24 rounded-lg transition-shadow">
                <TeamImageFields
                  name={draft.name}
                  photo={photo}
                  savedPhotoUrl={member.photoUrl}
                  removePhoto={removePhoto}
                  onRemovePhotoChange={setRemovePhoto}
                  savedAvatarUrl={member.avatarUrl}
                  avatarChoice={avatarChoice}
                  onAvatarChoiceChange={setAvatarChoice}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div id="pp-field-name" data-slot="field" className="grid scroll-mt-24 gap-2 rounded-lg transition-shadow">
                  <Label htmlFor="staffName">Name</Label>
                  <Input
                    id="staffName"
                    required
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                <div id="pp-field-role" data-slot="field" className="grid scroll-mt-24 gap-2 rounded-lg transition-shadow">
                  <Label htmlFor="staffDesignation">Designation</Label>
                  <Input
                    id="staffDesignation"
                    value={member.role}
                    readOnly
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only an admin can change your designation on Team members.
                  </p>
                </div>
              </div>

              <div id="pp-field-tagline" data-slot="field" className="grid scroll-mt-24 gap-2 rounded-lg transition-shadow">
                <Label htmlFor="staffTagline">Short tagline (optional)</Label>
                <Input
                  id="staffTagline"
                  value={draft.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="One-line highlight"
                  maxLength={255}
                />
              </div>

              <div id="pp-field-bio" data-slot="field" className="grid scroll-mt-24 gap-2 rounded-lg transition-shadow">
                <Label htmlFor="staffDescription">Description</Label>
                <Textarea
                  id="staffDescription"
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Tell visitors about your work, skills, and role on the team…"
                  className="min-h-32"
                  maxLength={4000}
                />
                <p className="text-xs text-muted-foreground">
                  {draft.description.length}/4000 — leave a blank line between paragraphs.
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
              <StaffProfileExtras value={draft.extras} onChange={(extras) => set("extras", extras)} idPrefix="staff" />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !dirty} className="w-full sm:w-auto">
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

        {/* Live preview */}
        {wideScreen ? (
          <aside className="sticky top-[4.5rem] h-[calc(100vh-5.5rem)] self-start">
            {ui.previewOpen ? (
              <>
                <ResizeHandle
                  width={previewWidth}
                  min={PUBLIC_PROFILE_PREVIEW_WIDTH.min}
                  max={PUBLIC_PROFILE_PREVIEW_WIDTH.max}
                  dragging={dragWidth !== null}
                  onDrag={setDragWidth}
                  onCommit={(width) => dispatch(setPreviewWidth(width))}
                  onReset={() => dispatch(resetPreviewWidth())}
                />
                {preview({
                  onExpand: () => setPreviewSheet(true),
                  onCollapse: () => dispatch(setPreviewOpen(false)),
                  className: "h-full",
                })}
              </>
            ) : (
              <CollapsedPreviewRail onOpen={() => dispatch(setPreviewOpen(true))} />
            )}
          </aside>
        ) : null}
      </div>

      <Sheet open={previewSheet} onOpenChange={setPreviewSheet}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          <SheetTitle className="sr-only">Live preview</SheetTitle>
          {preview({
            onCollapse: () => setPreviewSheet(false),
            className: "h-full rounded-none border-0 shadow-none",
          })}
        </SheetContent>
      </Sheet>
    </div>
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
