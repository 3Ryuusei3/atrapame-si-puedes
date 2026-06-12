import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUND2_MARTA_CLIP_START_SECONDS } from "@/data/round2MartaSongs";
import { gameRedText } from "@/lib/gameColors";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MartaAudioPlayerProps {
  src: string;
  clipStartSeconds?: number;
  disabled?: boolean;
  onPlaybackStateChange?: (state: {
    isPlaying: boolean;
    hasStarted: boolean;
  }) => void;
}

export function MartaAudioPlayer({
  src,
  clipStartSeconds = ROUND2_MARTA_CLIP_START_SECONDS,
  disabled = false,
  onPlaybackStateChange,
}: MartaAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const hasStartedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(clipStartSeconds);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const notifyState = useCallback(
    (playing: boolean, started: boolean) => {
      onPlaybackStateChange?.({ isPlaying: playing, hasStarted: started });
    },
    [onPlaybackStateChange],
  );

  const markStarted = useCallback((started: boolean) => {
    hasStartedRef.current = started;
    setHasStarted(started);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    markStarted(false);
    setCurrentTime(clipStartSeconds);
    setDuration(0);
    setLoadError(false);
    isSeekingRef.current = false;

    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      audio.currentTime = clipStartSeconds;
      setCurrentTime(clipStartSeconds);
    };
    const onTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      notifyState(false, hasStartedRef.current);
    };
    const onError = () => setLoadError(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [src, clipStartSeconds, markStarted, notifyState]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || disabled || loadError) return;

    try {
      if (!hasStartedRef.current) {
        audio.currentTime = clipStartSeconds;
        setCurrentTime(clipStartSeconds);
        markStarted(true);
      }
      await audio.play();
      setIsPlaying(true);
      notifyState(true, true);
    } catch {
      setIsPlaying(false);
      notifyState(false, hasStartedRef.current);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    notifyState(false, hasStartedRef.current);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = clipStartSeconds;
    setCurrentTime(clipStartSeconds);
    setIsPlaying(false);
    if (hasStartedRef.current) notifyState(false, true);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = clipStartSeconds;
    setCurrentTime(clipStartSeconds);
    setIsPlaying(false);
    markStarted(true);
    notifyState(false, true);
  };

  const handleSeekCommit = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
    isSeekingRef.current = false;
  };

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-sm",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled || loadError}
            onClick={isPlaying ? pause : play}
            className="size-8 border-[#FFD700]/50 bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled || loadError || !hasStarted}
            onClick={stop}
            className="size-8 border-white/30 bg-white/5 text-white hover:bg-white/10"
            aria-label="Parar"
          >
            <Square className="size-3 fill-current" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled || loadError}
            onClick={restart}
            className="size-8 border-white/30 bg-white/5 text-white hover:bg-white/10"
            aria-label="Reiniciar desde el inicio del extracto"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <span className="w-9 shrink-0 text-right text-[10px] font-medium text-white/50 tabular-nums">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          disabled={disabled || loadError || duration <= 0}
          onChange={(e) => {
            isSeekingRef.current = true;
            setCurrentTime(Number(e.target.value));
          }}
          onMouseUp={(e) => handleSeekCommit(Number(e.currentTarget.value))}
          onTouchEnd={(e) => handleSeekCommit(Number(e.currentTarget.value))}
          className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#FFD700] disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFD700]"
          style={{
            background: `linear-gradient(to right, #FFD700 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%)`,
          }}
        />

        <span className="w-9 shrink-0 text-[10px] font-medium text-white/50 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {loadError && (
        <p className={cn("mt-1.5 text-center text-xs", gameRedText)}>
          No se pudo cargar el audio.
        </p>
      )}
    </div>
  );
}
