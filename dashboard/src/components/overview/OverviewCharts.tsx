import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  longDate,
  shortDate,
  type AnalyticsOverview,
} from "@/components/overview/analytics";

const trafficConfig = {
  visits: { label: "Page views", color: "var(--chart-1)" },
  visitors: { label: "Visitors", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function TrafficChart({
  daily,
}: {
  daily: NonNullable<AnalyticsOverview["daily"]>;
}) {
  return (
    <ChartContainer config={trafficConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={shortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={36}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) => {
                const date = payload?.[0]?.payload?.date;
                return typeof date === "string" ? longDate(date) : "";
              }}
            />
          }
        />
        <Area
          dataKey="visits"
          type="monotone"
          fill="url(#fillVisits)"
          stroke="var(--color-visits)"
          strokeWidth={2}
        />
        <Area
          dataKey="visitors"
          type="monotone"
          fill="url(#fillVisitors)"
          stroke="var(--color-visitors)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

export function Sparkline({
  data,
  dataKey,
  color = "var(--chart-1)",
}: {
  data: NonNullable<AnalyticsOverview["daily"]>;
  dataKey: "visits" | "visitors";
  color?: string;
}) {
  const id = `spark-${dataKey}`;
  return (
    <ChartContainer
      config={{ [dataKey]: { label: dataKey, color } }}
      className="aspect-auto h-10 w-full"
    >
      <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey={dataKey}
          type="monotone"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const DEVICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function titleCase(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : "Unknown";
}

export function DeviceChart({ rows }: { rows: AnalyticsOverview["byDevice"] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const { data, config } = useMemo(() => {
    const chartConfig: ChartConfig = { count: { label: "Visits" } };
    const chartData = rows.map((row, index) => {
      const key = row.key || "unknown";
      chartConfig[key] = {
        label: titleCase(key),
        color: DEVICE_COLORS[index % DEVICE_COLORS.length],
      };
      return { device: key, count: row.count, fill: `var(--color-${key})` };
    });
    return { data: chartData, config: chartConfig };
  }, [rows]);

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ChartContainer config={config} className="mx-auto aspect-square h-48">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="device" hideLabel />}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="device"
            innerRadius={56}
            outerRadius={80}
            strokeWidth={3}
            stroke="var(--background)"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.device} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-semibold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      visits
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid gap-2.5">
        {data.map((entry) => {
          const share = total ? Math.round((entry.count / total) * 100) : 0;
          return (
            <li
              key={entry.device}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ background: config[entry.device]?.color }}
                />
                {config[entry.device]?.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                <span className="font-medium text-foreground">{share}%</span>{" "}
                · {entry.count.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const browserConfig = {
  count: { label: "Visits", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function BrowserChart({ rows }: { rows: AnalyticsOverview["byBrowser"] }) {
  const data = rows.map((row) => ({
    browser: row.key || "Other",
    count: row.count,
  }));

  return (
    <ChartContainer
      config={browserConfig}
      className="aspect-auto w-full"
      style={{ height: Math.max(140, data.length * 36) }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          dataKey="browser"
          type="category"
          tickLine={false}
          axisLine={false}
          width={84}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={5} barSize={18} />
      </BarChart>
    </ChartContainer>
  );
}
