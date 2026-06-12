import { useMemo } from "react";

const COLORS = [
  "#fbbf24",
  "#f472b6",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#f87171",
];

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        spawnTop: -(8 + (i % 12) * 6),
        delay: `${(i * 0.09) % 2.8}s`,
        duration: `${2.4 + (i % 5) * 0.4}s`,
        drift: (i % 2 === 0 ? 1 : -1) * (12 + (i % 4) * 8),
        color: COLORS[i % COLORS.length],
        width: 6 + (i % 4) * 2,
        height: 10 + (i % 3) * 3,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece animate-confetti-fall absolute block rounded-sm"
          style={{
            left: piece.left,
            top: `${piece.spawnTop}vh`,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--confetti-drift" as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
