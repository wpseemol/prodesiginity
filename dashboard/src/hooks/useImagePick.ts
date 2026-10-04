import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Local image pick with a blob preview that is revoked when replaced. */
export function useImagePick() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pick = (next: File | undefined) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return { inputRef, file, preview, pick, clear };
}

export type ImagePick = ReturnType<typeof useImagePick>;
