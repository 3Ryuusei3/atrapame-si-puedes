import { getAvatarSrc } from "@/data/playerAvatars";
import { cn } from "@/lib/utils";
import type { PlayerAvatarId } from "@/types/game";

const SIZE_CLASSES = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
  xl: "size-20",
  hero: "size-28 md:size-36",
} as const;

interface PlayerAvatarProps {
  avatarId: PlayerAvatarId;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function PlayerAvatar({
  avatarId,
  size = "md",
  className,
}: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-lg border-2 border-[#00AEEF]",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <img
        src={getAvatarSrc(avatarId)}
        alt=""
        className="size-full object-cover object-center"
      />
    </div>
  );
}
