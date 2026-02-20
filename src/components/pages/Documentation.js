import React from 'react';
import { Shield, FileText, Code, Lock, Scale, Cookie } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to using the Talent Scout platform
            </p>
          </div>

          <Separator />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Getting Started</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">For Candidates</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Sign up with your email and verify with OTP</li>
                    <li>Choose your talent category (Technical, Creative, Performance, Sports)</li>
                    <li>Upload your resume, certificates, and talent videos</li>
                    <li>AI analyzes your profile and calculates talent score</li>
                    <li>Certificates are verified on blockchain</li>
                    <li>Get discovered by recruiters</li>
                  </ol>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">For Recruiters</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Create recruiter account with email verification</li>
                    <li>Post job requirements with required skills</li>
                    <li>Search candidates by category, skills, and score</li>
                    <li>View AI-generated talent scores</li>
                    <li>Verify certificate authenticity via blockchain</li>
                    <li>Shortlist and contact candidates</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p><strong>Resume Parsing:</strong> AI extracts skills, experience, and education using NLP</p>
                <p><strong>Skill Normalization:</strong> Standardizes skill names across different formats</p>
                <p><strong>Talent Scoring:</strong> Multi-factor algorithm calculates 0-100 score</p>
                <p><strong>Job Matching:</strong> Cosine similarity matches candidates to jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Blockchain Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p><strong>Certificate Storage:</strong> SHA-256 hash stored on Ethereum Sepolia</p>
                <p><strong>Video Verification:</strong> Video file hash recorded on blockchain</p>
                <p><strong>Instant Verification:</strong> Recruiters verify authenticity in seconds</p>
                <p><strong>Tamper-Proof:</strong> Blockchain ensures no one can modify credentials</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Talent Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: '💻 Technical', desc: 'Programming, AI/ML, Cybersecurity' },
                    { name: '🎨 Creative', desc: 'Design, Photography, Video Editing' },
                    { name: '🎭 Performance', desc: 'Acting, Singing, Dancing' },
                    { name: '🏆 Sports', desc: 'Athletics, Team Sports, Coaching' }
                  ].map((cat, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="font-semibold">{cat.name}</div>
                      <div className="text-xs text-muted-foreground">{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}