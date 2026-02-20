import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Briefcase, Search, Shield, LogOut, Mail, Eye, FileCheck, Brain,
  Loader2, Users, Settings as SettingsIcon, CheckCircle, Building2,
  Phone, MapPin, Globe, User, Star, GraduationCap,
  X, Award, FileText, Video, BarChart2, Sparkles, Home,
  Filter, Send, MessageSquare, Linkedin, Github, Image, ChevronRight,
  Edit2, Lock, Timer, RefreshCw, Download, Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationBell } from '../common/NotificationBell';
import Settings from '../pages/Settings';
import { toast } from 'sonner';
import api from '../../utils/api';
import { INDIA_STATES, getCitiesForState } from '../../utils/indiaLocations';

// ---- Recruiter Profile Completion Gate ----
const RECRUITER_REQUIRED_FIELDS = [
  { key: 'name',             label: 'Full Name' },
  { key: 'company_name',     label: 'Company Name' },
  { key: 'designation',      label: 'Your Designation / Role' },
  { key: 'mobile',           label: 'Mobile Number' },
  { key: 'company_location', label: 'Company Location' },
];

function RecruiterProfileGate({ user, profileData, location }) {
  const profilePath = '/recruiter/profile';
  const isOnProfile = location.pathname.includes('/profile');
  const missing = RECRUITER_REQUIRED_FIELDS.filter(f => !profileData || !profileData[f.key] || String(profileData[f.key]).trim().length < 2);
  const completePct = Math.round(((RECRUITER_REQUIRED_FIELDS.length - missing.length) / RECRUITER_REQUIRED_FIELDS.length) * 100);
  if (missing.length === 0 || isOnProfile) return null;
  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border-2 border-blue-500/30 shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5">
          <Briefcase className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Set Up Your Recruiter Profile</h2>
        <p className="text-muted-foreground text-sm mb-5">Complete your recruiter profile before posting jobs or searching for candidates.</p>
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Completion</span>
            <span className="font-bold text-blue-600">{completePct}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: completePct + '%' }} />
          </div>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 text-left mb-6 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Still needed:</p>
          {missing.map(f => <div key={f.key} className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />{f.label}</div>)}
        </div>
        <Link to={profilePath}>
          <Button className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600">
            Complete My Profile <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---- Recruiter Profile ----
