import { cn } from "@/lib/utils";

interface ModernSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "dots" | "pulse" | "bars" | "ring" | "gradient";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
};

export function ModernSpinner({ 
  size = "md", 
  variant = "gradient", 
  className 
}: ModernSpinnerProps) {
  const baseSize = sizeClasses[size];

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
        )} style={{ animationDelay: "0ms" }} />
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
        )} style={{ animationDelay: "150ms" }} />
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
        )} style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn(baseSize, "relative", className)}>
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-primary/40 animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-4 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex items-end space-x-1", className)}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-primary animate-pulse",
              size === "sm" ? "w-1 h-4" : size === "md" ? "w-1.5 h-6" : "w-2 h-8"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <div className={cn(baseSize, "relative", className)}>
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
    );
  }

  // Default gradient variant
  return (
    <div className={cn(baseSize, "relative", className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/30 animate-spin">
        <div className="absolute inset-2 rounded-full bg-background" />
      </div>
      <div className="absolute inset-1 rounded-full bg-gradient-to-r from-primary to-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}>
        <div className="absolute inset-1 rounded-full bg-background" />
      </div>
    </div>
  );
}
