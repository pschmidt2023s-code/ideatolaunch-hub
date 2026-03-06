interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Optional status badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "success" | "warning" | "destructive";
}

const badgeStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function PageHeader({ title, description, children, badge, badgeVariant = "default" }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {badge && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-3 sm:mt-0">{children}</div>}
    </div>
  );
}