'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // General settings state
  const [organizationName, setOrganizationName] = useState('Kogase Organization');
  const [supportEmail, setSupportEmail] = useState('support@kogase.com');
  const [timezone, setTimezone] = useState('UTC');

  // Security settings state
  const [requireMfa, setRequireMfa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [passwordRotation, setPasswordRotation] = useState('90');

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);

  // API settings state
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState('60');
  const [defaultQuota, setDefaultQuota] = useState('10000');

  // Common timezones
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time, UTC-5)' },
    { value: 'EDT', label: 'EDT (Eastern Daylight Time, UTC-4)' },
    { value: 'CST', label: 'CST (Central Standard Time, UTC-6)' },
    { value: 'CDT', label: 'CDT (Central Daylight Time, UTC-5)' },
    { value: 'MST', label: 'MST (Mountain Standard Time, UTC-7)' },
    { value: 'MDT', label: 'MDT (Mountain Daylight Time, UTC-6)' },
    { value: 'PST', label: 'PST (Pacific Standard Time, UTC-8)' },
    { value: 'PDT', label: 'PDT (Pacific Daylight Time, UTC-7)' },
    { value: 'CET', label: 'CET (Central European Time, UTC+1)' },
    { value: 'CEST', label: 'CEST (Central European Summer Time, UTC+2)' },
    { value: 'JST', label: 'JST (Japan Standard Time, UTC+9)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time, UTC+10)' },
    { value: 'AEDT', label: 'AEDT (Australian Eastern Daylight Time, UTC+11)' },
  ];

  // Handle form submission
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application and organization settings
          </p>
        </div>
      </div>
      <Separator />
    
      <Tabs 
        defaultValue="general" 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic organization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="organization-name">Organization Name</Label>
                <Input
                  id="organization-name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Timezone used for reporting and analytics
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mfa">Require MFA</Label>
                  <p className="text-sm text-muted-foreground">
                    Require multi-factor authentication for all users
                  </p>
                </div>
                <Switch
                  id="mfa"
                  checked={requireMfa}
                  onCheckedChange={setRequireMfa}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Amount of idle time before a user is logged out
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password-rotation">Password Rotation (days)</Label>
                <Input
                  id="password-rotation"
                  type="number"
                  value={passwordRotation}
                  onChange={(e) => setPasswordRotation(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  How often users must change their passwords
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API limits and quotas for your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of API requests per minute
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="default-quota">Default Quota</Label>
                <Input
                  id="default-quota"
                  type="number"
                  value={defaultQuota}
                  onChange={(e) => setDefaultQuota(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Default monthly event quota for new projects
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Make API documentation publicly accessible
                  </p>
                </div>
                <Switch
                  id="public-docs"
                  defaultChecked={true}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}