import { useEffect, useRef, useState, type FormEvent } from "react";
import {
    CameraIcon,
    Loader2Icon,
    PencilIcon,
    PlusIcon,
    SparklesIcon,
    Trash2Icon,
    UsersRoundIcon,
    XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { formatImageHint, IMAGE_SPECS } from "@/lib/imageSpecs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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

type TeamMemberRow = {
    id: number;
    slug: string;
    name: string;
    role: string;
    tagline: string | null;
    photoUrl: string;
    photoAlt: string | null;
    photoTitle: string | null;
    isLead: boolean;
    sortOrder: number;
};

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

function TeamManager() {
    const fileRef = useRef<HTMLInputElement>(null);
    const [members, setMembers] = useState<TeamMemberRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<TeamMemberRow | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<TeamMemberRow | null>(null);

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [tagline, setTagline] = useState("");
    const [photoAlt, setPhotoAlt] = useState("");
    const [photoTitle, setPhotoTitle] = useState("");
    const [isLead, setIsLead] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const isEditMode = editing !== null;

    const currentPhotoSrc =
        photoPreview ||
        (editing?.photoUrl ? mediaUrl(editing.photoUrl) : undefined);

    const clearPhotoSelection = () => {
        setPhotoFile(null);
        if (photoPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const resetForm = () => {
        setEditing(null);
        setName("");
        setRole("");
        setTagline("");
        setPhotoAlt("");
        setPhotoTitle("");
        setIsLead(false);
        clearPhotoSelection();
    };

    const startEdit = (member: TeamMemberRow) => {
        clearPhotoSelection();
        setEditing(member);
        setName(member.name);
        setRole(member.role);
        setTagline(member.tagline ?? "");
        setPhotoAlt(member.photoAlt ?? "");
        setPhotoTitle(member.photoTitle ?? "");
        setIsLead(member.isLead);
    };

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

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/admin/team");
            const data = await res.json();
            if (!res.ok) {
                setError(
                    typeof data.message === "string"
                        ? data.message
                        : "Could not load team members.",
                );
                return;
            }
            setMembers(data.members ?? []);
        } catch {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const file = photoFile ?? fileRef.current?.files?.[0] ?? null;

        if (!isEditMode && !file) {
            toast.message("Choose a photo for the team member.");
            return;
        }

        setSaving(true);
        try {
            const body = new FormData();
            body.append("name", name);
            body.append("role", role);
            body.append("tagline", tagline.trim());
            body.append("photoAlt", photoAlt.trim());
            body.append("photoTitle", photoTitle.trim());
            body.append("isLead", isLead ? "true" : "false");
            if (file) body.append("photo", file);

            const res = await apiFetch(
                isEditMode ? `/admin/team/${editing.id}` : "/admin/team",
                {
                    method: isEditMode ? "PUT" : "POST",
                    body,
                },
            );
            const data = await res.json();
            if (!res.ok) {
                toast.error(
                    typeof data.message === "string"
                        ? data.message
                        : isEditMode
                          ? "Could not update team member."
                          : "Could not add team member.",
                );
                return;
            }

            toast.success(
                isEditMode
                    ? file
                        ? "Team member and photo updated."
                        : "Team member updated."
                    : "Team member added.",
            );
            resetForm();
            await load();
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (member: TeamMemberRow) => {
        setDeletingId(member.id);
        try {
            const res = await apiFetch(`/admin/team/${member.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(
                    typeof data.message === "string"
                        ? data.message
                        : "Could not delete member.",
                );
                return;
            }
            if (editing?.id === member.id) resetForm();
            setPendingDelete(null);
            toast.success("Team member deleted.");
            await load();
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="overflow-hidden border-border/70 bg-gradient-to-b from-white to-slate-50/80 shadow-xl shadow-slate-900/5 dark:from-[#0D121F] dark:to-[#0A0F1A] dark:shadow-black/40">
                <CardHeader className="border-b border-border/60 bg-primary/5 dark:bg-primary/10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {isEditMode ? (
                                    <PencilIcon className="size-4 text-primary" />
                                ) : (
                                    <SparklesIcon className="size-4 text-primary" />
                                )}
                                {isEditMode
                                    ? "Edit team member"
                                    : "Add team member"}
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                {isEditMode
                                    ? `Updating ${editing.name} for the marketing site roster.`
                                    : "Public homepage profile only. Create login accounts on Staff."}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                            {isEditMode ? "Editing" : "New"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    <form className="grid gap-5" onSubmit={handleSubmit}>
                        <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 dark:bg-primary/10">
                            <div className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="group relative size-28 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-inner transition hover:border-primary/50"
                                >
                                    {currentPhotoSrc ? (
                                        <img
                                            src={currentPhotoSrc}
                                            alt={
                                                photoAlt || name || "Team photo"
                                            }
                                            title={
                                                photoTitle || name || undefined
                                            }
                                            className="size-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                                            <CameraIcon className="size-5 opacity-70" />
                                            <span className="text-[10px] font-medium uppercase tracking-wide">
                                                Photo
                                            </span>
                                        </div>
                                    )}
                                    <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                        Change
                                    </span>
                                </button>
                                <div className="min-w-0 flex-1 space-y-2.5">
                                    <p className="text-sm font-semibold">
                                        Profile photo
                                    </p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {photoFile
                                            ? `Selected: ${photoFile.name}`
                                            : isEditMode
                                              ? `Current image kept until you change it. Ideal ${IMAGE_SPECS.teamPhoto.width}×${IMAGE_SPECS.teamPhoto.height}px.`
                                              : formatImageHint(
                                                    IMAGE_SPECS.teamPhoto,
                                                )}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                fileRef.current?.click()
                                            }
                                        >
                                            <CameraIcon />
                                            {isEditMode || photoFile
                                                ? "Change photo"
                                                : "Choose photo"}
                                        </Button>
                                        {photoFile ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearPhotoSelection}
                                            >
                                                <XIcon />
                                                Undo
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <input
                                id="teamPhoto"
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="sr-only"
                                onChange={(e) =>
                                    onPickPhoto(e.target.files?.[0])
                                }
                            />
                        </div>

                        <section className="grid gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <UsersRoundIcon className="size-3.5" />
                                Profile
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teamName">Full name</Label>
                                <Input
                                    id="teamName"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Abdullah Pitul"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teamRole">Role / title</Label>
                                <Input
                                    id="teamRole"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="Founder & 3D Product Designer"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teamTagline">
                                    Tagline (optional)
                                </Label>
                                <Input
                                    id="teamTagline"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="Shown on lead card"
                                />
                            </div>
                        </section>

                        <section className="grid gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                SEO image
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="photoTitle">Image title</Label>
                                <Input
                                    id="photoTitle"
                                    value={photoTitle}
                                    onChange={(e) =>
                                        setPhotoTitle(e.target.value)
                                    }
                                    placeholder="e.g. Abdullah Pitul — Founder"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="photoAlt">
                                    Image description / alt
                                </Label>
                                <Input
                                    id="photoAlt"
                                    value={photoAlt}
                                    onChange={(e) =>
                                        setPhotoAlt(e.target.value)
                                    }
                                    placeholder="e.g. Abdullah Pitul, Founder & 3D Product Designer"
                                />
                            </div>
                        </section>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm transition hover:border-primary/40">
                            <input
                                type="checkbox"
                                checked={isLead}
                                onChange={(e) => setIsLead(e.target.checked)}
                                className="size-4 rounded border"
                            />
                            <span>
                                <span className="font-medium">
                                    Mark as lead / founder card
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Highlights this member on the marketing
                                    site.
                                </span>
                            </span>
                        </label>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="min-w-36"
                            >
                                {saving ? (
                                    <>
                                        <Loader2Icon className="animate-spin" />
                                        {isEditMode ? "Saving…" : "Adding…"}
                                    </>
                                ) : isEditMode ? (
                                    <>
                                        <PencilIcon />
                                        Save changes
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon />
                                        Add member
                                    </>
                                )}
                            </Button>
                            {isEditMode ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    onClick={resetForm}
                                >
                                    <XIcon />
                                    Cancel
                                </Button>
                            ) : null}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-slate-50 to-transparent dark:from-white/5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UsersRoundIcon className="size-4 text-primary" />
                                Team roster
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                {members.length} member
                                {members.length === 1 ? "" : "s"} on the
                                marketing site.
                            </CardDescription>
                        </div>
                        <Badge variant="outline">
                            {members.filter((m) => m.isLead).length} lead
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    {error ? (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Could not load team</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                            <Loader2Icon className="size-4 animate-spin" />
                            Loading roster…
                        </div>
                    ) : members.length === 0 ? (
                        <div className="rounded-2xl border border-dashed py-14 text-center">
                            <UsersRoundIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                            <p className="text-sm font-medium">
                                No team members yet
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Add the first public profile here.
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {members.map((member) => {
                                const selected = editing?.id === member.id;
                                return (
                                    <li
                                        key={member.id}
                                        className={`group relative overflow-hidden rounded-2xl border p-4 transition duration-200 ${
                                            selected
                                                ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                                                : "border-border/70 bg-card hover:border-primary/30 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="size-14 rounded-xl shadow-sm ring-2 ring-background">
                                                {mediaUrl(member.photoUrl) ? (
                                                    <AvatarImage
                                                        src={mediaUrl(
                                                            member.photoUrl,
                                                        )}
                                                        alt={
                                                            member.photoAlt ||
                                                            member.name
                                                        }
                                                        className="rounded-xl object-cover"
                                                    />
                                                ) : null}
                                                <AvatarFallback className="rounded-xl text-sm">
                                                    {initials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <p className="truncate font-semibold tracking-tight">
                                                        {member.name}
                                                    </p>
                                                    {member.isLead ? (
                                                        <Badge className="h-5">
                                                            Lead
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() =>
                                                    startEdit(member)
                                                }
                                            >
                                                <PencilIcon />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    deletingId === member.id
                                                }
                                                onClick={() =>
                                                    setPendingDelete(member)
                                                }
                                            >
                                                {deletingId === member.id ? (
                                                    <Loader2Icon className="animate-spin" />
                                                ) : (
                                                    <Trash2Icon />
                                                )}
                                                Delete
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && deletingId === null) setPendingDelete(null);
                }}
                title={`Delete ${pendingDelete?.name ?? "member"}?`}
                description={`Remove ${pendingDelete?.name ?? "this member"} from the public team roster. This cannot be undone.`}
                confirmLabel="Delete member"
                loading={deletingId !== null}
                onConfirm={() => {
                    if (pendingDelete) void handleDelete(pendingDelete);
                }}
            />
        </div>
    );
}

export default function AdminTeamPage() {
    return (
        <DashboardLayout
            expectedRole="admin"
            title="Team members"
            description="Public homepage roster — create staff logins on Staff"
        >
            {() => <TeamManager />}
        </DashboardLayout>
    );
}
