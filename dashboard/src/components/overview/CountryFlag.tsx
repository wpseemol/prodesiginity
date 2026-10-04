import { useState } from "react";
import { GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountryFlag({
  code,
  className,
}: {
  code: string | null | undefined;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const iso = code?.toLowerCase();

  if (!iso || iso.length !== 2 || failed) {
    return (
      <span
        className={cn(
          "inline-flex h-3.5 w-5 shrink-0 items-center justify-center rounded-[3px] bg-muted text-muted-foreground",
          className,
        )}
      >
        <GlobeIcon className="size-3" />
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "h-3.5 w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-border/60",
        className,
      )}
    />
  );
}
