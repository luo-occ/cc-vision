'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Mail, 
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function PrivacySecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const securitySettings = {
    lastPasswordChange: '2024-01-15',
    twoFactorMethod: 'SMS',
    activeSessions: 3,
    lastLogin: '2024-01-20 14:30'
  };

  const handleEnable2FA = () => {
    console.log('Enabling 2FA...');
  };

  const handleChangePassword = () => {
    console.log('Changing password...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Privacy & Security</h2>
          <p className="text-muted-foreground">
            Manage your privacy settings and security options
          </p>
        </div>
        <Button>
          Save Security Settings
        </Button>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
          <CardDescription>
            Overview of your current security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Strong Password</div>
                <div className="text-sm text-muted-foreground">Last changed 30 days ago</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              {twoFactorEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Login Notifications</div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Active Sessions</div>
                <div className="text-sm text-muted-foreground">{securitySettings.activeSessions} devices</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Password Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Password Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Last password change: {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
            </div>

            <Button onClick={handleChangePassword} className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Two-Factor Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable 2FA</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            {twoFactorEnabled ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled via {securitySettings.twoFactorMethod}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>Authentication Method</Label>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">SMS</Badge>
                    <Badge variant="outline">Authenticator App</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Change 2FA Method
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is currently disabled. Enable it to protect your account.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleEnable2FA} className="w-full">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing of anonymous usage data to improve the service
              </p>
            </div>
            <Switch
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics & Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by collecting usage analytics
              </p>
            </div>
            <Switch
              checked={analyticsEnabled}
              onCheckedChange={setAnalyticsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">iPhone 14 Pro</div>
                  <div className="text-sm text-muted-foreground">
                    Safari • New York, NY • Current session
                  </div>
                </div>
              </div>
              <Badge variant="secondary">Current</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Fingerprint className="h-4 w-4" />
                <div>
                  <div className="font-medium">MacBook Pro</div>
                  <div className="text-sm text-muted-foreground">
                    Chrome • San Francisco, CA • 2 hours ago
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <div>
                  <div className="font-medium">Web Browser</div>
                  <div className="text-sm text-muted-foreground">
                    Firefox • Los Angeles, CA • 1 day ago
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              Log Out All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}