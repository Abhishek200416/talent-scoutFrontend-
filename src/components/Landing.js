import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Brain, Zap, CheckCircle, ArrowRight, Award, Lock, TrendingUp, Video, FileCheck, Bot, Wallet, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ThemeToggle } from './common/ThemeToggle';
import { AuthDialog } from './AuthDialog';

export default function Landing({ setUser }) {
  const [showAuth, setShowAuth] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Talent Scout</span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a>
            <Link to="/documentation" className="text-sm hover:text-primary transition-colors">Docs</Link>
            <Link to="/api-reference" className="text-sm hover:text-primary transition-colors">API</Link>
            <Link to="/smart-contract" className="text-sm hover:text-primary transition-colors">Blockchain</Link>
            <ThemeToggle />
            <Button onClick={() => setShowAuth(true)} className="gradient-primary">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
          <div className="flex lg:hidden items-center space-x-2">
            <ThemeToggle />
            <Button size="icon" variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <Link to="/documentation" className="block text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Documentation</Link>
              <Link to="/api-reference" className="block text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>API Reference</Link>
              <Link to="/smart-contract" className="block text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Smart Contract</Link>
              <Button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Zap className="h-4 w-4 mr-2" />
                AI + Blockchain Technology
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Discover <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Verified</span> Talent
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                AI-powered talent scouting with blockchain verification. Showcase skills across <strong>Technical, Creative, Performance, and Sports</strong> domains with tamper-proof credentials.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-primary h-14 px-8 text-lg" onClick={() => setShowAuth(true)}>
                  I'm a Candidate <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => setShowAuth(true)}>
                  I'm a Recruiter
                </Button>
              </div>
              <div className="flex items-center space-x-8 pt-4 flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">AI Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Blockchain Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Multi-Domain</span>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4 p-8">
                <Card className="p-6 space-y-3 feature-card">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">AI Resume Analysis</h3>
                  <p className="text-sm text-muted-foreground">Intelligent skill extraction and scoring</p>
                </Card>
                <Card className="p-6 space-y-3 feature-card mt-8">
                  <div className="p-3 rounded-lg bg-purple-500/10 w-fit">
                    <Lock className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold">Blockchain Security</h3>
                  <p className="text-sm text-muted-foreground">Tamper-proof credential storage</p>
                </Card>
                <Card className="p-6 space-y-3 feature-card">
                  <div className="p-3 rounded-lg bg-green-500/10 w-fit">
                    <Video className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold">Talent Videos</h3>
                  <p className="text-sm text-muted-foreground">Showcase your real abilities</p>
                </Card>
                <Card className="p-6 space-y-3 feature-card mt-8">
                  <div className="p-3 rounded-lg bg-blue-500/10 w-fit">
                    <Award className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">Verified Certificates</h3>
                  <p className="text-sm text-muted-foreground">Instant authenticity verification</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Verified Candidates', value: '10K+', icon: Users },
              { label: 'Active Recruiters', value: '500+', icon: Shield },
              { label: 'Certificates Verified', value: '25K+', icon: FileCheck },
              { label: 'Success Rate', value: '95%', icon: TrendingUp }
            ].map((stat, idx) => (
              <Card key={idx} className="p-8 text-center space-y-4 feature-card">
                <stat.icon className="h-10 w-10 text-primary mx-auto" />
                <div className={`text-5xl font-bold text-primary ${statsVisible ? 'stat-number' : 'opacity-0'}`}>
                  {stat.value}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need for modern, trustless talent verification</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced NLP analyzes resumes, extracts skills, and provides intelligent talent scoring using Gemini AI.' },
              { icon: Shield, title: 'Blockchain Verified', desc: 'Store certificate hashes on Ethereum Sepolia. Tamper-proof, transparent, and instantly verifiable.' },
              { icon: Video, title: 'Talent Video Showcase', desc: 'Upload performance videos, creative portfolios, or coding demos. Hash stored on blockchain for authenticity.' },
              { icon: Wallet, title: 'Crypto Wallet Integration', desc: 'Connect your wallet for decentralized identity and credential ownership. Your data, your control.' },
              { icon: Bot, title: 'Smart Matching Algorithm', desc: 'AI matches candidates with jobs using cosine similarity and multi-factor scoring for perfect fits.' },
              { icon: Award, title: 'Multi-Domain Support', desc: 'Support for Technical, Creative, Performance, and Sports talents with category-specific evaluation.' }
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 space-y-4 feature-card">
                <div className="p-4 rounded-xl bg-primary/10 w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple 4-step process for verified talent showcase</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: Users, title: 'Register & Verify', desc: 'Sign up with email OTP verification' },
              { step: '02', icon: FileCheck, title: 'Upload Credentials', desc: 'Add resume, certificates, and talent videos' },
              { step: '03', icon: Brain, title: 'AI Analysis', desc: 'AI extracts skills and calculates talent score' },
              { step: '04', icon: Shield, title: 'Blockchain Storage', desc: 'Hashes stored on Ethereum for verification' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-purple-500" />
                )}
                <Card className="p-8 space-y-4 text-center relative z-10 feature-card">
                  <div className="text-6xl font-bold text-primary/20">{item.step}</div>
                  <div className="p-4 rounded-xl bg-primary/10 w-fit mx-auto">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of verified candidates and recruiters on the future of talent discovery
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gradient-primary h-14 px-8 text-lg" onClick={() => setShowAuth(true)}>
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Talent Scout</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered talent verification with blockchain security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#features" className="hover:text-primary">Features</a></div>
                <div><a href="#how-it-works" className="hover:text-primary">How It Works</a></div>
                <div><Link to="/documentation" className="hover:text-primary">Documentation</Link></div>
                <div><Link to="/api-reference" className="hover:text-primary">API Reference</Link></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blockchain</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link to="/smart-contract" className="hover:text-primary">Smart Contract</Link></div>
                <div className="hover:text-primary cursor-pointer">Ethereum Sepolia</div>
                <div className="hover:text-primary cursor-pointer">Verification Process</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></div>
                <div><Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link></div>
                <div><Link to="/cookie-policy" className="hover:text-primary">Cookie Policy</Link></div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Talent Scout. All rights reserved. Powered by AI & Blockchain.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} setUser={setUser} />
    </div>
  );
}