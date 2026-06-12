import { cn } from "@/lib/utils";

interface AnswerRevealBoxProps {
  answer: string;
  visible: boolean;
  className?: string;
}

export function AnswerRevealBox({
  answer,
  visible,
  className,
}: AnswerRevealBoxProps) {
  return (
    <div
      className={cn(
        "flex min-h-[3.25rem] items-center justify-center rounded-xl border-3 px-6 py-3 text-center transition-colors",
        visible
          ? "border-[#FFD700] bg-[#FFD700]/20"
          : "border-transparent bg-transparent",
        className,
      )}
      aria-hidden={!visible}
    >
      <p
        className={cn(
          "text-lg font-black text-[#FFD700]",
          !visible && "invisible",
        )}
      >
        Respuesta: {answer}
      </p>
    </div>
  );
}
