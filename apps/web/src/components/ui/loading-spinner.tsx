import { cn } from "@/lib/utils";
import { ModernSpinner } from "./modern-spinner";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "dots" | "pulse" | "bars" | "ring" | "gradient";
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "gradient",
  text, 
  className, 
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center gap-3", className)} 
      {...props}
    >
      <ModernSpinner size={size} variant={variant} />
      {text && (
        <span className="text-sm text-muted-foreground animate-fade-in-delay">
          {text}
        </span>
      )}
    </div>
  );
}
