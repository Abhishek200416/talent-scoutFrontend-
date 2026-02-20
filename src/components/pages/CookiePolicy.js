import React from 'react';
import { Cookie, Eye, Shield, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function CookiePolicy() {
  const [preferences, setPreferences] = React.useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: February 2026</p>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="h-5 w-5" />
                <span>What Are Cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Cookies are small text files stored on your device when you visit websites. They help us provide a better experience by remembering your preferences and analyzing usage patterns.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="necessary" className="font-semibold">Necessary Cookies</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Essential for platform functionality. Cannot be disabled.</p>
                  <p className="text-xs text-muted-foreground">Examples: Authentication, security, session management</p>
                </div>
                <Switch id="necessary" checked={preferences.necessary} disabled />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <Label htmlFor="functional" className="font-semibold">Functional Cookies</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Remember your preferences and settings.</p>
                  <p className="text-xs text-muted-foreground">Examples: Theme preference, language, layout</p>
                </div>
                <Switch 
                  id="functional" 
                  checked={preferences.functional}
                  onCheckedChange={(checked) => setPreferences({...preferences, functional: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <Label htmlFor="analytics" className="font-semibold">Analytics Cookies</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Help us understand how you use the platform.</p>
                  <p className="text-xs text-muted-foreground">Examples: Page views, session duration, click tracking</p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <Cookie className="h-4 w-4 text-primary" />
                    <Label htmlFor="marketing" className="font-semibold">Marketing Cookies</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Used to show relevant advertisements.</p>
                  <p className="text-xs text-muted-foreground">Examples: Ad targeting, campaign tracking</p>
                </div>
                <Switch 
                  id="marketing" 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Duration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Session Cookies:</strong> Deleted when you close your browser</p>
              <p><strong>Persistent Cookies:</strong> Remain for specified duration (up to 1 year)</p>
              <p><strong>Third-Party Cookies:</strong> Set by external services (Google Analytics, etc.)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>You can control cookies through:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Browser settings (delete or block cookies)</li>
                <li>Our cookie preferences tool above</li>
                <li>Privacy settings in your account</li>
              </ul>
              <p className="mt-3 text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> Disabling necessary cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6 text-sm">
              <p className="mb-2"><strong>Questions about cookies?</strong></p>
              <p className="text-muted-foreground">Contact us at: <span className="text-primary font-semibold">cookies@talentscout.com</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}