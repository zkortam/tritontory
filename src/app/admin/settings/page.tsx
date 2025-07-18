"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { SettingsService } from "@/lib/firebase-service";
import { Settings as SettingsType } from "@/lib/models";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsType>({
    siteName: "Triton Tory Media",
    siteDescription: "The comprehensive voice of UC San Diego",
    contactEmail: "contact@tritontory.com",
    maxFileSize: "10",
    enableComments: true,
    requireApproval: true,
    autoPublish: false,
    newContentAlerts: true,
    errorNotifications: true,
    weeklyReports: false,
    version: "1.0.0",
    lastUpdated: new Date(),
    status: "Online"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log("Fetching settings from Firebase...");
      const fetchedSettings = await SettingsService.getSettings();
      console.log("Fetched settings:", fetchedSettings);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to fetch settings from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      console.log("Saving settings to Firebase...");
      await SettingsService.saveSettings(settings);
      console.log("Settings saved successfully");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400">Configure system settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saved && (
        <Alert className="bg-green-900/50 border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Configure content creation and publishing rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Comments</Label>
                <p className="text-sm text-gray-400">Allow users to comment on articles</p>
              </div>
              <Button
                variant={settings.enableComments ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, enableComments: !prev.enableComments }))}
              >
                {settings.enableComments ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Approval</Label>
                <p className="text-sm text-gray-400">Content must be approved before publishing</p>
              </div>
              <Button
                variant={settings.requireApproval ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, requireApproval: !prev.requireApproval }))}
              >
                {settings.requireApproval ? "Required" : "Optional"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-400">Require 2FA for admin accounts</p>
              </div>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Coming Soon
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
              </div>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Coming Soon
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Whitelist</Label>
                <p className="text-sm text-gray-400">Restrict admin access to specific IPs</p>
              </div>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Coming Soon
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure email and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Content Alerts</Label>
                <p className="text-sm text-gray-400">Notify admins of new submissions</p>
              </div>
              <Button
                variant={settings.newContentAlerts ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, newContentAlerts: !prev.newContentAlerts }))}
              >
                {settings.newContentAlerts ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Error Notifications</Label>
                <p className="text-sm text-gray-400">Alert on system errors</p>
              </div>
              <Button
                variant={settings.errorNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, errorNotifications: !prev.errorNotifications }))}
              >
                {settings.errorNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-gray-400">Send weekly activity summaries</p>
              </div>
              <Button
                variant={settings.weeklyReports ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, weeklyReports: !prev.weeklyReports }))}
              >
                {settings.weeklyReports ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and version information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Version</p>
              <p className="font-medium">{settings.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="font-medium">{formatDate(settings.lastUpdated)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <Badge className="bg-green-500">{settings.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 