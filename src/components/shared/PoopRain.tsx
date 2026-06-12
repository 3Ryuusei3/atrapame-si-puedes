import { useMemo } from "react";

export function PoopRain() {
  const drops = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 23 + 3) % 100}%`,
        delay: `${(i * 0.11) % 3}s`,
        duration: `${2.5 + (i % 4) * 0.4}s`,
        size: 1.4 + (i % 3) * 0.35,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="animate-poop-fall absolute top-0 select-none"
          style={{
            left: drop.left,
            fontSize: `${drop.size}rem`,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        >
          💩
        </span>
      ))}
    </div>
  );
}
