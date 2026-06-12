import { cn } from "@/lib/utils";

interface TvPresenterDockProps {
  children: React.ReactNode;
  className?: string;
}

export function TvPresenterDock({ children, className }: TvPresenterDockProps) {
  return (
    <div
      className={cn(
        "tv-presenter-dock mt-auto border-t border-white/10 bg-black/50 backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-white/40 uppercase">
        Controles del presentador
      </p>
      {children}
    </div>
  );
}
