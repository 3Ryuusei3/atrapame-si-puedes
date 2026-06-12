import { TvQuestionBar } from "@/components/tv/TvQuestionBar";
import { AnswerRevealBox } from "@/components/shared/AnswerRevealBox";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: string;
  subtitle?: string;
  subtitleClassName?: string;
  answer?: string;
  showAnswer?: boolean;
  className?: string;
  variant?: "default" | "metallic";
  showQuestionMarks?: boolean;
}

export function QuestionCard({
  question,
  subtitle,
  subtitleClassName,
  answer,
  showAnswer = false,
  className,
  variant = "default",
  showQuestionMarks = true,
}: QuestionCardProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <TvQuestionBar
        subtitle={subtitle}
        subtitleClassName={subtitleClassName}
        variant={variant}
        showQuestionMarks={showQuestionMarks}
      >
        {question}
      </TvQuestionBar>
      {answer && (
        <AnswerRevealBox answer={answer} visible={showAnswer} />
      )}
    </div>
  );
}
