import { useMemo, useState } from "react";
import { SearchIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SERVICE_ICON_CATEGORIES,
  SERVICE_ICON_MAP,
} from "@/components/serviceIconRegistry";

export { SERVICE_ICON_MAP };

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICON_MAP);

/** "ShoppingCart" → "shopping cart" for search and tooltips. */
function readableName(name: string) {
  return name
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Z])/g, "$1 $2")
    .toLowerCase();
}

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

const ALL = "all";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const icons = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool =
      category === ALL
        ? SERVICE_ICON_NAMES
        : (SERVICE_ICON_CATEGORIES.find((c) => c.id === category)?.icons ?? []);
    if (!q) return pool;
    return SERVICE_ICON_NAMES.filter((name) => readableName(name).includes(q));
  }, [query, category]);

  return (
    <div className="grid gap-3 rounded-xl border bg-muted/10 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ServiceIcon name={value} className="size-4" />
          </span>
          <span className="text-xs">
            <span className="block text-muted-foreground">Selected</span>
            <span className="font-medium capitalize">{readableName(value)}</span>
          </span>
        </div>
        <div className="relative min-w-48 flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${SERVICE_ICON_NAMES.length} icons… e.g. cart, video, chart`}
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {!query ? (
        <div className="flex flex-wrap gap-1.5">
          {[{ id: ALL, label: "All", icons: SERVICE_ICON_NAMES }, ...SERVICE_ICON_CATEGORIES].map(
            (c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  category === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.label}
                <span className="ml-1 opacity-70">{c.icons.length}</span>
              </button>
            ),
          )}
        </div>
      ) : null}

      <div className="max-h-72 overflow-y-auto pr-1">
        {icons.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No icons match “{query}”.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
            {icons.map((name) => {
              const selected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={readableName(name)}
                  aria-label={readableName(name)}
                  aria-pressed={selected}
                  onClick={() => onChange(name)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : "border-transparent bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <ServiceIcon name={name} className="size-5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
