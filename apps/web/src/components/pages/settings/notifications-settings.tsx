'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Globe, AlertTriangle, TrendingUp, DollarSign, Shield } from 'lucide-react';

export function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    portfolioUpdates: true,
    marketAlerts: true,
    accountStatements: true,
    securityAlerts: true,
    weeklySummary: false,
    marketingEmails: false
  });

  const [pushNotifications, setPushNotifications] = useState({
    priceAlerts: true,
    portfolioChanges: true,
    marketNews: false,
    accountActivity: true
  });

  const [notificationFrequency, setNotificationFrequency] = useState('realtime');

  const handleEmailToggle = (type: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handlePushToggle = (type: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSave = () => {
    console.log('Saving notification settings:', { emailNotifications, pushNotifications, notificationFrequency });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground">
            Configure how and when you receive notifications
          </p>
        </div>
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Notifications</span>
            </CardTitle>
            <CardDescription>
              Choose which email notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="portfolio-updates" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Portfolio Updates</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Daily portfolio performance summaries
                </p>
              </div>
              <Switch
                id="portfolio-updates"
                checked={emailNotifications.portfolioUpdates}
                onCheckedChange={() => handleEmailToggle('portfolioUpdates')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="market-alerts" className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Market Alerts</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Significant market movements and news
                </p>
              </div>
              <Switch
                id="market-alerts"
                checked={emailNotifications.marketAlerts}
                onCheckedChange={() => handleEmailToggle('marketAlerts')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="account-statements" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Account Statements</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Monthly account statements and reports
                </p>
              </div>
              <Switch
                id="account-statements"
                checked={emailNotifications.accountStatements}
                onCheckedChange={() => handleEmailToggle('accountStatements')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-alerts" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Alerts</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Important security and login notifications
                </p>
              </div>
              <Switch
                id="security-alerts"
                checked={emailNotifications.securityAlerts}
                onCheckedChange={() => handleEmailToggle('securityAlerts')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summary">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly portfolio performance recap
                </p>
              </div>
              <Switch
                id="weekly-summary"
                checked={emailNotifications.weeklySummary}
                onCheckedChange={() => handleEmailToggle('weeklySummary')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates and promotional content
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={emailNotifications.marketingEmails}
                onCheckedChange={() => handleEmailToggle('marketingEmails')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Push Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure mobile app and browser notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  When assets hit your target prices
                </p>
              </div>
              <Switch
                id="price-alerts"
                checked={pushNotifications.priceAlerts}
                onCheckedChange={() => handlePushToggle('priceAlerts')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="portfolio-changes">Portfolio Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Significant changes to your portfolio
                </p>
              </div>
              <Switch
                id="portfolio-changes"
                checked={pushNotifications.portfolioChanges}
                onCheckedChange={() => handlePushToggle('portfolioChanges')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="market-news">Market News</Label>
                <p className="text-sm text-muted-foreground">
                  Breaking financial news and updates
                </p>
              </div>
              <Switch
                id="market-news"
                checked={pushNotifications.marketNews}
                onCheckedChange={() => handlePushToggle('marketNews')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="account-activity">Account Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Login and transaction notifications
                </p>
              </div>
              <Switch
                id="account-activity"
                checked={pushNotifications.accountActivity}
                onCheckedChange={() => handlePushToggle('accountActivity')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Notification Frequency</span>
          </CardTitle>
          <CardDescription>
            Choose how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { value: 'realtime', label: 'Real-time', description: 'Instant notifications' },
              { value: 'hourly', label: 'Hourly', description: 'Batched hourly' },
              { value: 'daily', label: 'Daily', description: 'Once per day' },
              { value: 'weekly', label: 'Weekly', description: 'Weekly digest' }
            ].map((option) => (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  notificationFrequency === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setNotificationFrequency(option.value)}
              >
                <div className="font-semibold mb-1">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
                {notificationFrequency === option.value && (
                  <Badge className="mt-2">Active</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="quiet-hours" />
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Currently disabled
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}