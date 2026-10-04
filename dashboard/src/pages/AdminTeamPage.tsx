import { useEffect, useState, type FormEvent } from "react";
import {
    AtSignIcon,
    DicesIcon,
    EyeIcon,
    EyeOffIcon,
    KeyRoundIcon,
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
import { useImagePick } from "@/hooks/useImagePick";
import { apiFetch } from "@/lib/api";
import { updateDashboardUser, type DashboardUser } from "@/lib/session";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TeamImageFields } from "@/components/team/TeamImageFields";
import { initials } from "@/lib/accountImage";
import {
    appendExtras,
    EMPTY_EXTRAS,
    extrasFromMember,
    invalidSocial,
    StaffProfileExtras,
    type ProfileExtras,
    type SocialKey,
} from "@/components/team/StaffProfileExtras";
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
    username: string | null;
    userId: number | null;
    photoUrl: string | null;
    photoAlt: string | null;
    photoTitle: string | null;
    avatarUrl: string | null;
    avatarShape: string;
    profileStyle: string;
    socials: Partial<Record<SocialKey, string>>;
    skills: string[];
    isLead: boolean;
    sortOrder: number;
};

function generateStaffPassword(length = 12): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const special = "@$!%*?&#_-";
    const all = upper + lower + digits + special;
    const pick = (pool: string) =>
        pool[Math.floor(Math.random() * pool.length)]!;
    const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
    for (let i = chars.length; i < length; i += 1) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j]!, chars[i]!];
    }
    return chars.join("");
}

function usernameFromName(fullName: string) {
    return fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")
        .slice(0, 24);
}

type TeamManagerProps = {
    currentUser: DashboardUser;
    onUserUpdated: (user: DashboardUser) => void;
};

