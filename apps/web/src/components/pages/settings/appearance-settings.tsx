'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Monitor, 
  Smartphone, 
  Sun, 
  Moon, 
  MonitorDot,
  Type,
  Layout,
  Grid,
  List
} from 'lucide-react';

export function AppearanceSettings() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [layoutDensity, setLayoutDensity] = useState('comfortable');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [chartStyle, setChartStyle] = useState('modern');

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: 'Compact text size' },
    { value: 'medium', label: 'Medium', description: 'Standard text size' },
    { value: 'large', label: 'Large', description: 'Larger, more readable text' }
  ];

  const densityOptions = [
    { value: 'compact', label: 'Compact', description: 'More content per screen' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
    { value: 'spacious', label: 'Spacious', description: 'More breathing room' }
  ];

  const chartStyleOptions = [
    { value: 'modern', label: 'Modern', description: 'Clean, minimalist charts' },
    { value: 'classic', label: 'Classic', description: 'Traditional chart styling' },
    { value: 'colorful', label: 'Colorful', description: 'Vibrant, detailed charts' }
  ];

  const handleSave = () => {
    console.log('Saving appearance settings:', {
      theme, fontSize, layoutDensity, sidebarCollapsed, animationsEnabled, chartStyle
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appearance Settings</h2>
          <p className="text-muted-foreground">
            Customize the look and feel of your interface
          </p>
        </div>
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Theme</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    theme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{option.label}</span>
                    {theme === option.value && <Badge className="ml-auto">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  
                  {/* Theme preview */}
                  <div className="mt-3 space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="flex space-x-2">
                      <div className="flex-1 h-8 bg-primary/20 rounded"></div>
                      <div className="flex-1 h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Type className="h-5 w-5" />
              <span>Typography</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Font Size</Label>
              <div className="space-y-2">
                {fontSizeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      fontSize === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setFontSize(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {fontSize === option.value && <Badge>Active</Badge>}
                    </div>
                    
                    {/* Font size preview */}
                    <div className={`mt-2 ${
                      option.value === 'small' ? 'text-sm' :
                      option.value === 'medium' ? 'text-base' : 'text-lg'
                    }`}>
                      Sample text preview
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layout className="h-5 w-5" />
              <span>Layout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Layout Density</Label>
              <div className="space-y-2">
                {densityOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      layoutDensity === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setLayoutDensity(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {layoutDensity === option.value && <Badge>Active</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collapse Sidebar</Label>
                <p className="text-sm text-muted-foreground">
                  Hide sidebar to maximize content area
                </p>
              </div>
              <Switch
                checked={sidebarCollapsed}
                onCheckedChange={setSidebarCollapsed}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid className="h-5 w-5" />
            <span>Charts & Visualizations</span>
          </CardTitle>
          <CardDescription>
            Customize how your data is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Chart Style</Label>
            <div className="grid gap-3 md:grid-cols-3">
              {chartStyleOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    chartStyle === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setChartStyle(option.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.label}</span>
                    {chartStyle === option.value && <Badge>Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                  
                  {/* Chart style preview */}
                  <div className="h-16 bg-muted rounded flex items-end space-x-1 p-2">
                    <div className={`flex-1 ${
                      option.value === 'modern' ? 'bg-blue-500' :
                      option.value === 'classic' ? 'bg-green-600' : 'bg-purple-500'
                    } rounded`} style={{ height: '40%' }}></div>
                    <div className={`flex-1 ${
                      option.value === 'modern' ? 'bg-blue-500' :
                      option.value === 'classic' ? 'bg-green-600' : 'bg-orange-500'
                    } rounded`} style={{ height: '70%' }}></div>
                    <div className={`flex-1 ${
                      option.value === 'modern' ? 'bg-blue-500' :
                      option.value === 'classic' ? 'bg-green-600' : 'bg-pink-500'
                    } rounded`} style={{ height: '50%' }}></div>
                    <div className={`flex-1 ${
                      option.value === 'modern' ? 'bg-blue-500' :
                      option.value === 'classic' ? 'bg-green-600' : 'bg-yellow-500'
                    } rounded`} style={{ height: '90%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Smooth transitions and animations
              </p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Device Specific Settings</span>
          </CardTitle>
          <CardDescription>
            Settings that apply to specific devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Monitor className="h-4 w-4" />
                <span className="font-medium">Desktop</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Settings for desktop browsers
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Theme:</span>
                  <span className="font-medium">{theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Layout:</span>
                  <span className="font-medium">{layoutDensity}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Mobile</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Settings for mobile devices
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Theme:</span>
                  <span className="font-medium">{theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sidebar:</span>
                  <span className="font-medium">Auto-collapsed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}