function RecruiterProfilePage({ user, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    email: user.email,
    name: user.name || '',
    company_name: '',
    mobile: '',
    designation: '',
    company_website: '',
    company_location: '',
    country: 'India',
    state: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeStep, setEmailChangeStep] = useState('input');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const fetchProfile = useCallback(async function() {
    try {
      const res = await api.getRecruiterProfile(user.email);
      setProfile(function(prev) { return Object.assign({}, prev, res.data); });
    } catch {}
    finally { setLoading(false); }
  }, [user.email]);

  useEffect(function() {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async function() {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    // Build company_location from state/city
    const locationStr = [profile.city, profile.state, 'India'].filter(Boolean).join(', ');
    setSaving(true);
    try {
      await api.createRecruiterProfile({ ...profile, company_location: profile.company_location || locationStr });
      toast.success('Profile saved!');
      if (onProfileUpdated) onProfileUpdated(profile.name);
      fetchProfile();
    } catch (err) {
      toast.error(err.response ? err.response.data.detail : 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) { toast.error('Enter a valid email'); return; }
    setEmailChangeLoading(true);
    try {
      await api.requestEmailChange(user.email, newEmail);
      toast.success('OTP sent to your new email! Check inbox & spam.');
      setEmailChangeStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    } finally { setEmailChangeLoading(false); }
  };

  const handleVerifyEmailChange = async () => {
    if (emailOtp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setEmailChangeLoading(true);
    try {
      const res = await api.verifyEmailChange(user.email, emailOtp);
      toast.success('Email changed successfully!');
      const updatedUser = { ...user, email: res.data.new_email, token: res.data.token };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowEmailChange(false);
      setEmailChangeStep('input');
      setNewEmail('');
      setEmailOtp('');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
    } finally { setEmailChangeLoading(false); }
  };

  const availableCities = getCitiesForState(profile.state);
  const setField = (key) => (e) => setProfile(p => ({ ...p, [key]: e.target ? e.target.value : e }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.name || 'Your Name'}</h2>
              <p className="text-white/80">{profile.company_name || 'Your Company'}</p>
              {profile.designation && <p className="text-white/60 text-sm">{profile.designation}</p>}
              {(profile.city || profile.state) && (
                <p className="text-white/50 text-xs mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{[profile.city, profile.state].filter(Boolean).join(', ')}, India</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 space-y-8">
          {/* Email Section */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />Email Address
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span data-testid="recruiter-profile-email">{user.email}</span>
                <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmailChange(!showEmailChange)} data-testid="recruiter-change-email-btn" className="gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />Change
              </Button>
            </div>
            {showEmailChange && (
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 space-y-3">
                {emailChangeStep === 'input' ? (
                  <>
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2"><Lock className="h-4 w-4" />Enter your new email. We'll send a verification OTP.</p>
                    <div className="flex gap-2">
                      <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" className="flex-1" data-testid="recruiter-new-email-input" />
                      <Button onClick={handleRequestEmailChange} disabled={emailChangeLoading} data-testid="recruiter-send-email-otp-btn">
                        {emailChangeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2"><Mail className="h-4 w-4" />OTP sent to <strong>{newEmail}</strong>. Check inbox & spam.</p>
                    <div className="flex gap-2">
                      <Input value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="Enter 6-digit OTP" maxLength={6} className="flex-1 text-center text-lg tracking-widest" data-testid="recruiter-email-change-otp" />
                      <Button onClick={handleVerifyEmailChange} disabled={emailChangeLoading || emailOtp.length !== 6} data-testid="recruiter-verify-email-btn">
                        {emailChangeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEmailChangeStep('input'); setEmailOtp(''); }}>Back</Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm">Full Name <span className="text-red-500">*</span></Label>
                <Input value={profile.name} onChange={setField('name')} placeholder="Your full name" data-testid="recruiter-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />Mobile <span className="text-red-500">*</span></Label>
                <Input value={profile.mobile} onChange={setField('mobile')} placeholder="+91 9876543210" data-testid="recruiter-mobile" />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> Company Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm">Company Name <span className="text-red-500">*</span></Label>
                <Input value={profile.company_name} onChange={setField('company_name')} placeholder="Acme Corp" data-testid="recruiter-company" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Designation <span className="text-red-500">*</span></Label>
                <Input value={profile.designation} onChange={setField('designation')} placeholder="HR Manager / Recruiter" data-testid="recruiter-designation" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1"><Globe className="h-3 w-3 text-muted-foreground" />Company Website</Label>
                <Input value={profile.company_website} onChange={setField('company_website')} placeholder="https://company.com" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Company Location
            </h3>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm">Country</Label>
                <div className="px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" /><span>India</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">State <span className="text-red-500">*</span></Label>
                <Select key={`state-${profile.state}`} value={profile.state} onValueChange={v => setProfile(p => ({ ...p, state: v, city: '' }))}>
                  <SelectTrigger data-testid="recruiter-state">
                    <SelectValue placeholder="Select State">{profile.state || "Select State"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">City <span className="text-red-500">*</span></Label>
                <Select key={`city-${profile.city}-${profile.state}`} value={profile.city} onValueChange={v => setProfile(p => ({ ...p, city: v }))} disabled={!profile.state}>
                  <SelectTrigger data-testid="recruiter-city">
                    <SelectValue placeholder={profile.state ? "Select City" : "Select state first"}>{profile.city || (profile.state ? "Select City" : "Select state first")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-base" data-testid="recruiter-save-profile">
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Save Profile</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ---- Job Posting ----
function JobPosting({ user }) {
  const [job, setJob] = useState({ recruiter_email: user.email, title: '', description: '', required_skills: '', talent_category: '', company_name: '', location: '', salary_range: '' });
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = useCallback(function() {
    Promise.all([
      api.getRecruiterJobs(user.email),
      api.getRecruiterProfile(user.email).catch(function() { return null; })
    ]).then(function(results) {
      setJobs(results[0].data);
      if (results[1]) {
        setJob(function(prev) { return Object.assign({}, prev, {company_name: results[1].data.company_name || ''}); });
      }
    }).catch(function() {});
  }, [user.email]);

  useEffect(function() { fetchData(); }, [fetchData]);

  const handleDocumentUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB');
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, PNG, JPG, or DOC');
      return;
    }

    setUploadingDoc(true);
    toast.info('Analyzing job document... This may take 10-15 seconds');

    try {
      const res = await api.parseJobDocument(user.email, file);
      const jobData = res.data.job_data;

      if (jobData.error) {
        toast.error('Could not parse job document: ' + jobData.error);
        return;
      }

      // Auto-fill form with extracted data
      setJob(function(prev) {
        return Object.assign({}, prev, {
          title: jobData.title || prev.title,
          company_name: jobData.company_name || prev.company_name,
          location: jobData.location || prev.location,
          salary_range: jobData.salary_range || prev.salary_range,
          talent_category: jobData.talent_category || prev.talent_category,
          required_skills: Array.isArray(jobData.required_skills) ? jobData.required_skills.join(', ') : (jobData.required_skills || prev.required_skills),
          description: jobData.description || prev.description
        });
      });

      toast.success('Job document parsed successfully! Review and edit as needed.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to parse job document');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async function() {
    if (!job.title || !job.talent_category) { toast.error('Fill in job title and category'); return; }
    setLoading(true);
    try {
      await api.createJob(Object.assign({}, job, { required_skills: job.required_skills.split(',').map(function(s) { return s.trim(); }).filter(Boolean) }));
      toast.success('Job posted successfully!');
      setJob(function(prev) { return Object.assign({}, prev, {title: '', description: '', required_skills: '', location: '', salary_range: ''}); });
      fetchData();
    } catch (err) {
      toast.error(err.response ? err.response.data.detail : 'Failed to post job');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" /> Post a New Job
          </h2>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocumentUpload}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              style={{ display: 'none' }}
              data-testid="job-document-upload-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="upload-job-document-btn"
            >
              {uploadingDoc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Job Document
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          You can manually fill the form below OR upload a job description document (PDF/DOC/Image, max 20MB) and AI will auto-fill the details for you!
        </p>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={job.title} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {title: e.target.value}); }); }} placeholder="Senior React Developer" />
            </div>
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={job.company_name} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {company_name: e.target.value}); }); }} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Talent Category *</Label>
              <Select value={job.talent_category} onValueChange={function(val) { setJob(function(p) { return Object.assign({}, p, {talent_category: val}); }); }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" />Location</Label>
              <Input value={job.location} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {location: e.target.value}); }); }} placeholder="Bangalore, India / Remote" />
            </div>
            <div className="space-y-2">
              <Label>Salary Range</Label>
              <Input value={job.salary_range} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {salary_range: e.target.value}); }); }} placeholder="10-20 LPA / $50K-80K" />
            </div>
            <div className="space-y-2">
              <Label>Required Skills (comma separated)</Label>
              <Input value={job.required_skills} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {required_skills: e.target.value}); }); }} placeholder="React, TypeScript, Node.js" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea value={job.description} onChange={function(e) { setJob(function(p) { return Object.assign({}, p, {description: e.target.value}); }); }} rows={5} placeholder="Describe the role, responsibilities, requirements, benefits..." />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Posting...</span>
            ) : (
              <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Post Job</span>
            )}
          </Button>
        </div>
      </Card>

      {jobs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Posted Jobs <Badge variant="secondary">{jobs.length}</Badge></h3>
          <div className="space-y-3">
            {jobs.map(function(j) {
              return (
                <Card key={j.job_id} className="p-4 feature-card">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{j.title}</h4>
                        <Badge variant={j.status === 'active' ? 'default' : 'secondary'} className="text-xs">{j.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {j.company_name && (
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{j.company_name}</span>
                        )}
                        {j.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                        {j.salary_range && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{j.salary_range}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">{j.talent_category}</Badge>
                        {j.required_skills && j.required_skills.slice(0, 5).map(function(s, i) {
                          return <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>;
                        })}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Candidate Search ----
function CandidateSearch({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [jdMatches, setJdMatches] = useState([]);
  const [filters, setFilters] = useState({ talent_category: '', min_score: 0, skills: '' });
  const [loading, setLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [emailSending, setEmailSending] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('custom');

  const handleSearch = useCallback(async function() {
    setLoading(true);
    try {
      const params = {};
      if (filters.talent_category && filters.talent_category !== 'all') params.talent_category = filters.talent_category;
      if (filters.min_score > 0) params.min_score = filters.min_score;
      if (filters.skills) params.skills = filters.skills;
      const res = await api.searchCandidates(params);
      setCandidates(res.data);
      if (res.data.length === 0) toast.info('No candidates found with these filters');
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(function() {
    api.getRecruiterProfile(user.email).then(function(res) {
      setRecruiterProfile(res.data);
    }).catch(function() {});
    // Fetch recruiter jobs for JD dropdown
    api.getRecruiterJobs(user.email).then(function(res) {
      setRecruiterJobs(res.data || []);
    }).catch(function() {});
    handleSearch();
  }, [handleSearch, user.email]);

  // Escape key to close file viewer
  useEffect(function() {
    function handleEsc(e) { if (e.key === 'Escape' && viewingFile) setViewingFile(null); }
    window.addEventListener('keydown', handleEsc);
    return function() { window.removeEventListener('keydown', handleEsc); };
  }, [viewingFile]);

  const handleJobSelect = function(jobId) {
    setSelectedJobId(jobId);
    if (jobId === 'custom') {
      setJobDescription('');
    } else {
      const selectedJob = recruiterJobs.find(j => j.job_id === jobId);
      if (selectedJob) {
        const jdText = `Job Title: ${selectedJob.title}\n\nCompany: ${selectedJob.company_name || 'N/A'}\n\nLocation: ${selectedJob.location || 'N/A'}\n\nSalary: ${selectedJob.salary_range || 'N/A'}\n\nRequired Skills: ${(selectedJob.required_skills || []).join(', ')}\n\nCategory: ${selectedJob.talent_category}\n\nJob Description:\n${selectedJob.description}`;
        setJobDescription(jdText);
      }
    }
  };

  const handleJDMatch = async function() {
    if (!jobDescription.trim()) { toast.error('Please enter a job description'); return; }
    setJdLoading(true);
    try {
      const res = await api.matchJD({
        recruiter_email: user.email,
        job_description: jobDescription,
        min_score: filters.min_score
      });
      setJdMatches(res.data.matches || []);
      toast.success('Found ' + (res.data.matches ? res.data.matches.length : 0) + ' matching candidates!');
    } catch (err) {
      toast.error(err.response ? err.response.data.detail : 'JD matching failed');
    } finally {
      setJdLoading(false);
    }
  };

  const viewCandidate = async function(email) {
    setDetailLoading(true);
    setSelectedCandidate(email);
    try {
      const res = await api.getCandidateDetail(email);
      setCandidateDetail(res.data);
    } catch {
      toast.error('Failed to load candidate details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendEmail = async function() {
    if (!emailData.subject || !emailData.message) { toast.error('Fill all fields'); return; }
    setEmailSending(true);
    try {
      await api.emailCandidate({
        recruiter_email: user.email,
        recruiter_name: (recruiterProfile && recruiterProfile.name) || user.name,
        candidate_email: selectedCandidate,
        subject: emailData.subject,
        message: emailData.message
      });
      toast.success('Email sent to candidate!');
      setEmailModal(false);
      setEmailData({ subject: '', message: '' });
    } catch {
      toast.error('Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleVerifyCert = async function(hash) {
    try {
      const res = await api.checkBlockchain(hash);
      if (res.data.verified) toast.success('Certificate AUTHENTIC - verified on blockchain!');
      else toast.error('Certificate NOT found on blockchain');
    } catch {
      toast.error('Verification failed');
    }
  };

  const closeDialog = function() {
    setSelectedCandidate(null);
    setCandidateDetail(null);
    setEmailModal(false);
  };

  const displayCandidates = activeTab === 'jd-match'
    ? jdMatches.map(function(m) {
        return Object.assign({}, m.profile, { email: m.email, match_score: m.match_score, matching_skills: m.matching_skills, missing_skills: m.missing_skills, fit_level: m.fit_level });
      })
    : candidates;

  const getFitColorClass = function(level) {
    var map = { Excellent: 'text-green-600', Good: 'text-blue-600', Fair: 'text-yellow-600', Poor: 'text-red-600' };
    return map[level] || 'text-gray-600';
  };

  const getBarColor = function(score) {
    if (score >= 70) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (score >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        <button
          onClick={function() { setActiveTab('search'); }}
          className={'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ' + (activeTab === 'search' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          <Search className="h-4 w-4 inline mr-2" />Search Candidates
        </button>
        <button
          onClick={function() { setActiveTab('jd-match'); }}
          className={'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ' + (activeTab === 'jd-match' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          <Brain className="h-4 w-4 inline mr-2" />AI JD Matching
        </button>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filters</span>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <Select value={filters.talent_category} onValueChange={function(val) { setFilters(function(f) { return Object.assign({}, f, {talent_category: val}); }); }}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input value={filters.skills} onChange={function(e) { setFilters(function(f) { return Object.assign({}, f, {skills: e.target.value}); }); }} placeholder="Skills: React, Python..." />
          </div>
          <div>
            <Input type="number" value={filters.min_score} onChange={function(e) { setFilters(function(f) { return Object.assign({}, f, {min_score: parseFloat(e.target.value) || 0}); }); }} placeholder="Min Score" />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <span className="flex items-center gap-2"><Search className="h-4 w-4" />Search</span>
            )}
          </Button>
        </div>
      </Card>

      {/* JD Match Input */}
      {activeTab === 'jd-match' && (
        <Card className="p-5 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" /> AI Job Description Matching
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">Powered by Gemini AI</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Select a job from your postings or paste a custom job description. AI will find the best matching candidates with confidence scores.</p>
          
          {/* Job Selection Dropdown */}
          <div className="mb-4">
            <Label className="text-sm font-semibold mb-2 block">Select Job Source</Label>
            <Select value={selectedJobId} onValueChange={handleJobSelect}>
              <SelectTrigger className="bg-white dark:bg-gray-900">
                <SelectValue placeholder="Choose a job or enter custom JD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4" />
                    <span>Custom Job Description</span>
                  </div>
                </SelectItem>
                {recruiterJobs.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Your Posted Jobs</div>
                    {recruiterJobs.map(function(job) {
                      return (
                        <SelectItem key={job.job_id} value={job.job_id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{job.title}</span>
                            <span className="text-xs text-muted-foreground">{job.company_name} · {job.talent_category}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </>
                )}
              </SelectContent>
            </Select>
            {recruiterJobs.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">No jobs posted yet. Post jobs in the Job Posting tab or enter custom JD below.</p>
            )}
          </div>
          
          <Textarea
            value={jobDescription}
            onChange={function(e) { setJobDescription(e.target.value); }}
            rows={8}
            placeholder="Paste the complete job description here... Include required skills, qualifications, responsibilities, and any specific requirements."
            className={selectedJobId !== 'custom' ? 'bg-gray-50 dark:bg-gray-900' : ''}
          />
          <Button onClick={handleJDMatch} disabled={jdLoading} className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            {jdLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Analyzing and Matching...</span>
            ) : (
              <span className="flex items-center gap-2"><Brain className="h-4 w-4" />Find Best Matches with AI</span>
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {activeTab === 'jd-match' ? 'AI Matches' : 'Candidates'}
            <Badge variant="secondary" className="ml-2">{displayCandidates.length}</Badge>
          </h3>
        </div>

        {loading || jdLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-3">{jdLoading ? 'AI is analyzing and matching candidates...' : 'Searching...'}</p>
          </div>
        ) : displayCandidates.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-muted-foreground">No candidates found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'jd-match' ? 'Enter a job description above and click Find Matches' : 'Try adjusting your search filters'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {displayCandidates.map(function(c, idx) {
              return (
                <Card key={c.email || idx} className="p-5 cursor-pointer feature-card hover:border-primary/30 transition-all hover:shadow-md" onClick={function() { viewCandidate(c.email); }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {((c.name || c.email) || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{c.name || c.email}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{c.talent_category}</Badge>
                          {c.experience_years > 0 && <span className="text-xs text-muted-foreground">{c.experience_years}y exp</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {c.match_score !== undefined ? (
                        <div>
                          <div className={'text-3xl font-bold ' + getFitColorClass(c.fit_level)}>{c.match_score}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-primary">{c.talent_score || c.ai_score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {c.match_score !== undefined && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={'h-full rounded-full transition-all duration-700 ' + getBarColor(c.match_score)}
                          style={{ width: c.match_score + '%' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {c.matching_skills && c.matching_skills.map(function(s, i) {
                      return <Badge key={i} className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200">{s}</Badge>;
                    })}
                    {!c.matching_skills && c.skills && c.skills.map(function(s, i) {
                      return <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>;
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FILE VIEWER via Portal for proper z-index stacking ── */}
      {viewingFile && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/97 flex flex-col" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setViewingFile(null); } }}
          tabIndex={0}
          ref={(el) => el && el.focus()}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-black/80 border-b border-white/10 flex-shrink-0 backdrop-blur-sm" style={{ position: 'relative', zIndex: 100000 }}>
            <div className="flex items-center gap-3">
              {viewingFile.isVideo ? <Video className="h-4 w-4 text-red-400" /> : viewingFile.isImage ? <Image className="h-4 w-4 text-blue-400" /> : <FileText className="h-4 w-4 text-amber-400" />}
              <span className="text-white font-medium text-sm">{viewingFile.name}</span>
              <span className="text-white/40 text-xs">{viewingFile.isVideo ? 'Video' : viewingFile.isImage ? 'Image' : 'PDF'}</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={viewingFile.url} download target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-xs transition-all" data-testid="recruiter-file-download">
                <Eye className="h-3 w-3" />Download
              </a>
              <button onClick={(e) => { e.stopPropagation(); setViewingFile(null); }} data-testid="recruiter-file-close"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all">
                <X className="h-4 w-4" />Close Viewer
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-5" style={{ minHeight: 0, background: viewingFile.isPDF ? '#525659' : '#000' }}>
            {viewingFile.isVideo && (
              <video
                key={viewingFile.url + '_recruiter'}
                controls autoPlay playsInline
                style={{ width: '90%', maxWidth: '1200px', maxHeight: 'calc(100vh - 80px)', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
                data-testid="recruiter-video-player"
              >
                <source src={viewingFile.url} type="video/mp4" />
                <source src={viewingFile.url} type="video/webm" />
                Your browser does not support video.
              </video>
            )}
            {viewingFile.isImage && (
              <img src={viewingFile.url} alt={viewingFile.name}
                style={{ maxWidth: '95%', maxHeight: 'calc(100vh - 80px)', objectFit: 'contain', borderRadius: '8px' }}
              />
            )}
            {viewingFile.isPDF && (
              <div style={{ width: '100%', maxWidth: '900px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <object data={viewingFile.url} type="application/pdf"
                  style={{ width: '100%', flex: 1, display: 'block', border: 'none' }}
                  data-testid="recruiter-pdf-viewer">
                  <embed src={viewingFile.url} type="application/pdf"
                    style={{ width: '100%', height: '100%' }} />
                </object>
                <div style={{ padding: '12px 16px', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>If PDF doesn't display:</span>
                  <a href={viewingFile.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                    <Eye className="h-4 w-4" />Open PDF in New Tab
                  </a>
                </div>
              </div>
            )}
            {!viewingFile.isVideo && !viewingFile.isImage && !viewingFile.isPDF && (
              <div className="text-center text-white">
                <FileText className="h-20 w-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">{viewingFile.name}</p>
                <a href={viewingFile.url} target="_blank" rel="noopener noreferrer">
                  <Button>Open File in New Tab</Button>
                </a>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate && !viewingFile} onOpenChange={function(open) { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-4xl max-h-[94vh] overflow-y-auto p-0">
          {detailLoading ? (
            <div className="text-center py-20 px-6">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground text-sm">Loading candidate profile...</p>
            </div>
          ) : candidateDetail ? (() => {
            const profile = candidateDetail.profile || {};
            const wallet = candidateDetail.wallet || [];
            const candName = (candidateDetail.user?.name) || profile.name || 'Candidate';
            const videos = wallet.filter(i => i.is_video);
            const docs = wallet.filter(i => !i.is_video);
            const BACKEND = process.env.REACT_APP_BACKEND_URL + '/api';

            // Inline viewer state (local to this IIFE render)
            // viewingFile: { url, name, isVideo, isImage, isPDF }

            return (
              <div>
                {/* ── HERO HEADER ── */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-8 pt-8 pb-10 relative rounded-t-lg">
                  <div className="absolute inset-0 bg-black/10 rounded-t-lg" />
                  <div className="relative flex items-start gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-2 border-white/40 flex-shrink-0">
                      {candName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-3xl font-bold text-white mb-1">{candName}</DialogTitle>
                      <p className="text-white/75 text-sm">{profile.email}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.talent_category && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium border border-white/30">{profile.talent_category}</span>}
                        {profile.college && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs border border-white/30 flex items-center gap-1.5"><GraduationCap className="h-3 w-3" />{profile.college}</span>}
                        {(profile.city || profile.state) && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs border border-white/30 flex items-center gap-1.5"><MapPin className="h-3 w-3" />{[profile.city, profile.state].filter(Boolean).join(', ')}</span>}
                        {!profile.city && !profile.state && profile.address && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs border border-white/30 flex items-center gap-1.5"><MapPin className="h-3 w-3" />{profile.address}</span>}
                      </div>
                      <div className="flex gap-3 mt-3">
                        {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>}
                        {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>}
                        {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-5xl font-bold text-white">{profile.ai_score || profile.talent_score || 0}</div>
                      <p className="text-white/60 text-xs mt-1">Talent Score</p>
                      <div className="mt-2 text-white/70 text-xs">{profile.experience_years || 0} yrs exp</div>
                    </div>
                  </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="px-8 py-8 space-y-8">

                  {/* Score Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Talent Score', value: profile.talent_score, color: 'from-indigo-500 to-purple-600', icon: Star },
                      { label: 'AI Score',     value: profile.ai_score,     color: 'from-purple-500 to-pink-600',   icon: Brain },
                      { label: 'Experience',   value: (profile.experience_years || 0) + ' yrs', color: 'from-blue-500 to-cyan-600', icon: Award },
                    ].map(sc => {
                      const Icon = sc.icon;
                      return (
                        <div key={sc.label} className={`rounded-2xl p-5 bg-gradient-to-br ${sc.color} text-center text-white shadow-md`}>
                          <Icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
                          <div className="text-3xl font-bold">{sc.value || '—'}</div>
                          <p className="text-xs opacity-75 mt-1">{sc.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── CONTACT INFORMATION ── */}
                  {(profile.mobile || profile.address || profile.email || profile.college) && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Contact Information</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { show: profile.email,   icon: Mail,           label: 'Email',     val: profile.email,   color: 'blue' },
                          { show: profile.mobile,  icon: Phone,          label: 'Mobile',    val: profile.mobile,  color: 'green' },
                          { show: profile.address, icon: MapPin,         label: 'Location',  val: profile.address, color: 'orange' },
                          { show: profile.college, icon: GraduationCap,  label: 'Education', val: profile.college, color: 'purple' },
                        ].filter(c => c.show).map(c => {
                          const Icon = c.icon;
                          return (
                            <div key={c.label} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-border hover:border-primary/30 transition-colors">
                              <div className={`w-10 h-10 rounded-xl bg-${c.color}-100 dark:bg-${c.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`h-5 w-5 text-${c.color}-600 dark:text-${c.color}-400`} />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                                <p className="text-sm font-semibold mt-0.5">{c.val}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── SKILLS ── */}
                  {profile.skills?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />Skills</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-800">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── AI SKILL CONFIDENCE ── */}
                  {profile.parsed_data?.skill_scores && Object.keys(profile.parsed_data.skill_scores).length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />AI Skill Confidence</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {Object.entries(profile.parsed_data.skill_scores).slice(0, 10).map(([skill, score]) => (
                          <div key={skill}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium">{skill}</span>
                              <span className="text-muted-foreground font-bold">{score}%</span>
                            </div>
                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: score + '%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── VIDEO RESUMES ── */}
                  {videos.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-red-500" />Video Resumes</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-5">
                        {videos.map((vid, i) => {
                          const vidUrl = `${BACKEND}/wallet/file/${profile.email}/${vid.file_id}`;
                          return (
                            <div key={i} className="rounded-2xl overflow-hidden border-2 border-border bg-black shadow-lg">
                              <video controls preload="metadata" className="w-full" style={{ maxHeight: '320px', display: 'block' }} data-testid="recruiter-inline-video">
                                <source src={vidUrl} type={vid.mime_type || 'video/mp4'} />
                              </video>
                              <div className="p-4 bg-background border-t border-border">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-sm">{vid.file_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(vid.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {(vid.file_size / (1024*1024)).toFixed(1)} MB</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {vid.blockchain_verified && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"><CheckCircle className="h-3 w-3" />Verified</span>}
                                    <Button size="sm" variant="outline" onClick={() => setViewingFile({ url: vidUrl, name: vid.file_name, isVideo: true })} className="h-8 text-xs gap-1">
                                      <Eye className="h-3 w-3" />Fullscreen
                                    </Button>
                                  </div>
                                </div>
                                {vid.video_analysis?.summary && (
                                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">{vid.video_analysis.summary}</p>
                                )}
                                {vid.video_skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {vid.video_skills.slice(0, 8).map((sk, j) => (
                                      <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">{sk.skill || sk}{sk.confidence ? ` · ${sk.confidence}%` : ''}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── DOCUMENTS & CERTIFICATES ── */}
                  {docs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5 text-green-500" />Documents & Certificates</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-4">
                        {docs.map((doc, i) => {
                          const dExt = (doc.file_name || '').split('.').pop().toLowerCase();
                          const dIsImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(dExt);
                          const dIsPDF = dExt === 'pdf';
                          const docUrl = `${BACKEND}/wallet/file/${profile.email}/${doc.file_id}`;
                          const typeConfig2 = {
                            resume:      { grad: 'from-blue-500 to-indigo-600',   label: 'Resume / CV' },
                            certificate: { grad: 'from-green-500 to-emerald-600', label: 'Certificate' },
                            project:     { grad: 'from-purple-500 to-violet-600', label: 'Project' },
                          };
                          const tc = typeConfig2[doc.item_type] || typeConfig2.project;
                          return (
                            <div key={i} className="rounded-2xl border-2 border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              {/* Doc Banner */}
                              <div className={`px-5 py-4 bg-gradient-to-r ${tc.grad} flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                    {dIsImage ? <Image className="h-5 w-5 text-white" /> : <FileText className="h-5 w-5 text-white" />}
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold text-sm">{doc.file_name}</p>
                                    <p className="text-white/70 text-xs mt-0.5 capitalize">{tc.label} · {(doc.file_size / 1024).toFixed(0)} KB · Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {doc.blockchain_verified && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-medium border border-white/30"><CheckCircle className="h-3 w-3" />Verified</span>
                                  )}
                                  <Button size="sm" variant="ghost"
                                    onClick={() => setViewingFile({ url: docUrl, name: doc.file_name, isImage: dIsImage, isPDF: dIsPDF })}
                                    className="h-8 text-xs text-white hover:bg-white/20 gap-1 border border-white/30">
                                    <Eye className="h-3 w-3" />View
                                  </Button>
                                </div>
                              </div>

                              {/* Image Inline Preview */}
                              {dIsImage && (
                                <div className="bg-secondary/10 flex justify-center items-center p-4 border-b border-border min-h-[180px]">
                                  <img
                                    src={docUrl}
                                    alt={doc.file_name}
                                    className="max-h-64 max-w-full object-contain rounded-xl shadow cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => setViewingFile({ url: docUrl, name: doc.file_name, isImage: true })}
                                    onError={e => { e.target.parentElement.style.display='none'; }}
                                  />
                                </div>
                              )}

                              {/* PDF Embedded Preview */}
                              {dIsPDF && (
                                <div className="bg-secondary/10 p-4 border-b border-border">
                                  {doc.extracted_text ? (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-3 w-3" />Document Content Preview</p>
                                      <div className="bg-background rounded-xl border border-border p-4 max-h-36 overflow-y-auto">
                                        <p className="text-sm text-muted-foreground leading-relaxed">{doc.extracted_text.slice(0, 600)}{doc.extracted_text.length > 600 ? '…' : ''}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4">
                                      <p className="text-xs text-muted-foreground">Click "View" to open this PDF inline</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Footer: hash */}
                              {doc.content_hash && (
                                <div className="px-5 py-3 bg-secondary/30 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Shield className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                    <code className="text-xs font-mono text-muted-foreground truncate">{doc.content_hash.slice(0, 40)}…</code>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => handleVerifyCert(doc.content_hash)} className="h-7 text-xs flex-shrink-0 gap-1">
                                    <Shield className="h-3 w-3" />Verify
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── AI PROFILE INSIGHT ── */}
                  {profile.ai_overview && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-purple-500" />AI Insights</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-100 dark:border-purple-900">
                        <p className="text-sm text-muted-foreground leading-relaxed">{profile.ai_overview.summary}</p>
                        {profile.ai_overview.strengths?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {profile.ai_overview.strengths.slice(0, 4).map((s, i) => (
                              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── ACHIEVEMENTS ── */}
                  {profile.past_records && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-yellow-500" />Achievements</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="p-5 rounded-2xl bg-secondary/40 border border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">{profile.past_records}</p>
                      </div>
                    </div>
                  )}

                  {/* ── BIO ── */}
                  {profile.resume_text && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Professional Bio</h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="p-5 rounded-2xl bg-secondary/20 border border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">{profile.resume_text.slice(0, 600)}{profile.resume_text.length > 600 ? '…' : ''}</p>
                      </div>
                    </div>
                  )}

                  {/* ── ACTIONS ── */}
                  <div className="flex gap-4 pt-4 border-t-2 border-border">
                    <Button className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2" onClick={() => setEmailModal(true)}>
                      <Mail className="h-5 w-5" />Send Email to Candidate
                    </Button>
                    <Button variant="outline" onClick={closeDialog} className="px-8 h-12">Close</Button>
                  </div>

                </div>
              </div>
            );
          })() : null}
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={emailModal} onOpenChange={setEmailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Send Email to Candidate</DialogTitle>
            <DialogDescription>Sending to: {selectedCandidate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-sm">
              <span className="font-medium">From: </span>{(recruiterProfile && recruiterProfile.name) || user.name}
              {recruiterProfile && recruiterProfile.company_name && (
                <span className="text-muted-foreground"> &middot; {recruiterProfile.company_name}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input value={emailData.subject} onChange={function(e) { setEmailData(function(d) { return Object.assign({}, d, {subject: e.target.value}); }); }} placeholder="Job Opportunity at [Company Name]" />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea value={emailData.message} onChange={function(e) { setEmailData(function(d) { return Object.assign({}, d, {message: e.target.value}); }); }} rows={6} placeholder="Dear Candidate, I came across your profile and would like to discuss..." />
            </div>
            <Button onClick={handleSendEmail} disabled={emailSending} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
              {emailSending ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending...</span>
              ) : (
                <span className="flex items-center gap-2"><Send className="h-4 w-4" />Send Email</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Main Recruiter Dashboard ----
export default function RecruiterDashboard({ user, setUser }) {
  const location = useLocation();
  const [profileName, setProfileName] = useState(user.name);
  const [recruiterProfileData, setRecruiterProfileData] = useState(null);
  const [recruiterProfileLoaded, setRecruiterProfileLoaded] = useState(false);

  useEffect(() => {
    api.getRecruiterProfile(user.email)
      .then(res => { setRecruiterProfileData(res.data); if (res.data?.name) setProfileName(res.data.name); })
      .catch(() => {})
      .finally(() => setRecruiterProfileLoaded(true));
  }, [user.email]);

  const updateName = (name) => {
    setProfileName(name);
    // Re-fetch recruiter profile to update the gate
    api.getRecruiterProfile(user.email).then(r => setRecruiterProfileData(r.data)).catch(() => {});
    setProfileName(name);
    if (setUser && name) {
      setUser(prev => {
        const updated = { ...prev, name };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleLogout = function() {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isActive = function(path) {
    return location.pathname === path || (path === '/recruiter' && location.pathname === '/recruiter/');
  };

  const navItems = [
    { to: '/recruiter', icon: Search, label: 'Find Talent' },
    { to: '/recruiter/post-job', icon: Briefcase, label: 'Post Job' },
    { to: '/recruiter/profile', icon: Building2, label: 'My Profile' },
    { to: '/recruiter/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="recruiter-dashboard">
      {recruiterProfileLoaded && (
        <RecruiterProfileGate user={user} profileData={recruiterProfileData} location={location} />
      )}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Talent Scout</span>
            <Badge variant="secondary" className="text-xs hidden sm:block">Recruiter</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {(profileName || '?').charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{profileName}</span>
            </div>
            <NotificationBell userEmail={user.email} />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {navItems.map(function(item) {
                var Icon = item.icon;
                var active = isActive(item.to);
                return (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant={active ? 'secondary' : 'ghost'}
                      className={'w-full justify-start gap-3 h-10 transition-all hover:translate-x-1 ' + (active ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900' : '')}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="lg:col-span-4">
            <Routes>
              <Route path="/" element={<CandidateSearch user={user} />} />
              <Route path="/post-job" element={<JobPosting user={user} />} />
              <Route path="/profile" element={<RecruiterProfilePage user={user} onProfileUpdated={updateName} />} />
              <Route path="/settings" element={<Settings user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
