import { useEffect, useRef, useState, type FormEvent } from "react";

import { CameraIcon, CheckIcon, Loader2Icon } from "lucide-react";

import { toast } from "sonner";

import { mediaUrl } from "@/config";

import { apiFetch } from "@/lib/api";

import { IMAGE_SPECS } from "@/lib/imageSpecs";

import {

  updateDashboardUser,

  type DashboardPhoto,

  type DashboardUser,

} from "@/lib/session";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { cn } from "@/lib/utils";



function initials(name: string) {

  return name

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .map((part) => part[0]?.toUpperCase() ?? "")

    .join("");

}



type ProfilePhotoManagerProps = {

  user: DashboardUser;

  onUserUpdated: (user: DashboardUser) => void;

};



export function ProfilePhotoManager({

  user,

  onUserUpdated,

}: ProfilePhotoManagerProps) {

  const inputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<DashboardPhoto[]>([]);

  const [activePhotoId, setActivePhotoId] = useState<number | null>(

    user.photo?.id ?? null,

  );

  const [loadingList, setLoadingList] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [activatingId, setActivatingId] = useState<number | null>(null);



  const loadPhotos = async () => {

    setLoadingList(true);

    try {

      const res = await apiFetch("/auth/me/photos");

      const data = await res.json();

      if (!res.ok) {

        toast.error(

          typeof data.message === "string"

            ? data.message

            : "Could not load photos.",

        );

        return;

      }

      setPhotos((data.photos as DashboardPhoto[]) ?? []);

      setActivePhotoId(

        typeof data.activePhotoId === "number" ? data.activePhotoId : null,

      );

    } catch {

      toast.error("Could not reach the server.");

    } finally {

      setLoadingList(false);

    }

  };



  useEffect(() => {

    void loadPhotos();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per user

  }, [user.id]);



  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const file = inputRef.current?.files?.[0];

    if (!file) {

      toast.message("Choose an image first.");

      return;

    }



    setUploading(true);

    try {

      const body = new FormData();

      body.append("photo", file);

      body.append("altText", `${user.fullName} profile photo`);



      const res = await apiFetch("/auth/me/photo", {

        method: "POST",

        body,

      });

      const data = await res.json();

      if (!res.ok) {

        toast.error(

          typeof data.message === "string"

            ? data.message

            : "Could not upload photo.",

        );

        return;

      }



      const nextUser = data.user as DashboardUser;

      await updateDashboardUser(nextUser);

      onUserUpdated(nextUser);

      setActivePhotoId(nextUser.photo?.id ?? null);

      if (inputRef.current) inputRef.current.value = "";

      toast.success("Profile photo updated.");

      await loadPhotos();

    } catch {

      toast.error("Could not reach the server.");

    } finally {

      setUploading(false);

    }

  };



  const handleActivate = async (photoId: number) => {

    if (photoId === activePhotoId) return;

    setActivatingId(photoId);

    try {

      const res = await apiFetch(`/auth/me/photos/${photoId}/activate`, {

        method: "POST",

      });

      const data = await res.json();

      if (!res.ok) {

        toast.error(

          typeof data.message === "string"

            ? data.message

            : "Could not set active photo.",

        );

        return;

      }

      const nextUser = data.user as DashboardUser;

      await updateDashboardUser(nextUser);

      onUserUpdated(nextUser);

      setActivePhotoId(photoId);

      toast.success("Active photo changed.");

    } catch {

      toast.error("Could not reach the server.");

    } finally {

      setActivatingId(null);

    }

  };



  const currentUrl = mediaUrl(user.photo?.url);



  return (

    <Card>

      <CardHeader>

        <CardTitle>Profile photo</CardTitle>

        <CardDescription>

          Upload a new image. Previous uploads are kept under your account.

        </CardDescription>

      </CardHeader>

      <CardContent className="grid gap-6">

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">

          <Avatar className="size-24">

            {currentUrl ? (

              <AvatarImage src={currentUrl} alt={user.fullName} />

            ) : null}

            <AvatarFallback className="text-lg">

              {initials(user.fullName)}

            </AvatarFallback>

          </Avatar>



          <form className="grid w-full flex-1 gap-3" onSubmit={handleUpload}>

            <input

              ref={inputRef}

              type="file"

              accept="image/jpeg,image/png,image/webp,image/gif"

              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"

            />

            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF · max 5 MB · {IMAGE_SPECS.profilePhoto.width}×{IMAGE_SPECS.profilePhoto.height}px
            </p>

            <Button type="submit" disabled={uploading} className="w-fit">

              {uploading ? (

                <>

                  <Loader2Icon className="animate-spin" />

                  Uploading…

                </>

              ) : (

                <>

                  <CameraIcon />

                  Change photo

                </>

              )}

            </Button>

          </form>

        </div>



        <div className="grid gap-2">

          <p className="text-sm font-medium">Your images</p>

          {loadingList ? (

            <div className="flex items-center gap-2 text-sm text-muted-foreground">

              <Loader2Icon className="size-4 animate-spin" />

              Loading…

            </div>

          ) : photos.length === 0 ? (

            <p className="text-sm text-muted-foreground">

              No uploaded images yet.

            </p>

          ) : (

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">

              {photos.map((photo) => {

                const src = mediaUrl(photo.url);

                const isActive = photo.id === activePhotoId;

                return (

                  <button

                    key={photo.id}

                    type="button"

                    disabled={activatingId === photo.id}

                    onClick={() => void handleActivate(photo.id)}

                    className={cn(

                      "relative aspect-square overflow-hidden rounded-xl border bg-muted/40 transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",

                      isActive && "ring-2 ring-primary",

                    )}

                    title={isActive ? "Active photo" : "Set as active"}

                  >

                    {src ? (

                      <img

                        src={src}

                        alt={photo.altText ?? "Uploaded"}

                        className="size-full object-cover"

                      />

                    ) : null}

                    {isActive ? (

                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">

                        <CheckIcon className="size-3" />

                      </span>

                    ) : null}

                    {activatingId === photo.id ? (

                      <span className="absolute inset-0 flex items-center justify-center bg-background/60">

                        <Loader2Icon className="size-5 animate-spin text-primary" />

                      </span>

                    ) : null}

                  </button>

                );

              })}

            </div>

          )}

        </div>

      </CardContent>

    </Card>

  );

}


