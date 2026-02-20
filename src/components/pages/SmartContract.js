import React from 'react';
import { Shield, FileCode, Lock, Eye, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

export default function SmartContract() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Smart Contract</h1>
            <p className="text-xl text-muted-foreground">
              Blockchain verification powered by Ethereum Sepolia
            </p>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Contract Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Network</div>
                  <div className="text-muted-foreground">Ethereum Sepolia Testnet</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Contract Name</div>
                  <div className="text-muted-foreground">CertificateHashStorage</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Solidity Version</div>
                  <div className="text-muted-foreground">^0.8.20</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">License</div>
                  <div className="text-muted-foreground">MIT</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCode className="h-5 w-5" />
                <span>Smart Contract Code</span>
              </CardTitle>
              <CardDescription>Solidity implementation for credential verification</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-6 bg-muted rounded-lg text-xs overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateHashStorage {
    struct HashRecord {
        bytes32 contentHash;
        string contentType;
        address uploader;
        uint256 timestamp;
        string ipfsHash;
    }
    
    mapping(uint256 => HashRecord) public hashRecords;
    uint256 public hashCount;
    
    event HashStored(
        uint256 indexed hashId,
        bytes32 contentHash,
        string contentType,
        address indexed uploader,
        uint256 timestamp
    );
    
    function storeHash(
        bytes32 _contentHash,
        string memory _contentType,
        string memory _ipfsHash
    ) public {
        hashCount++;
        hashRecords[hashCount] = HashRecord(
            _contentHash,
            _contentType,
            msg.sender,
            block.timestamp,
            _ipfsHash
        );
        emit HashStored(
            hashCount,
            _contentHash,
            _contentType,
            msg.sender,
            block.timestamp
        );
    }
    
    function verifyHash(
        uint256 _hashId,
        bytes32 _contentHash
    ) public view returns (bool) {
        return hashRecords[_hashId].contentHash == _contentHash;
    }
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>What We Store</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold">SHA-256 Hash (32 bytes)</div>
                    <div className="text-sm text-muted-foreground">Cryptographic hash of certificate/video</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold">Content Type</div>
                    <div className="text-sm text-muted-foreground">Certificate, video, or document type</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold">Timestamp</div>
                    <div className="text-sm text-muted-foreground">When the hash was stored</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold">Uploader Address</div>
                    <div className="text-sm text-muted-foreground">Ethereum address of the uploader</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Verification Process</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                <li>Candidate uploads certificate/video to platform</li>
                <li>System calculates SHA-256 hash of the file</li>
                <li>Hash is stored in smart contract on Ethereum Sepolia</li>
                <li>Transaction hash returned and saved in database</li>
                <li>Recruiter can verify by re-calculating hash</li>
                <li>System compares with blockchain record</li>
                <li>If hashes match → Certificate is authentic ✓</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <div className="space-y-2">
                  <div className="font-semibold">Why Blockchain?</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Immutability:</strong> Once stored, cannot be altered</li>
                    <li>• <strong>Transparency:</strong> Anyone can verify</li>
                    <li>• <strong>Decentralization:</strong> No single point of control</li>
                    <li>• <strong>Cryptographic Proof:</strong> Mathematically verifiable</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}