import { useTranslations } from "next-intl";
import type { AppointmentStatus } from "@/constants/appointment";


const STATUS_STYLES: Record<
  AppointmentStatus,
  { badge: string; dot: string }
> = {
  scheduled: {
    badge: "border-status-scheduled/30 bg-status-scheduled/15",
    dot: "bg-status-scheduled",
  },
  confirmed: {
    badge: "border-status-confirmed/30 bg-status-confirmed/15",
    dot: "bg-status-confirmed",
  },
  completed: {
    badge: "border-status-completed/30 bg-status-completed/15",
    dot: "bg-status-completed",
  },
  cancelled: {
    badge: "border-status-cancelled/30 bg-status-cancelled/15",
    dot: "bg-status-cancelled",
  },
  "no-show": {
    badge: "border-status-no-show/30 bg-status-no-show/15",
    dot: "bg-status-no-show",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("status");
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5",
        "text-xs font-semibold text-foreground",
        styles.badge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${styles.dot}`}
      />
      {t(status)}
    </span>
  );
}