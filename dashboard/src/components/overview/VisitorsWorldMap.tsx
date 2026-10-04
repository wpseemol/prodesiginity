import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries from "i18n-iso-countries";
import { Loader2Icon, MapPinOffIcon } from "lucide-react";
import { CountryFlag } from "@/components/overview/CountryFlag";
import { formatNumber, type CountryStat } from "@/components/overview/analytics";

const WIDTH = 960;
const HEIGHT = 470;
const ANTARCTICA_ID = "010";

type CountryShape = { id: string; name: string; d: string };

let shapesPromise: Promise<CountryShape[]> | null = null;

function loadShapes() {
  shapesPromise ??= import("world-atlas/countries-110m.json").then((mod) => {
    const topology = (mod.default ?? mod) as unknown as Topology<{
      countries: GeometryCollection<{ name: string }>;
    }>;
    const collection = feature(
      topology,
      topology.objects.countries,
    ) as FeatureCollection<Geometry, { name: string }>;
    const visible = {
      ...collection,
      features: collection.features.filter(
        (shape) => shape.id !== ANTARCTICA_ID,
      ),
    };
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], visible);
    const path = geoPath(projection);
    return visible.features.map((shape: Feature<Geometry, { name: string }>) => ({
      id: String(shape.id ?? shape.properties.name),
      name: shape.properties.name,
      d: path(shape) ?? "",
    }));
  });
  return shapesPromise;
}

function fillFor(count: number, max: number) {
  if (!count) return "var(--muted)";
  const strength = 22 + Math.round(78 * Math.sqrt(count / max));
  return `color-mix(in oklch, var(--chart-1) ${strength}%, var(--muted))`;
}

type Hover = { name: string; code: string | null; count: number; x: number; y: number };

export function VisitorsWorldMap({
  stats,
  total,
}: {
  stats: CountryStat[];
  total: number;
}) {
  const [shapes, setShapes] = useState<CountryShape[] | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void loadShapes().then((loaded) => {
      if (active) setShapes(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const byNumeric = useMemo(() => {
    const map = new Map<string, CountryStat>();
    for (const stat of stats) {
      if (!stat.code) continue;
      const numeric = countries.alpha2ToNumeric(stat.code);
      if (numeric) map.set(numeric, stat);
    }
    return map;
  }, [stats]);

  const max = Math.max(1, ...stats.filter((s) => s.code).map((s) => s.count));
  const hasLocations = byNumeric.size > 0;

  const track = (event: React.MouseEvent, shape: CountryShape) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const stat = byNumeric.get(shape.id);
    setHover({
      name: stat?.name ?? shape.name,
      code: stat?.code ?? (countries.numericToAlpha2(shape.id) || null),
      count: stat?.count ?? 0,
      x: event.clientX - box.left,
      y: event.clientY - box.top,
    });
  };

  return (
    <div ref={wrapRef} className="relative" onMouseLeave={() => setHover(null)}>
      {shapes ? (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="World map of visitors by country"
        >
          {shapes.map((shape) => {
            const stat = byNumeric.get(shape.id);
            return (
              <path
                key={shape.id}
                d={shape.d}
                fill={fillFor(stat?.count ?? 0, max)}
                stroke="var(--background)"
                strokeWidth={0.6}
                className="cursor-default transition-[filter] duration-150 hover:brightness-110"
                onMouseMove={(event) => track(event, shape)}
              />
            );
          })}
        </svg>
      ) : (
        <div className="flex aspect-[960/470] items-center justify-center text-sm text-muted-foreground">
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          Loading map…
        </div>
      )}

      {shapes && !hasLocations ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <MapPinOffIcon className="size-3.5" />
            Country data appears once visitors arrive from the live site
          </div>
        </div>
      ) : null}

      {hover ? (
        <div
          className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-border/60 bg-background px-3 py-2 text-xs shadow-xl"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="flex items-center gap-2 font-medium">
            <CountryFlag code={hover.code} />
            {hover.name}
          </div>
          <div className="mt-1 flex items-center justify-between gap-4 text-muted-foreground">
            <span>Visits</span>
            <span className="font-mono font-medium text-foreground tabular-nums">
              {hover.count.toLocaleString()}
              {total && hover.count ? (
                <span className="ml-1 text-muted-foreground">
                  ({Math.round((hover.count / total) * 100)}%)
                </span>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        <span>Fewer</span>
        <span
          className="h-2 w-28 rounded-full"
          style={{
            background:
              "linear-gradient(to right, color-mix(in oklch, var(--chart-1) 22%, var(--muted)), var(--chart-1))",
          }}
        />
        <span>More</span>
      </div>
    </div>
  );
}

export function TopCountriesList({
  stats,
  total,
  limit = 7,
}: {
  stats: CountryStat[];
  total: number;
  limit?: number;
}) {
  if (!stats.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No visits recorded in this period.
      </p>
    );
  }

  const rows = stats.slice(0, limit);
  const rest = stats.slice(limit).reduce((sum, stat) => sum + stat.count, 0);

  return (
    <ul className="grid gap-3.5">
      {rows.map((stat) => {
        const share = total ? (stat.count / total) * 100 : 0;
        return (
          <li key={stat.code ?? stat.name} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <CountryFlag code={stat.code} />
                <span className="truncate">{stat.name}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                <span className="font-medium">{formatNumber(stat.count)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {share.toFixed(share < 10 ? 1 : 0)}%
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-1"
                style={{ width: `${Math.max(share, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
      {rest ? (
        <li className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>
            {stats.length - limit} other{" "}
            {stats.length - limit === 1 ? "country" : "countries"}
          </span>
          <span className="tabular-nums">{formatNumber(rest)} visits</span>
        </li>
      ) : null}
    </ul>
  );
}
