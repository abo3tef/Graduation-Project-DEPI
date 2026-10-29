import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
