import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Revenue over time — area + line chart                                      */
/* -------------------------------------------------------------------------- */

export type Point = { label: string; value: number };

const W = 560;
const H = 170;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function RevenueChart({
  data,
  valueFormatter,
  className,
}: {
  data: Point[];
  valueFormatter?: (value: number) => string;
  className?: string;
}) {
  const format = valueFormatter ?? ((v: number) => String(v));
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const x = (i: number) =>
    n <= 1 ? PAD_X + innerW / 2 : PAD_X + (i * innerW) / (n - 1);
  const y = (value: number) => PAD_TOP + innerH - (value / max) * innerH;

  const points = data.map((d, i) => ({ x: x(i), y: y(d.value), ...d }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L${points[points.length - 1].x.toFixed(1)} ${
        PAD_TOP + innerH
      } L${points[0].x.toFixed(1)} ${PAD_TOP + innerH} Z`
    : "";

  // Approximate polyline length so the draw animation matches the path.
  const length = points.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Revenue over time"
        preserveAspectRatio="none"
        style={{ height: 190 }}
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              style={{ stopColor: "rgb(var(--accent-rgb) / 0.28)" }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "rgb(var(--accent-rgb) / 0.02)" }}
            />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={PAD_TOP + innerH}
          y2={PAD_TOP + innerH}
          stroke="rgb(var(--line-rgb))"
          strokeWidth={1}
        />

        {hasData && (
          <>
            <path d={areaPath} fill="url(#rev-fill)" className="chart-area" />
            <path
              d={linePath}
              fill="none"
              stroke="rgb(var(--accent-rgb))"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="chart-line"
              style={{ ["--len" as string]: Math.ceil(length) }}
            />
          </>
        )}

        {points.map((p, i) => (
          <circle
            key={p.label + i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="rgb(var(--surface-rgb))"
            stroke="rgb(var(--accent-rgb))"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="chart-dot"
            style={{ animationDelay: `${300 + i * 60}ms` }}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between gap-2 px-1 text-[11px] text-muted">
        {data.map((d, i) => (
          <span key={d.label + i} className="flex-1 text-center">
            {d.label}
          </span>
        ))}
      </div>

      {!hasData && (
        <p className="mt-1 text-center text-xs text-muted">
          No revenue recorded yet ({format(0)}).
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Order status — donut chart                                                 */
/* -------------------------------------------------------------------------- */

export type Segment = {
  label: string;
  value: number;
  color: string;
  opacity?: number;
};

const SIZE = 168;
const STROKE = 20;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function DonutChart({
  segments,
  centerLabel,
  className,
}: {
  segments: Segment[];
  centerLabel?: string;
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label="Orders by status"
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="rgb(var(--line-rgb))"
              strokeWidth={STROKE}
            />
            {total > 0 &&
              segments
                .filter((s) => s.value > 0)
                .map((s, i) => {
                  const len = (s.value / total) * C;
                  const dash = `${len} ${C - len}`;
                  const seg = (
                    <circle
                      key={s.label}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={R}
                      fill="none"
                      stroke={s.color}
                      strokeOpacity={s.opacity ?? 1}
                      strokeWidth={STROKE}
                      strokeLinecap="butt"
                      strokeDasharray={dash}
                      strokeDashoffset={-offset}
                      className="donut-seg"
                      style={{
                        ["--c" as string]: C,
                        animationDelay: `${i * 110}ms`,
                      }}
                    />
                  );
                  offset += len;
                  return seg;
                })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">{total}</span>
          {centerLabel && (
            <span className="mt-0.5 text-xs text-muted">{centerLabel}</span>
          )}
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color, opacity: s.opacity ?? 1 }}
              aria-hidden="true"
            />
            <span className="truncate text-muted">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Category breakdown — horizontal bars                                       */
/* -------------------------------------------------------------------------- */

export function BarChart({
  data,
  className,
}: {
  data: Point[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <p className={cn("py-8 text-center text-sm text-muted", className)}>
        Nothing to show yet.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3">
          <span className="truncate text-xs text-muted" title={d.label}>
            {d.label}
          </span>
          <span className="h-2.5 overflow-hidden rounded-full bg-background">
            <span
              className="chart-bar block h-full rounded-full bg-accent"
              style={{
                width: `${(d.value / max) * 100}%`,
                animationDelay: `${i * 70}ms`,
              }}
            />
          </span>
          <span className="text-right text-xs font-medium tabular-nums">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
