import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MartialButtonProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function MartialButton({
  label,
  sublabel,
  selected = false,
  disabled = false,
  onClick,
  className,
}: MartialButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="lg"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto min-h-16 flex-col gap-1 px-4 py-3 whitespace-normal",
        selected && "ring-primary ring-2",
        !selected && "hover:border-primary/50 hover:bg-primary/10",
        className,
      )}
    >
      <span className="text-base font-bold">{label}</span>
      {sublabel && (
        <span className="text-muted-foreground text-xs font-normal">
          {sublabel}
        </span>
      )}
    </Button>
  );
}
