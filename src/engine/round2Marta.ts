import { ROUND2_MARTA_ALBUMS } from "@/data/round2MartaSongs";

export function isMartaPlayer(name: string): boolean {
  return name.toLowerCase().includes("marta");
}

/** R6: si hay una Marta en el concurso, juega el minuto final aunque no haya ganado R5. */
export function resolveRound6PlayerId(
  players: { id: string; name: string }[],
  defaultWinnerId: string,
): string {
  const marta = players.find((p) => isMartaPlayer(p.name));
  return marta?.id ?? defaultWinnerId;
}

export function getMartaAlbumIds(): string[] {
  return ROUND2_MARTA_ALBUMS.map((a) => a.id);
}
