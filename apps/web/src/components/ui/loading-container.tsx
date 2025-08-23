import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface LoadingContainerProps {
  children: ReactNode;
  isLoading: boolean;
  error?: Error | null;
  skeleton?: ReactNode;
  loadingText?: string;
  errorText?: string;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingContainer({
  children,
  isLoading,
  error,
  skeleton,
  loadingText = "Loading...",
  errorText = "Something went wrong",
  onRetry,
  className,
  fullScreen = false
}: LoadingContainerProps) {
  const containerClass = cn(
    fullScreen && "flex min-h-screen items-center justify-center",
    className
  );

  if (error) {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">
            {errorText}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message || "An unexpected error occurred while loading the data."}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    if (skeleton) {
      return (
        <div className={cn("animate-in fade-in-0 duration-200", className)}>
          {skeleton}
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("animate-in fade-in-0 duration-300", className)}>
      {children}
    </div>
  );
}
