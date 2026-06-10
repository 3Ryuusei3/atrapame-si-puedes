import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { questions } from "@/data/questions";
import { validationErrors } from "@/data/questions";
import { useGameStore } from "@/store/gameStore";
import { DEFAULT_PLAYER_NAMES } from "@/types/game";

export function GameSetup() {
  const navigate = useNavigate();
  const startGame = useGameStore((s) => s.startGame);
  const [names, setNames] = useState<string[]>([...DEFAULT_PLAYER_NAMES]);

  const handleStart = () => {
    startGame(names);
    navigate("/game");
  };

  const updateName = (index: number, value: string) => {
    const next = [...names];
    next[index] = value;
    setNames(next);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-primary text-3xl">
            {questions.config.showName}
          </CardTitle>
          <CardDescription>
            Introduce los nombres de los 5 concursantes para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-muted-foreground w-8 text-sm font-medium">
                J{i + 1}
              </span>
              <Input
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Jugador ${i + 1}`}
              />
            </div>
          ))}

          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              <p className="font-medium">Avisos en banco de preguntas:</p>
              <ul className="mt-1 list-inside list-disc">
                {validationErrors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </div>
          )}

          <Button size="lg" className="mt-2 w-full" onClick={handleStart}>
            Iniciar concurso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
