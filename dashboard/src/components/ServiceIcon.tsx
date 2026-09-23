import {
  AppWindow,
  BookOpen,
  Box,
  Clapperboard,
  Eye,
  FileText,
  Film,
  Layout,
  ListChecks,
  Megaphone,
  PackageSearch,
  Palette,
  Search,
  SearchCheck,
  Share2,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  AppWindow,
  BookOpen,
  Box,
  Clapperboard,
  Eye,
  FileText,
  Film,
  Layout,
  ListChecks,
  Megaphone,
  PackageSearch,
  Palette,
  Search,
  SearchCheck,
  Share2,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Video,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICON_MAP);

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = SERVICE_ICON_MAP[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {SERVICE_ICON_NAMES.map((name) => {
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <ServiceIcon name={name} className="size-5" />
            <span className="max-w-full truncate text-[9px] font-medium leading-tight">
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
