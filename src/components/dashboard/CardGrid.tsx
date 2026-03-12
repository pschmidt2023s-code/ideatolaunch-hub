import { cn } from "@/lib/utils";

interface CardGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

const colMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function CardGrid({ children, cols = 3, className }: CardGridProps) {
  return (
    <div className={cn("grid gap-3", colMap[cols], className)}>
      {children}
    </div>
  );
}
