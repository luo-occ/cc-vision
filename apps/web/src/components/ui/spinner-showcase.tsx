import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ModernSpinner } from "./modern-spinner";
import { LoadingSpinner } from "./loading-spinner";
import { AppLoader } from "./app-loader";

export function SpinnerShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Loading Animation Showcase</h2>
        <p className="text-muted-foreground mb-6">
          Modern, beautiful loading indicators for better user experience
        </p>
      </div>

      {/* Modern Spinner Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Modern Spinner Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div className="space-y-2">
              <ModernSpinner variant="gradient" size="lg" />
              <p className="text-sm font-medium">Gradient</p>
            </div>
            <div className="space-y-2">
              <ModernSpinner variant="dots" size="lg" />
              <p className="text-sm font-medium">Dots</p>
            </div>
            <div className="space-y-2">
              <ModernSpinner variant="pulse" size="lg" />
              <p className="text-sm font-medium">Pulse</p>
            </div>
            <div className="space-y-2">
              <ModernSpinner variant="bars" size="lg" />
              <p className="text-sm font-medium">Bars</p>
            </div>
            <div className="space-y-2">
              <ModernSpinner variant="ring" size="lg" />
              <p className="text-sm font-medium">Ring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around">
            <div className="text-center space-y-2">
              <ModernSpinner size="sm" />
              <p className="text-sm">Small</p>
            </div>
            <div className="text-center space-y-2">
              <ModernSpinner size="md" />
              <p className="text-sm">Medium</p>
            </div>
            <div className="text-center space-y-2">
              <ModernSpinner size="lg" />
              <p className="text-sm">Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Spinner with Text */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinner with Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LoadingSpinner 
              variant="gradient" 
              text="Loading portfolio..." 
              size="md"
            />
            <LoadingSpinner 
              variant="dots" 
              text="Fetching data..." 
              size="md"
            />
            <LoadingSpinner 
              variant="pulse" 
              text="Processing..." 
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* App Loader */}
      <Card>
        <CardHeader>
          <CardTitle>Application Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 border border-dashed border-muted rounded-lg">
            <AppLoader text="Loading Portfolio Tracker..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
