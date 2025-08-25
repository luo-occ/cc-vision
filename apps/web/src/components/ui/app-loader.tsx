import { AppLoading } from "./app-loading";

interface AppLoaderProps {
  className?: string;
  text?: string;
}

export function AppLoader({ className, text = "Loading application..." }: AppLoaderProps) {
  return (
    <div className="space-y-4">
      <AppLoading text={text} fullScreen={true} className={className} />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground animate-fade-in">
          Portfolio Tracker
        </h2>
      </div>
    </div>
  );
}
