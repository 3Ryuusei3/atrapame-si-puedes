import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PlayerTurnSummaryStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface PlayerTurnSummaryResult {
  id: string;
  label: string;
  status: "correct" | "wrong" | "pending";
}

interface PlayerTurnSummaryProps {
  title: string;
  playerLabel: string;
  stats: PlayerTurnSummaryStat[];
  results?: PlayerTurnSummaryResult[];
  onContinue: () => void;
  continueLabel: string;
}

export function PlayerTurnSummary({
  title,
  playerLabel,
  stats,
  results,
  onContinue,
  continueLabel,
}: PlayerTurnSummaryProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-primary text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-xl font-semibold">{playerLabel}</p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Resumen del turno</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "bg-secondary/40 flex items-center justify-between rounded-lg px-4 py-3",
                stat.highlight && "border-primary/30 border",
              )}
            >
              <span className="font-medium">{stat.label}</span>
              <span
                className={cn(
                  "font-mono font-semibold",
                  stat.highlight ? "text-primary text-xl" : "text-foreground",
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">Preguntas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3",
                  result.status === "correct" && "bg-emerald-500/10",
                  result.status === "wrong" && "bg-destructive/10 opacity-80",
                  result.status === "pending" && "bg-secondary/30 opacity-60",
                )}
              >
                <span className="text-sm font-medium">{result.label}</span>
                <span className="text-sm font-semibold">
                  {result.status === "correct" && "✓ Acierto"}
                  {result.status === "wrong" && "✗ Fallo"}
                  {result.status === "pending" && "— Sin intentar"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button size="lg" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}
