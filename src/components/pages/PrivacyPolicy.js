import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: February 2026</p>
          </div>

          <Separator />

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Information We Collect</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Email address (for authentication)</li>
                    <li>Full name (for profile identification)</li>
                    <li>Resume and professional information</li>
                    <li>Skills, experience, and education details</li>
                    <li>Certificates and credentials</li>
                    <li>Talent videos and portfolios</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Automatically Collected</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>How We Use Your Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Authentication:</strong> Verify your identity using email OTP</p>
                <p>• <strong>AI Analysis:</strong> Process resumes for skill extraction and scoring</p>
                <p>• <strong>Blockchain Verification:</strong> Store certificate hashes for authenticity</p>
                <p>• <strong>Matching:</strong> Connect candidates with relevant job opportunities</p>
                <p>• <strong>Communication:</strong> Send notifications about profile updates and matches</p>
                <p>• <strong>Improvement:</strong> Analyze usage patterns to enhance platform features</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Data Sharing and Disclosure</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">With Recruiters</h3>
                  <p>Candidate profiles, scores, and verified credentials are visible to registered recruiters for hiring purposes.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">On Blockchain</h3>
                  <p>Only SHA-256 hashes (not actual documents) are stored publicly on Ethereum Sepolia for verification.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Third Parties</h3>
                  <p>We do NOT sell your personal information. We may share with:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>AI processing services (Google Gemini) for resume analysis</li>
                    <li>Email service providers (SMTP) for OTP delivery</li>
                    <li>Cloud infrastructure providers for secure storage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Data Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• End-to-end encryption for data transmission</p>
                <p>• Secure authentication with OTP verification</p>
                <p>• Blockchain immutability for credential verification</p>
                <p>• Regular security audits and penetration testing</p>
                <p>• Encrypted database storage</p>
                <p>• Access controls and role-based permissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Your Rights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Access:</strong> Request copy of your data</p>
                <p>• <strong>Correction:</strong> Update incorrect information</p>
                <p>• <strong>Deletion:</strong> Request account and data deletion</p>
                <p>• <strong>Export:</strong> Download your data in portable format</p>
                <p>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</p>
                <p>• <strong>Withdraw Consent:</strong> Revoke permission for data processing</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6 text-sm">
                <p className="mb-2"><strong>Contact Us</strong></p>
                <p className="text-muted-foreground">For privacy concerns or data requests, email us at:</p>
                <p className="text-primary font-semibold mt-2">privacy@talentscout.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}