function TeamManager({ currentUser, onUserUpdated }: TeamManagerProps) {
    const photo = useImagePick();
    const avatar = useImagePick();
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
    const [designation, setDesignation] = useState("");
    const [isLead, setIsLead] = useState(false);
    const [username, setUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [extras, setExtras] = useState<ProfileExtras>(EMPTY_EXTRAS);

    const isEditMode = editing !== null;

    const clearImageSelection = () => {
        photo.clear();
        avatar.clear();
        setRemovePhoto(false);
        setRemoveAvatar(false);
    };

    /** Keep the sidebar picture in sync when admins edit their own profile. */
    const syncOwnImages = async (saved: TeamMemberRow) => {
        if (saved.userId !== currentUser.id) return;
        const next: DashboardUser = {
            ...currentUser,
            teamMember: {
                photoUrl: saved.photoUrl,
                avatarUrl: saved.avatarUrl,
            },
        };
        await updateDashboardUser(next);
        onUserUpdated(next);
    };

    const resetForm = () => {
        setEditing(null);
        setName("");
        setDesignation("");
        setIsLead(false);
        setUsername("");
        setCurrentPassword("");
        setPassword("");
        setShowPassword(false);
        setExtras(EMPTY_EXTRAS);
        clearImageSelection();
    };

    const startEdit = (member: TeamMemberRow) => {
        clearImageSelection();
        setEditing(member);
        setName(member.name);
        setDesignation(member.role ?? "");
        setIsLead(member.isLead);
        setUsername(member.username ?? "");
        setCurrentPassword("");
        setPassword("");
        setShowPassword(false);
        setExtras(extrasFromMember(member));
    };

    const fillGeneratedPassword = async () => {
        const next = generateStaffPassword();
        setPassword(next);
        setShowPassword(true);
        try {
            await navigator.clipboard.writeText(next);
            toast.success("Password generated and copied to clipboard.");
        } catch {
            toast.success("Password generated — copy it before saving.");
        }
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.message("Username is required.");
            return;
        }
        if (!isEditMode && !password) {
            toast.message("Password is required.");
            return;
        }
        if (isEditMode && password && editing.username && !currentPassword) {
            toast.message("Enter your admin password to confirm the change.");
            return;
        }
        if (!designation.trim()) {
            toast.message("Designation is required.");
            return;
        }
        const badSocial = invalidSocial(extras);
        if (badSocial) {
            toast.error(
                `${badSocial} link must be a full URL starting with https://`,
            );
            return;
        }

        setSaving(true);
        try {
            const body = new FormData();
            body.append("name", name);
            body.append("role", designation.trim());
            body.append("isLead", isLead ? "true" : "false");
            body.append("username", username.trim());
            appendExtras(body, extras);
            if (password) {
                body.append("password", password);
                if (isEditMode && editing.username) {
                    body.append("currentPassword", currentPassword);
                }
            }
            if (photo.file) body.append("photo", photo.file);
            else if (isEditMode && removePhoto) {
                body.append("removePhoto", "true");
            }
            if (avatar.file) body.append("avatar", avatar.file);
            else if (isEditMode && removeAvatar) {
                body.append("removeAvatar", "true");
            }

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

            if (data.member) await syncOwnImages(data.member as TeamMemberRow);
            toast.success(
                isEditMode
                    ? "Team member updated."
                    : "Team member created with staff login.",
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
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Card className="overflow-hidden border-border/70 bg-gradient-to-b from-white to-slate-50/80 shadow-xl shadow-slate-900/5 dark:from-[#0D121F] dark:to-[#0A0F1A] dark:shadow-black/40">
                <CardHeader className="border-b border-border/60 bg-primary/5 dark:bg-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        {isEditMode ? (
                            <PencilIcon className="size-4 text-primary" />
                        ) : (
                            <SparklesIcon className="size-4 text-primary" />
                        )}
                        {isEditMode ? "Edit member" : "Quick add"}
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                            {isEditMode
                                ? "Update name, designation, photo, avatar, username, or password. Mark as team lead for admin access."
                                : "Name, designation, username & password — staff login auto-created. Photo and avatar are optional. Lead = admin."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <TeamImageFields
                            name={name}
                            photo={photo}
                            avatar={avatar}
                            savedPhotoUrl={editing?.photoUrl}
                            savedAvatarUrl={editing?.avatarUrl}
                            removePhoto={removePhoto}
                            onRemovePhotoChange={setRemovePhoto}
                            removeAvatar={removeAvatar}
                            onRemoveAvatarChange={setRemoveAvatar}
                            compact
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="teamName">Name</Label>
                            <Input
                                id="teamName"
                                required
                                value={name}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setName(next);
                                    if (
                                        !isEditMode &&
                                        (!username ||
                                            username ===
                                                usernameFromName(name))
                                    ) {
                                        const suggestion =
                                            usernameFromName(next);
                                        if (suggestion.length >= 3) {
                                            setUsername(suggestion);
                                        }
                                    }
                                }}
                                placeholder="Abdullah Pitul"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teamDesignation">
                                Designation
                            </Label>
                            <Input
                                id="teamDesignation"
                                required
                                value={designation}
                                onChange={(e) =>
                                    setDesignation(e.target.value)
                                }
                                placeholder="Founder & 3D Product Designer"
                            />
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                            <input
                                type="checkbox"
                                className="mt-1 size-4 rounded border-border"
                                checked={isLead}
                                onChange={(e) => setIsLead(e.target.checked)}
                            />
                            <span className="min-w-0 space-y-0.5">
                                <span className="block text-sm font-medium">
                                    Team lead
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    Lead gets an admin dashboard login. Other
                                    members stay as employer (staff only).
                                </span>
                            </span>
                        </label>

                        <div className="grid gap-2">
                            <Label htmlFor="teamUsername">
                                <span className="inline-flex items-center gap-1.5">
                                    <AtSignIcon className="size-3.5" />
                                    Username
                                </span>
                            </Label>
                            <Input
                                id="teamUsername"
                                required
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/\s+/g, ""),
                                    )
                                }
                                placeholder="pitul"
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="teamPassword">
                                    <span className="inline-flex items-center gap-1.5">
                                        <KeyRoundIcon className="size-3.5" />
                                        {isEditMode
                                            ? "New password (optional)"
                                            : "Password"}
                                    </span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => void fillGeneratedPassword()}
                                >
                                    <DicesIcon className="size-3.5" />
                                    Generate
                                </Button>
                            </div>
                            {isEditMode && editing?.username ? (
                                <Input
                                    id="teamCurrentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Your admin password (to confirm)"
                                    autoComplete="current-password"
                                />
                            ) : null}
                            <div className="relative">
                                <Input
                                    id="teamPassword"
                                    type={showPassword ? "text" : "password"}
                                    required={!isEditMode}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder={
                                        isEditMode
                                            ? "Leave blank to keep current"
                                            : "Or click Generate"
                                    }
                                    autoComplete="new-password"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute top-1/2 right-1 -translate-y-1/2"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOffIcon />
                                    ) : (
                                        <EyeIcon />
                                    )}
                                </Button>
                            </div>
                            {isEditMode && editing?.username ? (
                                <p className="text-xs text-muted-foreground">
                                    To change their password, confirm with your
                                    admin password, then enter or generate a new
                                    one.
                                </p>
                            ) : null}
                        </div>

                        <details className="group rounded-xl border border-border/70 bg-muted/20">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                                <span className="inline-flex items-center gap-1.5">
                                    <SparklesIcon className="size-3.5 text-primary" />
                                    Profile style, skills & socials
                                </span>
                                <span className="text-xs text-muted-foreground group-open:hidden">
                                    Optional
                                </span>
                            </summary>
                            <div className="border-t border-border/60 p-3">
                                <StaffProfileExtras
                                    value={extras}
                                    onChange={setExtras}
                                    compact
                                    idPrefix="admin"
                                />
                            </div>
                        </details>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="min-w-36"
                            >
                                {saving ? (
                                    <>
                                        <Loader2Icon className="animate-spin" />
                                        {isEditMode ? "Saving…" : "Creating…"}
                                    </>
                                ) : isEditMode ? (
                                    <>
                                        <PencilIcon />
                                        Save
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon />
                                        Create
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
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <UsersRoundIcon className="size-4 text-primary" />
                        Team roster
                    </CardTitle>
                    <CardDescription>
                        {members.length} member
                        {members.length === 1 ? "" : "s"} — profile + staff
                        login
                    </CardDescription>
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
                            Loading…
                        </div>
                    ) : members.length === 0 ? (
                        <div className="rounded-2xl border border-dashed py-14 text-center">
                            <UsersRoundIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                            <p className="text-sm font-medium">
                                No members yet
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Quick-add with name, username & password.
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {members.map((member) => {
                                const selected = editing?.id === member.id;
                                const imageSrc =
                                    mediaUrl(member.photoUrl) ??
                                    mediaUrl(member.avatarUrl);
                                return (
                                    <li
                                        key={member.id}
                                        className={`rounded-2xl border p-4 transition ${
                                            selected
                                                ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                                                : "border-border/70 bg-card hover:border-primary/30 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <Avatar className="size-14 rounded-xl shadow-sm ring-2 ring-background after:rounded-xl">
                                                    {imageSrc ? (
                                                        <AvatarImage
                                                            src={imageSrc}
                                                            alt={member.name}
                                                            className="rounded-xl object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-violet-500 text-sm font-semibold text-white">
                                                        {initials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {member.photoUrl &&
                                                member.avatarUrl ? (
                                                    <img
                                                        src={mediaUrl(
                                                            member.avatarUrl,
                                                        )}
                                                        alt=""
                                                        title="Avatar"
                                                        className="absolute -right-1.5 -bottom-1.5 size-6 rounded-full object-cover ring-2 ring-background"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold tracking-tight">
                                                    {member.name}
                                                    {member.isLead ? (
                                                        <Badge className="ml-2 align-middle text-[10px]">
                                                            Lead · Admin
                                                        </Badge>
                                                    ) : null}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                                    {member.role}
                                                </p>
                                                {member.profileStyle &&
                                                member.profileStyle !== "auto" ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="mt-1 text-[10px] capitalize"
                                                    >
                                                        {member.profileStyle} style
                                                    </Badge>
                                                ) : null}
                                                {member.username ? (
                                                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                        <AtSignIcon className="size-3 shrink-0" />
                                                        {member.username}
                                                    </p>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 text-amber-600 dark:text-amber-400"
                                                    >
                                                        No login
                                                    </Badge>
                                                )}
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
                description={
                    pendingDelete?.username
                        ? `Removes the public profile and staff login (@${pendingDelete.username}).`
                        : `Remove ${pendingDelete?.name ?? "this member"} from the roster.`
                }
                confirmLabel="Delete"
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
            description="Fast create: name, designation, username & password — photo and avatar optional"
        >
            {({ user, setUser }) => (
                <TeamManager currentUser={user} onUserUpdated={setUser} />
            )}
        </DashboardLayout>
    );
}
