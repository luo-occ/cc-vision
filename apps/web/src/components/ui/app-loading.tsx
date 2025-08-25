import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface AppLoadingProps {
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function AppLoading({ 
  className, 
  text = "Loading...", 
  fullScreen = true 
}: AppLoadingProps) {
  const containerClass = cn(
    fullScreen && "flex min-h-screen items-center justify-center",
    className
  );

  return (
    <div className={containerClass}>
      <div className="text-center space-y-6">
        {/* Logo with animated rings */}
        <div className="relative mx-auto w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          
          {/* Middle ring */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-primary/40 animate-ping" 
            style={{ animationDelay: "0.5s" }}
          />
          
          {/* Inner circle with logo */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-pulse">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* Loading text with typing animation */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground animate-fade-in-delay">
            {text}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          <div 
            className="w-2 h-2 rounded-full bg-primary animate-bounce" 
            style={{ animationDelay: "0.1s" }}
          />
          <div 
            className="w-2 h-2 rounded-full bg-primary animate-bounce" 
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}