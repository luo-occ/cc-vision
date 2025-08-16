'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileText,
  HardDrive,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp
} from 'lucide-react';

export function DataExportSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState('2024-01-20 10:30');
  const [autoBackup, setAutoBackup] = useState(true);

  const exportOptions = [
    {
      title: 'Portfolio Data',
      description: 'Complete portfolio with holdings, transactions, and performance',
      format: 'JSON/CSV',
      size: '~2.5 MB',
      icon: FileText
    },
    {
      title: 'Transaction History',
      description: 'All transactions and trade history',
      format: 'CSV/Excel',
      size: '~850 KB',
      icon: Calendar
    },
    {
      title: 'Account Settings',
      description: 'Your account preferences and configurations',
      format: 'JSON',
      size: '~150 KB',
      icon: Database
    },
    {
      title: 'Performance Reports',
      description: 'Historical performance metrics and analytics',
      format: 'PDF/CSV',
      size: '~1.2 MB',
      icon: TrendingUp
    }
  ];

  const handleExport = async (type: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    console.log(`Exporting ${type}...`);
  };

  const handleBackup = () => {
    console.log('Creating backup...');
    setLastBackup(new Date().toLocaleString());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data & Export</h2>
          <p className="text-muted-foreground">
            Export your portfolio data and manage backups
          </p>
        </div>
        <Button onClick={handleBackup}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Create Backup
        </Button>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Data</span>
                <Badge variant="secondary">4.7 MB</Badge>
              </div>
              <div className="text-2xl font-bold">4.7 MB</div>
              <div className="text-sm text-muted-foreground">of 100 MB used</div>
              <Progress value={4.7} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Last Backup</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-semibold">{lastBackup}</div>
              <div className="text-sm text-muted-foreground">Auto-backup enabled</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Data Quality</span>
                <Badge variant="outline">Good</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-muted-foreground">Data integrity score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </CardTitle>
          <CardDescription>
            Download your data in various formats for external use or backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {exportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{option.title}</h3>
                        <Badge variant="outline">{option.size}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Format: {option.format}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExport(option.title)}
                          disabled={isExporting}
                        >
                          {isExporting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="ml-2">Export</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isExporting && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Exporting data...</span>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Backup Settings</span>
          </CardTitle>
          <CardDescription>
            Configure automatic backups and data protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Automatic Backups</h3>
              <p className="text-sm text-muted-foreground">
                Create daily backups of your data
              </p>
            </div>
            <Button
              variant={autoBackup ? "default" : "outline"}
              onClick={() => setAutoBackup(!autoBackup)}
            >
              {autoBackup ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Frequency</span>
              </div>
              <p className="text-sm text-muted-foreground">Daily at 2:00 AM</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Retention</span>
              </div>
              <p className="text-sm text-muted-foreground">Keep last 30 days</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Cloud className="h-4 w-4" />
                <span className="font-medium">Storage</span>
              </div>
              <p className="text-sm text-muted-foreground">Local + Cloud</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Restore from Backup
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download All Backups
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Manage your data storage and cleanup options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions are permanent and cannot be undone. Please be careful when deleting data.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg border-destructive/50">
              <h3 className="font-semibold text-destructive mb-2">Clear Cache</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Remove temporary files and cached data
              </p>
              <Button variant="outline" size="sm">
                Clear Cache (125 KB)
              </Button>
            </div>

            <div className="p-4 border rounded-lg border-destructive/50">
              <h3 className="font-semibold text-destructive mb-2">Delete Old Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Remove data older than 2 years
              </p>
              <Button variant="outline" size="sm">
                Delete Old Data
              </Button>
            </div>
          </div>

          <Separator />

          <div className="p-4 border rounded-lg border-destructive">
            <h3 className="font-semibold text-destructive mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your account and all associated data
            </p>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Data</span>
          </CardTitle>
          <CardDescription>
            Import data from other portfolio tracking services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'CSV Files', description: 'Generic CSV format', icon: FileText },
              { name: 'Quicken', description: 'Quicken data files', icon: Database },
              { name: 'Mint', description: 'Mint.com exports', icon: Cloud }
            ].map((service, index) => (
              <div key={index} className="p-4 border rounded-lg text-center">
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Import
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}