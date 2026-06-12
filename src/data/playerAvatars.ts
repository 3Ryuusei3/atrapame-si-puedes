import type { Player, PlayerAvatarId } from "@/types/game";

/** Avatares elegibles (sin naranja). */
export const SELECTABLE_AVATAR_IDS = [
  "amarillo",
  "rojo",
  "azul",
  "verde",
  "morado",
] as const satisfies readonly PlayerAvatarId[];

export const PLAYER_AVATARS: Record<
  PlayerAvatarId,
  { label: string; src: string }
> = {
  amarillo: { label: "Amarillo", src: "/avatars/amarillo.png" },
  rojo: { label: "Rojo", src: "/avatars/rojo.png" },
  azul: { label: "Azul", src: "/avatars/azul.png" },
  verde: { label: "Verde", src: "/avatars/verde.png" },
  morado: { label: "Morado", src: "/avatars/morado.png" },
};

export function resolveAvatarId(
  player: Pick<Player, "avatarId" | "order">,
): PlayerAvatarId {
  if (player.avatarId && player.avatarId in PLAYER_AVATARS) {
    return player.avatarId;
  }
  const idx = Math.min(
    Math.max(player.order - 1, 0),
    SELECTABLE_AVATAR_IDS.length - 1,
  );
  return SELECTABLE_AVATAR_IDS[idx];
}

export function getAvatarSrc(avatarId: PlayerAvatarId): string {
  return PLAYER_AVATARS[avatarId].src;
}

export interface PlayerSetupEntry {
  name: string;
  avatarId: PlayerAvatarId;
}

export function createDefaultSetupEntries(): PlayerSetupEntry[] {
  return Array.from({ length: 5 }, (_, i) => ({
    name: "",
    avatarId: SELECTABLE_AVATAR_IDS[i],
  }));
}

export function areSetupAvatarsUnique(
  entries: readonly PlayerSetupEntry[],
): boolean {
  const ids = entries.map((e) => e.avatarId);
  return new Set(ids).size === ids.length;
}
