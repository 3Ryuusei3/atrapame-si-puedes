import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useGameStore } from "@/store/gameStore";

const ROUNDS = [1, 2, 3, 4, 5, 6] as const;

export function PresenterOptionsMenu() {
  const navigate = useNavigate();
  const phase = useGameStore((s) => s.phase);
  const jumpToRound = useGameStore((s) => s.jumpToRound);
  const resetGame = useGameStore((s) => s.resetGame);

  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingRound, setPendingRound] = useState<(typeof ROUNDS)[number] | null>(
    null,
  );

  if (phase === "setup") return null;

  const handleReset = () => {
    resetGame();
    setOpen(false);
    navigate("/");
  };

  const handleJump = () => {
    if (pendingRound) jumpToRound(pendingRound);
    setPendingRound(null);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Settings className="mr-2 size-4" />
        Opciones
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Opciones del presentador</DialogTitle>
            <DialogDescription>
              Herramientas para ensayos y gestión de la partida en directo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground mb-2 text-sm font-medium">
                Ir a ronda
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROUNDS.map((r) => (
                  <Button
                    key={r}
                    variant={pendingRound === r ? "default" : "secondary"}
                    onClick={() => setPendingRound(r)}
                  >
                    Ronda {r}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              disabled={!pendingRound}
              onClick={handleJump}
            >
              Cambiar a ronda seleccionada
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setOpen(false);
                setConfirmReset(true);
              }}
            >
              Reiniciar partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="¿Reiniciar partida?"
        description="Se perderá todo el progreso actual y volverás a la pantalla de configuración."
        confirmLabel="Reiniciar"
        onConfirm={handleReset}
      />
    </>
  );
}
