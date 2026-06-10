import { cn } from "@/lib/utils";

interface ScoreDeltaFloaterProps {
  challengerName: string;
  challengedName: string;
  challengerDelta: number;
  challengedDelta: number;
}

export function ScoreDeltaFloater({
  challengerName,
  challengedName,
  challengerDelta,
  challengedDelta,
}: ScoreDeltaFloaterProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="flex w-full max-w-2xl justify-between gap-8 px-8">
        <DeltaBadge name={challengerName} delta={challengerDelta} />
        <DeltaBadge name={challengedName} delta={challengedDelta} align="right" />
      </div>
    </div>
  );
}

function DeltaBadge({
  name,
  delta,
  align = "left",
}: {
  name: string;
  delta: number;
  align?: "left" | "right";
}) {
  if (delta === 0) return <div className="flex-1" />;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-1",
        align === "right" && "items-end text-right",
      )}
    >
      <span className="text-muted-foreground text-sm font-medium">{name}</span>
      <span
        className={cn(
          "animate-score-delta text-4xl font-bold drop-shadow-lg",
          delta > 0 ? "text-emerald-400" : "text-destructive",
        )}
      >
        {delta > 0 ? `+${delta}` : delta}
      </span>
    </div>
  );
}
