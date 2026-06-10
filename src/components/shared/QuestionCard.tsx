import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: string;
  subtitle?: string;
  answer?: string;
  showAnswer?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  subtitle,
  answer,
  showAnswer = false,
  className,
}: QuestionCardProps) {
  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        {subtitle && (
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {subtitle}
          </p>
        )}
        <CardTitle className="text-2xl leading-snug font-semibold md:text-3xl">
          {question}
        </CardTitle>
      </CardHeader>
      {showAnswer && answer && (
        <CardContent>
          <p className="text-primary text-lg font-medium">
            Respuesta: {answer}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
