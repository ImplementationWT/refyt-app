import { useEffect, useRef, useState } from "react";

export interface ColumnDatum {
  key: string;
  /** Short axis label (e.g. "12 oct"). */
  label: string;
  /** Long label for tooltip and screen readers (e.g. "lunes, 12 de octubre"). */
  fullLabel: string;
  value: number;
  /** Secondary facts shown in the tooltip only (also present in the table view). */
  details?: Array<{ label: string; value: number }>;
}

const PLOT_HEIGHT = 200;
const TOP = 26; // room for the single direct label
const AXIS = 30; // x-axis band (inside the container height)
const LEFT = 40;
const MAX_BAR = 24;
const MIN_LABEL_GAP = 46;

const compact = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });
const formatTick = (value: number) => (value >= 1000 ? compact.format(value) : String(value));

/** Clean axis: step of 1, 2 or 5 × 10^k, about four intervals, integers only. */
function niceScale(max: number): { top: number; ticks: number[] } {
  const raw = Math.max(1, max) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? magnitude * 10);
  const top = Math.max(step, Math.ceil(Math.max(1, max) / step) * step);
  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) ticks.push(value);
  return { top, ticks };
}

/** Rounded data-end (4px), square at the baseline. */
function barPath(x: number, y: number, width: number, base: number): string {
  const r = Math.min(4, width / 2, base - y);
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${base}Z`;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(280, Math.floor(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/**
 * Single-series column chart (one hue, so no legend: the card title names
 * it). Hover or keyboard focus on a column shows its tooltip; every value is
 * also in the table view rendered by the caller.
 */
export function ColumnChart({ data, valueLabel, title }: { data: ColumnDatum[]; valueLabel: string; title: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotWidth = width - LEFT;
  const band = plotWidth / Math.max(1, data.length);
  const barWidth = Math.min(MAX_BAR, band * 0.62);
  const base = TOP + PLOT_HEIGHT;
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, ticks } = niceScale(max);
  const y = (value: number) => base - (value / top) * PLOT_HEIGHT;
  const labelEvery = Math.max(1, Math.ceil(MIN_LABEL_GAP / band));
  const maxIndex = max > 0 ? data.findIndex((d) => d.value === max) : -1;
  const empty = max === 0;
  const activeDatum = active !== null ? data[active] : undefined;

  return (
    <div ref={ref} className="relative w-full" onPointerLeave={() => setActive(null)}>
      <svg
        width={width}
        height={base + AXIS}
        role="img"
        aria-label={`${title}. Máximo: ${max} ${valueLabel}.`}
        className="block overflow-visible"
      >
        {/* Recessive grid: solid hairlines, one step off the surface. */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={width} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "var(--line-2)" : "var(--line)"} strokeWidth={1} />
            <text x={LEFT - 10} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={12} fill="var(--faint)" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatTick(tick)}
            </text>
          </g>
        ))}

        {data.map((datum, index) => {
          const cx = LEFT + band * (index + 0.5);
          const x = cx - barWidth / 2;
          const showLabel = (data.length - 1 - index) % labelEvery === 0;
          return (
            <g key={datum.key}>
              {datum.value > 0 ? (
                <path
                  d={barPath(x, y(datum.value), barWidth, base)}
                  fill={active === index ? "var(--chart-1-hover)" : "var(--chart-1)"}
                  className="transition-[fill] duration-150"
                />
              ) : null}
              {index === maxIndex ? (
                <text x={cx} y={y(datum.value) - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)">
                  {datum.value}
                </text>
              ) : null}
              {showLabel ? (
                <text x={cx} y={base + 20} textAnchor="middle" fontSize={12} fill="var(--faint)">
                  {datum.label}
                </text>
              ) : null}
              {/* Hit target: the whole column band, bigger than the mark. */}
              <rect
                x={LEFT + band * index}
                y={TOP - 10}
                width={band}
                height={PLOT_HEIGHT + 10}
                fill="transparent"
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${datum.fullLabel}: ${datum.value} ${valueLabel}`}
                className="cursor-default outline-none focus-visible:stroke-[var(--brand-500)] focus-visible:stroke-2"
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>

      {empty ? (
        <p className="pointer-events-none absolute inset-x-0 top-[40%] text-center text-sm font-semibold text-muted">
          Sin actividad en este periodo
        </p>
      ) : null}

      {activeDatum && active !== null ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 min-w-40 -translate-x-1/2 -translate-y-full rounded-btn border border-line bg-surface px-3 py-2 shadow-sh2"
          style={{
            left: Math.min(Math.max(LEFT + band * (active + 0.5), 90), width - 90),
            top: Math.max(y(activeDatum.value) - 26, 64)
          }}
        >
          <p className="text-[12.5px] text-muted first-letter:uppercase">{activeDatum.fullLabel}</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm">
            <span aria-hidden className="h-0.5 w-3 rounded-full bg-[var(--chart-1)]" />
            <strong className="text-base font-bold text-ink">{activeDatum.value}</strong>
            <span className="text-muted">{valueLabel}</span>
          </p>
          {activeDatum.details?.map((detail) => (
            <p key={detail.label} className="mt-0.5 text-[12.5px] text-muted">
              {detail.label}: <span className="font-semibold text-ink">{detail.value}</span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
