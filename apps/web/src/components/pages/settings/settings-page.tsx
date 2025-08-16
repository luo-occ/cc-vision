'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, Palette, Database, Building2 } from 'lucide-react';
import { AccountsSettings } from './accounts-settings';
import { ProfileSettings } from './profile-settings';
import { NotificationsSettings } from './notifications-settings';
import { PrivacySecuritySettings } from './privacy-security-settings';
import { AppearanceSettings } from './appearance-settings';
import { DataExportSettings } from './data-export-settings';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const settingsCategories = [
    {
      icon: <Building2 className="h-5 w-5" />,
      title: 'Accounts',
      description: 'Manage your investment and savings accounts',
      action: 'Manage Accounts',
      section: 'accounts'
    },
    {
      icon: <User className="h-5 w-5" />,
      title: 'Profile',
      description: 'Manage your account and personal information',
      action: 'Manage Profile',
      section: 'profile'
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Notifications',
      description: 'Configure email and push notification preferences',
      action: 'Configure',
      section: 'notifications'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Privacy & Security',
      description: 'Control your privacy settings and security options',
      action: 'Review Settings',
      section: 'privacy'
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: 'Appearance',
      description: 'Customize theme, layout, and display preferences',
      action: 'Customize',
      section: 'appearance'
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Data & Export',
      description: 'Export your portfolio data and manage backups',
      action: 'Manage Data',
      section: 'data'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-6 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Show Settings Categories only when overview is active */}
        {activeSection === 'overview' && (
          <>
            {/* Settings Categories */}
            <div className="grid gap-6 md:grid-cols-2">
              {settingsCategories.map((category, index) => (
                <Card 
                  key={index} 
                  className="transition-colors hover:bg-muted/50"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {category.icon}
                      </div>
                      <span>{category.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSection(category.section)}
                    >
                      {category.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Settings */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSection('appearance')}
                  >
                    Toggle
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Currency</h3>
                    <p className="text-sm text-muted-foreground">
                      USD - United States Dollar
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSection('profile')}
                  >
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Email and push notifications
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSection('notifications')}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>About Portfolio Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Support:</strong> support@portfoliotracker.com</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show Active Section when not overview */}
        {activeSection !== 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveSection('overview')}
              >
                ← Back to Settings
              </Button>
            </div>
            
            {activeSection === 'accounts' && <AccountsSettings />}
            {activeSection === 'profile' && <ProfileSettings />}
            {activeSection === 'notifications' && <NotificationsSettings />}
            {activeSection === 'privacy' && <PrivacySecuritySettings />}
            {activeSection === 'appearance' && <AppearanceSettings />}
            {activeSection === 'data' && <DataExportSettings />}
          </div>
        )}
      </div>
    </div>
  );
}