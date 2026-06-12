/** Colores de feedback unificados (verde / rojo / amarillo) en todas las rondas. */

/** Acierto: peldaño, tema completado, opción correcta, punto anotado */
export const gameGreenFill =
  "border-emerald-400 bg-emerald-400 text-black shadow-[0_0_16px_rgba(52,211,153,0.65)]";

/** Fallo: tema fallado, opción incorrecta */
export const gameRedFill =
  "border-red-500 bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.55)]";

/** Activo: tema en juego, siguiente punto, selección */
export const gameYellowFill =
  "border-accent bg-accent text-black shadow-[0_0_14px_rgba(255,215,0,0.5)]";

export const gameGreenSoft = "border-emerald-400/40 bg-emerald-400/15";
export const gameRedSoft = "border-red-500/40 bg-red-500/15";

export const gameGreenText = "text-emerald-400";
export const gameRedText = "text-red-500";
export const gameYellowText = "text-accent";

/** Escalera R5 — peldaños alcanzados */
export const gameGreenLadderStep =
  "border-emerald-400 bg-emerald-400/30 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]";
export const gameGreenLadderPlat = "bg-emerald-400/60";

/** Escalera R5 — meta / ganador */
export const gameYellowWinStep =
  "animate-pulse border-accent bg-accent/25 text-accent shadow-[0_0_24px_rgba(255,215,0,0.7)]";
export const gameYellowWinPlat = "bg-accent/70";

export const gameYellowToken =
  "border-accent bg-accent text-black shadow-[0_0_12px_rgba(255,215,0,0.6)]";
export const gameYellowTokenWinner =
  "scale-110 border-accent bg-accent text-black shadow-[0_0_20px_rgba(255,215,0,0.8)]";
