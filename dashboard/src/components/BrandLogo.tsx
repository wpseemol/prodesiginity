import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Cropped mark for collapsed sidebar */
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const src = isDark
    ? "/assets/logo/prodesignity-logo-dark.png"
    : "/assets/logo/prodesignity-logo-light.svg";

  if (compact) {
    return (
      <div
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10",
          className,
        )}
      >
        {!mounted ? (
          <div className="size-full bg-muted/60" aria-hidden />
        ) : (
          <img
            src={src}
            alt="ProDesignity"
            width={64}
            height={32}
            className="h-7 w-auto max-w-none object-contain object-left"
            decoding="async"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-9 w-[148px] items-center", className)}>
      {!mounted ? (
        <div className="h-full w-full rounded-md bg-muted/60" aria-hidden />
      ) : (
        <img
          src={src}
          alt="ProDesignity"
          width={148}
          height={36}
          className="h-full w-auto object-contain object-left"
          decoding="async"
        />
      )}
    </div>
  );
}
