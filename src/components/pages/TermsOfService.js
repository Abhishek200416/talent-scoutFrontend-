import React from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: February 2026</p>
          </div>

          <Separator />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>1. Acceptance of Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>By accessing and using Talent Scout platform, you accept and agree to be bound by these Terms of Service.</p>
                <p>If you do not agree to these terms, please do not use our services.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Account Creation:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You must verify your email address via OTP</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person/organization</li>
                </ul>
                <p className="mt-3"><strong>Account Termination:</strong></p>
                <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. User Conduct</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-green-500 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Permitted Activities</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                    <li>Create honest and accurate profiles</li>
                    <li>Upload genuine certificates and credentials</li>
                    <li>Engage respectfully with other users</li>
                    <li>Use platform for legitimate talent discovery</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-red-500 mb-2">
                    <XCircle className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Prohibited Activities</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                    <li>Upload fake or forged certificates</li>
                    <li>Misrepresent skills or experience</li>
                    <li>Spam or harass other users</li>
                    <li>Attempt to bypass blockchain verification</li>
                    <li>Scrape or extract platform data</li>
                    <li>Use automated bots or scripts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Blockchain Verification</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Certificate hashes are stored permanently on Ethereum blockchain</p>
                <p>• Once stored, blockchain records cannot be deleted or modified</p>
                <p>• You consent to public storage of credential hashes</p>
                <p>• Actual documents are NOT stored on blockchain</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. AI Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>By uploading resumes and documents:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You consent to AI analysis using Google Gemini</li>
                  <li>AI extracts skills, experience, and generates scores</li>
                  <li>Scores are algorithmic estimates, not guarantees</li>
                  <li>You can dispute or request manual review of scores</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Your Content:</strong> You retain ownership of uploaded content (resumes, certificates, videos)</p>
                <p><strong>Platform Rights:</strong> Talent Scout platform, code, and branding are proprietary</p>
                <p><strong>License Grant:</strong> You grant us license to display and process your content for platform purposes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Talent Scout is provided "as is" without warranties. We are not liable for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Hiring decisions made by recruiters</li>
                  <li>Accuracy of AI-generated scores</li>
                  <li>Blockchain network failures</li>
                  <li>Third-party service interruptions</li>
                  <li>Loss of job opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Disputes will be resolved through:</p>
                <p>1. Good faith negotiation</p>
                <p>2. Mediation (if negotiation fails)</p>
                <p>3. Binding arbitration in accordance with local laws</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-2">Changes to Terms</p>
                    <p className="text-muted-foreground">We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of new terms.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}