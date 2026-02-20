import React, { useState, useEffect } from 'react';
import { Shield, Bell, Lock, Eye, Globe, Trash2, Download, Key, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import api from '../../utils/api';

export default function Settings({ user }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: true,
    showEmail: false,
    twoFactorAuth: false,
    marketingEmails: false,
    analyticsTracking: true
  });

  const [hasPassword, setHasPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [settingPassword, setSettingPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem(`settings_${user.email}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    // Check if user has password set
    checkPasswordStatus();
  }, [user.email]);

  const checkPasswordStatus = async () => {
    try {
      const res = await api.checkPasswordSet(user.email);
      setHasPassword(res.data.has_password);
    } catch (err) {
      console.error('Failed to check password status', err);
    }
  };

  const handleSave = () => {
    localStorage.setItem(`settings_${user.email}`, JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleSetPassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSettingPassword(true);
    try {
      await api.setPassword(user.email, passwordForm.newPassword);
      toast.success(hasPassword ? 'Password updated successfully!' : 'Password set successfully! You can now login with password.');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setHasPassword(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set password');
    } finally {
      setSettingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    setSendingReset(true);
    try {
      await api.forgotPassword(resetEmail);
      toast.success('Reset code sent to your email!');
      setForgotPasswordMode(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setSendingReset(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetOtp || resetOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setResettingPassword(true);
    try {
      await api.resetPassword(resetEmail, resetOtp, passwordForm.newPassword);
      toast.success('Password reset successfully!');
      setForgotPasswordMode(false);
      setResetOtp('');
      setResetEmail('');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setHasPassword(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: user,
      settings: settings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent-scout-data-${user.email}.json`;
    a.click();
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not available in demo mode');
    }
  };

  return (
    <div className="py-2">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and privacy</p>
        </div>

        <div className="space-y-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="marketing">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive updates and promotions</p>
                </div>
                <Switch
                  id="marketing"
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, marketingEmails: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Privacy</span>
              </CardTitle>
              <CardDescription>
                Control your profile visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="profile-vis">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'candidate'
                      ? 'Allow recruiters to find your profile'
                      : 'Show your profile to candidates'}
                  </p>
                </div>
                <Switch
                  id="profile-vis"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, profileVisibility: checked })
                  }
                />
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-email">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">Display email on public profile</p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showEmail: checked })
                  }
                />
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.analyticsTracking}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, analyticsTracking: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Security & Password</span>
              </CardTitle>
              <CardDescription>
                Enhance your account security with password protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Status */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3 mb-3">
                  {hasPassword ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <Label className="text-sm font-medium">Password Protection Active</Label>
                        <p className="text-xs text-muted-foreground">You can login with email and password</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label className="text-sm font-medium">No Password Set</Label>
                        <p className="text-xs text-muted-foreground">Set a password for faster login</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <hr />

              {/* Set/Change Password Form */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {hasPassword ? 'Change Password' : 'Set Password'}
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">New Password (min 6 characters)</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      data-testid="new-password-input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      data-testid="confirm-password-input"
                    />
                  </div>
                  <Button
                    onClick={handleSetPassword}
                    disabled={settingPassword}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    data-testid="set-password-btn"
                  >
                    {settingPassword ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Setting Password...</>
                    ) : (
                      <><Key className="h-4 w-4 mr-2" />{hasPassword ? 'Update Password' : 'Set Password'}</>
                    )}
                  </Button>
                </div>
              </div>

              <hr />

              {/* Forgot Password */}
              {hasPassword && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Forgot Password?
                  </Label>
                  <p className="text-xs text-muted-foreground">Reset your password via email verification</p>
                  
                  {!forgotPasswordMode ? (
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        defaultValue={user.email}
                        data-testid="reset-email-input"
                      />
                      <Button
                        onClick={handleForgotPassword}
                        disabled={sendingReset}
                        variant="outline"
                        className="w-full"
                        data-testid="send-reset-code-btn"
                      >
                        {sendingReset ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending Code...</>
                        ) : (
                          'Send Reset Code'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-800 dark:text-orange-200">Check your email for the 6-digit reset code</p>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        data-testid="reset-otp-input"
                      />
                      <div>
                        <Label className="text-xs">New Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          data-testid="reset-new-password-input"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Confirm Password</Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          data-testid="reset-confirm-password-input"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleResetPassword}
                          disabled={resettingPassword}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
                          data-testid="reset-password-btn"
                        >
                          {resettingPassword ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Resetting...</>
                          ) : (
                            'Reset Password'
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setForgotPasswordMode(false);
                            setResetOtp('');
                            setResetEmail('');
                            setPasswordForm({ newPassword: '', confirmPassword: '' });
                          }}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Export Your Data</Label>
                  <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
                </div>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <hr />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Delete Account</Label>
                  <p className="text-sm text-muted-foreground text-red-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button onClick={handleDeleteAccount} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave} className="gradient-primary">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}