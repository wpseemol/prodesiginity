import { useEffect, useRef, useState, type FormEvent } from "react";
import {
    CameraIcon,
    Loader2Icon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
    UsersRoundIcon,
    XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { mediaUrl } from "@/config";
import { apiFetch } from "@/lib/api";
import { formatImageHint, IMAGE_SPECS } from "@/lib/imageSpecs";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
        if (!window.confirm(`Delete ${member.name} from the team roster?`))
            return;
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
            toast.success("Team member deleted.");
            await load();
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isEditMode ? (
                            <PencilIcon className="size-4 text-primary" />
                        ) : (
                            <PlusIcon className="size-4 text-primary" />
                        )}
                        {isEditMode ? "Edit team member" : "Add team member"}
                    </CardTitle>
                    <CardDescription>
                        {isEditMode
                            ? `Updating ${editing.name}. Use Change photo to replace the image.`
                            : "New members appear on the marketing site team section."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="grid gap-3 rounded-xl border bg-muted/20 p-3">
                            <div className="flex items-start gap-3">
                                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted">
                                    {currentPhotoSrc ? (
                                        <img
                                            src={currentPhotoSrc}
                                            alt={
                                                photoAlt || name || "Team photo"
                                            }
                                            title={
                                                photoTitle || name || undefined
                                            }
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                            No photo
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <p className="text-sm font-medium">
                                        {isEditMode
                                            ? "Member photo"
                                            : "Upload photo"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {photoFile
                                            ? `New file selected: ${photoFile.name}`
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
                                                Undo change
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
                        <div className="grid gap-2">
                            <Label htmlFor="photoTitle">
                                Image title (SEO)
                            </Label>
                            <Input
                                id="photoTitle"
                                value={photoTitle}
                                onChange={(e) => setPhotoTitle(e.target.value)}
                                placeholder="e.g. Abdullah Pitul — Founder"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="photoAlt">
                                Image description / alt (SEO)
                            </Label>
                            <Input
                                id="photoAlt"
                                value={photoAlt}
                                onChange={(e) => setPhotoAlt(e.target.value)}
                                placeholder="e.g. Abdullah Pitul, Founder & 3D Product Designer"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={isLead}
                                onChange={(e) => setIsLead(e.target.checked)}
                                className="size-4 rounded border"
                            />
                            Mark as lead / founder card
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" disabled={saving}>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersRoundIcon className="size-4 text-primary" />
                        Team roster
                    </CardTitle>
                    <CardDescription>
                        {members.length} member{members.length === 1 ? "" : "s"}{" "}
                        in the database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Could not load team</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    {loading ? (
                        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                            <Loader2Icon className="size-4 animate-spin" />
                            Loading…
                        </div>
                    ) : members.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No team members yet. Add the first one.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="w-45" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className={
                                            editing?.id === member.id
                                                ? "bg-primary/5"
                                                : undefined
                                        }
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="size-9">
                                                    {mediaUrl(
                                                        member.photoUrl,
                                                    ) ? (
                                                        <AvatarImage
                                                            src={mediaUrl(
                                                                member.photoUrl,
                                                            )}
                                                            alt={
                                                                member.photoAlt ||
                                                                member.name
                                                            }
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">
                                                        {initials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {member.name}
                                                    </p>
                                                    {member.isLead ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="mt-0.5"
                                                        >
                                                            Lead
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {member.role}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
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
                                                        void handleDelete(
                                                            member,
                                                        )
                                                    }
                                                >
                                                    {deletingId ===
                                                    member.id ? (
                                                        <Loader2Icon className="animate-spin" />
                                                    ) : (
                                                        <Trash2Icon />
                                                    )}
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminTeamPage() {
    return (
        <DashboardLayout
            expectedRole="admin"
            title="Team members"
            description="Add, edit, or remove homepage team profiles"
        >
            {() => <TeamManager />}
        </DashboardLayout>
    );
}
