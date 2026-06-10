import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Player } from "@/types/game";

interface PlayerSelectorProps {
  label: string;
  players: Player[];
  value: string | null;
  onChange: (id: string) => void;
  excludeIds?: string[];
  disabledIds?: string[];
}

export function PlayerSelector({
  label,
  players,
  value,
  onChange,
  excludeIds = [],
  disabledIds = [],
}: PlayerSelectorProps) {
  const available = players.filter(
    (p) => p.isActive && !excludeIds.includes(p.id),
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-muted-foreground text-sm font-medium">{label}</label>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {available.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
              disabled={disabledIds.includes(p.id)}
            >
              J{p.order} — {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
