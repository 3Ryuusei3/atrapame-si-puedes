import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { TvBackground } from "@/components/tv/TvBackground";
import { questions } from "@/data/questions";
import { validationErrors } from "@/data/questions";
import {
  createDefaultSetupEntries,
  type PlayerSetupEntry,
} from "@/data/playerAvatars";
import { formatPlayerName } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";

export function GameSetup() {
  const navigate = useNavigate();
  const startGame = useGameStore((s) => s.startGame);
  const [entries, setEntries] = useState<PlayerSetupEntry[]>(() =>
    createDefaultSetupEntries(),
  );

  const handleStart = () => {
    startGame(entries);
    navigate("/game");
  };

  const updateName = (index: number, value: string) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, name: formatPlayerName(value) } : entry,
      ),
    );
  };

  return (
    <TvBackground className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-lg items-center justify-center p-6">
        <div className="w-full rounded-xl border-3 border-[#00AEEF] bg-[#0a1e4a]/95 p-8 shadow-2xl">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt={questions.config.showName}
              className="max-h-28 w-auto max-w-full object-contain md:max-h-32"
            />
          </div>

          <div className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-[#00AEEF]/25 bg-[#061a4a]/60 px-3 py-2"
              >
                <Input
                  value={entry.name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder="Nombre"
                  className="min-w-0 flex-1 border-[#00AEEF]/40 bg-[#061a4a] font-bold uppercase text-white placeholder:text-white/30"
                />
                <PlayerAvatar avatarId={entry.avatarId} size="md" />
              </div>
            ))}

            {validationErrors.length > 0 && (
              <div className="rounded-lg border-3 border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                <p className="font-bold">Avisos en banco de preguntas:</p>
                <ul className="mt-1 list-inside list-disc">
                  {validationErrors.map((e, idx) => (
                    <li key={idx}>{e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              size="lg"
              className="mt-2 w-full border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
              onClick={handleStart}
            >
              Iniciar concurso
            </Button>
          </div>
        </div>
      </div>
    </TvBackground>
  );
}
