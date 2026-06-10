import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatScore } from "@/lib/utils";
import type { Player } from "@/types/game";

interface RoundSummaryProps {
  title: string;
  subtitle?: string;
  players: Player[];
  showPositions?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  totalValue?: number;
  highlightPlayerId?: string;
  highlightLabel?: string;
  onContinue: () => void;
  continueLabel?: string;
}

export function RoundSummary({
  title,
  subtitle,
  players,
  showPositions = false,
  showTotal = false,
  totalLabel = "Puntuación total",
  totalValue = 0,
  highlightPlayerId,
  highlightLabel = "Eliminado",
  onContinue,
  continueLabel = "Comenzar ronda",
}: RoundSummaryProps) {
  const ranked = [...players]
    .filter((p) => p.isActive)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-primary text-3xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Resumen de puntuaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "bg-secondary/40 flex items-center justify-between rounded-lg px-4 py-3",
                p.id === highlightPlayerId &&
                  "border-destructive/50 bg-destructive/10 border",
              )}
            >
              <div className="flex items-center gap-3">
                {showPositions && (
                  <span className="text-primary w-8 font-bold">{i + 1}º</span>
                )}
                <span className="font-medium">
                  J{p.order} — {p.name}
                </span>
                {p.id === highlightPlayerId && (
                  <Badge variant="destructive">{highlightLabel}</Badge>
                )}
              </div>
              <span className="text-primary font-mono font-semibold">
                {formatScore(p.score)} pts
              </span>
            </div>
          ))}
          {showTotal && (
            <div className="border-primary/30 mt-2 flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="font-semibold">{totalLabel}</span>
              <span className="text-primary text-xl font-bold">
                {formatScore(totalValue)} pts
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button size="lg" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}
