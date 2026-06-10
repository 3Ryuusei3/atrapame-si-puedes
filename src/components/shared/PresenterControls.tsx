import { Button } from "@/components/ui/button";

interface PresenterControlsProps {
  onReveal?: () => void;
  revealed?: boolean;
  revealLabel?: string;
  hideRevealLabel?: string;
  onCorrect?: () => void;
  onWrong?: () => void;
  onNext?: () => void;
  onExtra?: () => void;
  extraLabel?: string;
  correctLabel?: string;
  wrongLabel?: string;
  nextLabel?: string;
  showNext?: boolean;
  showExtra?: boolean;
  disabled?: boolean;
}

export function PresenterControls({
  onReveal,
  revealed = false,
  revealLabel = "Revelar respuesta",
  hideRevealLabel = "Ocultar respuesta",
  onCorrect,
  onWrong,
  onNext,
  onExtra,
  extraLabel = "Acción",
  correctLabel = "Acierto (A)",
  wrongLabel = "Fallo (F)",
  nextLabel = "Siguiente",
  showNext = true,
  showExtra = false,
  disabled = false,
}: PresenterControlsProps) {
  const hasReveal = Boolean(onReveal);
  const showVerdict = revealed && (onCorrect || onWrong);

  if (!hasReveal && !showVerdict && !showNext && !showExtra) return null;

  return (
    <div className="bg-card flex flex-wrap items-center justify-center gap-3 rounded-xl border p-4">
      {hasReveal && (
        <Button
          variant="outline"
          size="xl"
          onClick={onReveal}
          disabled={disabled}
        >
          {revealed ? hideRevealLabel : revealLabel}
        </Button>
      )}
      {showVerdict && onCorrect && (
        <Button
          variant="success"
          size="xl"
          onClick={onCorrect}
          disabled={disabled}
        >
          {correctLabel}
        </Button>
      )}
      {showVerdict && onWrong && (
        <Button
          variant="destructive"
          size="xl"
          onClick={onWrong}
          disabled={disabled}
        >
          {wrongLabel}
        </Button>
      )}
      {showNext && onNext && (
        <Button variant="outline" size="lg" onClick={onNext} disabled={disabled}>
          {nextLabel}
        </Button>
      )}
      {showExtra && onExtra && (
        <Button variant="secondary" size="lg" onClick={onExtra} disabled={disabled}>
          {extraLabel}
        </Button>
      )}
    </div>
  );
}
