import type { DashboardStat } from "@/types/api";
import {
  FiActivity,
  FiCalendar,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

const STAT_META: Record<
  string,
  { icon: typeof FiUsers; accent: string; line: string }
> = {
  totalPatients: {
    icon: FiUsers,
    accent: "bg-primary/12 text-primary",
    line: "#2dd4bf",
  },
  weeklyVisits: {
    icon: FiActivity,
    accent: "bg-status-completed/12 text-status-completed",
    line: "#60a5fa",
  },
  todayAppointments: {
    icon: FiCalendar,
    accent: "bg-status-no-show/12 text-status-no-show",
    line: "#fbbf24",
  },
  newRecords: {
    icon: FiFileText,
    accent: "bg-status-confirmed/12 text-status-confirmed",
    line: "#34d399",
  },
};

function Sparkline({
  values,
  color,
  label,
}: {
  values: number[];
  color: string;
  label: string;
}) {
  const width = 100;
  const height = 32;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - 3 - (value / max) * (height - 8);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const area = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="h-10 w-full"
    >
      <polygon points={area} fill={color} opacity="0.09" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatsGrid({
  stats,
  labels,
  locale,
  trendLabel,
}: {
  stats: DashboardStat[];
  labels: Record<string, string>;
  locale: Locale;
  trendLabel: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const meta = STAT_META[stat.key] ?? STAT_META.totalPatients;
        const Icon = meta.icon;
        const label = labels[stat.key] ?? stat.key;

        return (
          <div
            key={stat.key}
            className="rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-muted">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-extrabold leading-none tracking-tight">
                  {formatNumber(stat.value, locale)}
                </p>
              </div>
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-xl ${meta.accent}`}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </div>
            <div className="mt-3">
              <Sparkline
                values={stat.trend}
                color={meta.line}
                label={trendLabel}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
