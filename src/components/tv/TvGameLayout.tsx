import { cn } from "@/lib/utils";

interface TvGameLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  stageClassName?: string;
}

/** Contenedor de ronda a altura completa: escenario flexible + pie opcional fijo. */
export function TvGameLayout({
  children,
  footer,
  className,
  stageClassName,
}: TvGameLayoutProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className={cn("flex min-h-0 flex-1 flex-col", stageClassName)}>
        {children}
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}
