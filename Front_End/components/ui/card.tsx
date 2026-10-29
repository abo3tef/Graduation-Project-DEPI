import type { ComponentProps, ReactNode } from "react";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}


export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface p-5 text-foreground",
        "shadow-[0_1px_2px_rgb(10_26_51/0.04),0_8px_24px_-12px_rgb(10_26_51/0.10)]",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  
  titleId?: string;
  
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  titleId,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cx(
        "mb-4 flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <h2 id={titleId} className="text-base font-bold leading-6">
        {title}
      </h2>
      {action}
    </div>
  );
}


export function CardEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      {children}
    </p>
  );
}