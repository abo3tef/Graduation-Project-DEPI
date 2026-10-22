import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Builds an icon component from its inner SVG shapes. Every icon shares the
 * same 24px grid, stroke style and `currentColor`, so it takes its color from
 * the surrounding text (for example `text-primary` on an active nav item).
 * Icons are decorative: the visible label next to them carries the meaning,
 * so they are hidden from screen readers.
 */
function createIcon(shapes: ReactNode) {
  return function Icon({ className = "size-[18px]", ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
        {...props}
      >
        {shapes}
      </svg>
    );
  };
}

export const PlusIcon = createIcon(
  <>
    <path d="M12 5v14M5 12h14" />
  </>,
);

export const DashboardIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>,
);

export const PatientsIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.8c2 .6 3.2 2.3 3.5 5.2" />
  </>,
);

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4M16 8l4 4-4 4M20 12H9" />
  </>,
);

export const WarningIcon = createIcon(
  <>
    <path d="M12 8v5M12 16.5v.5M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </>,
);

export const CloseIcon = createIcon(
  <>
    <path d="M6 6l12 12M18 6L6 18" />
  </>,
);

export const TrendUpIcon = createIcon(
  <>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </>,
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </>,
);

