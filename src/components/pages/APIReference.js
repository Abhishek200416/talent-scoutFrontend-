import React from 'react';
import { Code, Copy, Terminal, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function APIReference() {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Register new user and send OTP',
      body: { email: "user@example.com", name: "John Doe", role: "candidate" },
      response: { message: "OTP sent to email", email: "user@example.com" }
    },
    {
      method: 'POST',
      path: '/api/auth/verify-otp',
      desc: 'Verify OTP and authenticate',
      body: { email: "user@example.com", otp: "123456" },
      response: { message: "Email verified successfully", token: "token_abc123", role: "candidate" }
    },
    {
      method: 'POST',
      path: '/api/candidate/profile',
      desc: 'Create or update candidate profile',
      body: { email: "user@example.com", talent_category: "Technical", skills: ["Python", "React"], experience_years: 5 },
      response: { message: "Profile created successfully", talent_score: 85 }
    },
    {
      method: 'GET',
      path: '/api/candidate/profile/{email}',
      desc: 'Get candidate profile',
      response: { email: "user@example.com", talent_category: "Technical", talent_score: 85, skills: ["Python", "React", "MongoDB"] }
    },
    {
      method: 'POST',
      path: '/api/blockchain/store-certificate',
      desc: 'Store certificate hash on blockchain',
      body: { candidate_email: "user@example.com", certificate_name: "Degree", certificate_data: "base64_data" },
      response: { message: "Certificate stored on blockchain", content_hash: "abc123hash", blockchain_tx: "0x123abc" }
    },
    {
      method: 'GET',
      path: '/api/blockchain/verify-certificate/{hash}',
      desc: 'Verify certificate authenticity',
      response: { verified: true, certificate_name: "Degree", blockchain_tx: "0x123abc" }
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">API Reference</h1>
            <p className="text-xl text-muted-foreground">
              Complete REST API documentation for Talent Scout platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Base URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <code className="text-sm">https://api.talentscout.com</code>
                <Button size="sm" variant="ghost" onClick={() => copyCode('https://api.talentscout.com')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {endpoints.map((endpoint, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      endpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-base">{endpoint.path}</code>
                  </CardTitle>
                  <CardDescription>{endpoint.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.body && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Request Body:</div>
                      <div className="relative">
                        <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.body, null, 2)}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(JSON.stringify(endpoint.body))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold mb-2">Response:</div>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(JSON.stringify(endpoint.response))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>All authenticated endpoints require a Bearer token in the Authorization header:</p>
              <pre className="p-4 bg-muted rounded-lg text-xs">
Authorization: Bearer YOUR_TOKEN_HERE
              </pre>
              <p>Obtain token through the /api/auth/verify-otp endpoint after email verification.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}