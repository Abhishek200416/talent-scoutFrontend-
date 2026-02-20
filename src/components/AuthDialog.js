import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, Mail, Lock, CheckCircle, RefreshCw, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import api from '../utils/api';

export function AuthDialog({ open, onOpenChange, setUser }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login');
  const [otpStep, setOtpStep] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({ email: '', name: '', otp: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [hasPassword, setHasPassword] = useState(null);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const cooldownRef = useRef(null);

  const startCooldown = useCallback((seconds = 30) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => { return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }; }, []);

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.resendOTP(formData.email);
      toast.success('New OTP sent! Check your inbox & spam folder.');
      startCooldown(30);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to resend OTP';
      toast.error(detail);
      if (err.response?.status === 429) {
        const waitMatch = detail.match(/(\d+)/);
        if (waitMatch) startCooldown(parseInt(waitMatch[1]));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }
    setLoading(true);
    try {
      await api.register({ email: formData.email, name: formData.name, role: selectedRole });
      toast.success('OTP sent to your email! Check inbox & spam folder.');
      setOtpStep(true);
      startCooldown(30);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }
    
    // If password login method is selected and user has password
    if (loginMethod === 'password' && hasPassword) {
      handlePasswordLogin();
      return;
    }
    
    // OTP login
    setLoading(true);
    try {
      await api.register({ email: formData.email, name: formData.name || 'User', role: selectedRole });
      toast.success('OTP sent to your email! Check inbox & spam folder.');
      setOtpStep(true);
      startCooldown(30);
    } catch (error) {
      if (error.response?.data?.detail?.includes('already registered')) {
        toast.success('OTP sent to your email!');
        setOtpStep(true);
        startCooldown(30);
      } else {
        toast.error(error.response?.data?.detail || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!formData.password) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      const response = await api.loginWithPassword(formData.email, formData.password);
      const userData = {
        email: response.data.email,
        name: response.data.name,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Login successful!');
      onOpenChange(false);
      navigate(response.data.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStatus = async (email) => {
    if (!email || !email.includes('@')) return;
    setCheckingPassword(true);
    try {
      const res = await api.checkPasswordSet(email);
      setHasPassword(res.data.has_password);
    } catch (err) {
      setHasPassword(false);
    } finally {
      setCheckingPassword(false);
    }
  };

  // Check password status when email changes (for login mode)
  useEffect(() => {
    if (authMode === 'login' && formData.email && formData.email.includes('@')) {
      const timer = setTimeout(() => {
        checkPasswordStatus(formData.email);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.email, authMode]);

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await api.verifyOTP({ email: formData.email, otp: formData.otp });
      const userData = { 
        email: formData.email, 
        name: response.data.name || formData.name || 'User', 
        role: response.data.role || selectedRole, 
        token: response.data.token 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Welcome to Talent Scout! 🎉');
      onOpenChange(false);
      navigate(selectedRole === 'candidate' ? '/candidate' : '/recruiter');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', name: '', otp: '' });
    setOtpStep(false);
    setSelectedRole('');
    setResendCooldown(0);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetForm(); }}>
      <DialogContent className="sm:max-w-[500px]" data-testid="auth-dialog">
        {!otpStep ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to Talent Scout</DialogTitle>
              <DialogDescription>
                {authMode === 'login' ? 'Login to your account' : 'Create your free account'}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v); resetForm(); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="auth-tab-login">Login</TabsTrigger>
                <TabsTrigger value="signup" data-testid="auth-tab-signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedRole === 'candidate' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('candidate')}
                      className="h-16 flex-col"
                      data-testid="role-candidate-btn"
                    >
                      <Users className="h-5 w-5 mb-1" />
                      <span className="text-xs">Candidate</span>
                    </Button>
                    <Button
                      variant={selectedRole === 'recruiter' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('recruiter')}
                      className="h-16 flex-col"
                      data-testid="role-recruiter-btn"
                    >
                      <Shield className="h-5 w-5 mb-1" />
                      <span className="text-xs">Recruiter</span>
                    </Button>
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                      data-testid="login-email-input"
                    />
                    {checkingPassword && (
                      <p className="text-xs text-muted-foreground mt-1">Checking login options...</p>
                    )}
                  </div>

                  {/* Login Method Selection - Show if user has password set */}
                  {hasPassword && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
                      <Label className="text-xs font-semibold mb-2 block">Choose Login Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={loginMethod === 'password' ? 'default' : 'outline'}
                          onClick={() => setLoginMethod('password')}
                          size="sm"
                          className="text-xs"
                          data-testid="login-method-password"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Password
                        </Button>
                        <Button
                          type="button"
                          variant={loginMethod === 'otp' ? 'default' : 'outline'}
                          onClick={() => setLoginMethod('otp')}
                          size="sm"
                          className="text-xs"
                          data-testid="login-method-otp"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          OTP Email
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Password Input - Show only if password method selected */}
                  {loginMethod === 'password' && hasPassword && (
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1"
                        data-testid="login-password-input"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Forgot password? Go to Settings after OTP login to reset.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleLogin}
                    disabled={loading || !formData.email || !selectedRole}
                    className="w-full"
                    data-testid="login-submit-btn"
                  >
                    {loading ? (
                      loginMethod === 'password' ? 'Logging in...' : 'Sending OTP...'
                    ) : (
                      loginMethod === 'password' && hasPassword ? 'Login with Password' : 'Send Login OTP'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Don't have an account? Switch to Sign Up tab
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedRole === 'candidate' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('candidate')}
                      className="h-16 flex-col"
                      data-testid="signup-role-candidate-btn"
                    >
                      <Users className="h-5 w-5 mb-1" />
                      <span className="text-xs">Candidate</span>
                    </Button>
                    <Button
                      variant={selectedRole === 'recruiter' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('recruiter')}
                      className="h-16 flex-col"
                      data-testid="signup-role-recruiter-btn"
                    >
                      <Shield className="h-5 w-5 mb-1" />
                      <span className="text-xs">Recruiter</span>
                    </Button>
                  </div>

                  <div>
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                      data-testid="signup-name-input"
                    />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                      data-testid="signup-email-input"
                    />
                  </div>

                  <Button
                    onClick={handleSignup}
                    disabled={loading || !formData.email || !formData.name || !selectedRole}
                    className="w-full"
                    data-testid="signup-submit-btn"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Already have an account? Switch to Login tab
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Verify Your Email</DialogTitle>
              <DialogDescription>
                We've sent a 6-digit OTP to <strong>{formData.email}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <span>Check your email inbox for the verification code</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label>Enter OTP</Label>
                <Input
                  placeholder="123456"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="mt-1 text-center text-2xl tracking-widest"
                  maxLength={6}
                  data-testid="otp-input"
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || formData.otp.length !== 6}
                className="w-full"
                data-testid="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={loading || resendCooldown > 0}
                  className="flex-1 gap-2"
                  data-testid="resend-otp-btn"
                >
                  {resendCooldown > 0 ? (
                    <><Timer className="h-4 w-4" />Resend in {resendCooldown}s</>
                  ) : (
                    <><RefreshCw className="h-4 w-4" />Resend OTP</>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the code? Check your <strong>spam/junk</strong> folder.
              </p>

              <Button
                variant="ghost"
                onClick={() => { setOtpStep(false); setResendCooldown(0); if (cooldownRef.current) clearInterval(cooldownRef.current); }}
                className="w-full"
                data-testid="back-to-auth-btn"
              >
                Back to {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}