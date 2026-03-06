import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  badge?: string;
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badge && (
            <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", badgeStyles[badgeVariant])}>
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
