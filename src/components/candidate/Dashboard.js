import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Upload, Shield, Award, LogOut, Settings as SettingsIcon, Wallet,
  FileText, Trash2, Brain, CheckCircle, Loader2, User, Video, Star,
  Edit2, Clock, BarChart2, Globe, Github, Linkedin, Phone, MapPin,
  GraduationCap, BookOpen, Home, Eye, Download, Play, X, ChevronRight,
  Sparkles, TrendingUp, AlertCircle, RefreshCw, FileVideo, Plus,
  Hash, Zap, Target, Badge as BadgeIcon, ChevronDown, ChevronUp,
  Film, Image, FileImage, Mail, Timer, Lock, Briefcase
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationBell } from '../common/NotificationBell';
import Settings from '../pages/Settings';
import { toast } from 'sonner';
import api from '../../utils/api';
import { INDIA_STATES, getCitiesForState } from '../../utils/indiaLocations';

// ---- Skill Suggestions by Category ----
const SKILL_SUGGESTIONS = {
  Technical: ['Python','JavaScript','React','Node.js','TypeScript','Java','C++','C#','Go','Rust','Docker','Kubernetes','AWS','GCP','Azure','MongoDB','PostgreSQL','MySQL','Redis','GraphQL','REST API','Machine Learning','Deep Learning','TensorFlow','PyTorch','Data Science','Pandas','NumPy','FastAPI','Django','Spring Boot','Next.js','Vue.js','Angular','Git','Linux','Bash','CI/CD','Microservices','System Design'],
  Creative: ['Figma','Adobe XD','Photoshop','Illustrator','After Effects','Premiere Pro','UI/UX Design','Graphic Design','Brand Identity','Motion Graphics','3D Modeling','Blender','Canva','Color Theory','Typography','Video Editing','Photography','Sketch','InVision','Prototyping'],
  Performance: ['Acting','Singing','Dancing','Guitar','Piano','Violin','Public Speaking','Storytelling','Improvisation','Stage Performance','Voice Training','Music Production','Choreography','Theater','Film Acting','Stand-up Comedy'],
  Sports: ['Football','Cricket','Basketball','Tennis','Swimming','Athletics','Badminton','Chess','Yoga','Fitness Training','Coaching','Sports Psychology','Nutrition','Marathon Running','Cycling'],
  Management: ['Project Management','Agile','Scrum','Product Management','Team Leadership','Strategic Planning','Business Analysis','Stakeholder Management','Risk Management','Budgeting','OKRs','Communication','Negotiation','Change Management'],
  Research: ['Data Analysis','Research Methodology','Academic Writing','Literature Review','Statistics','SPSS','R','Matlab','Lab Techniques','Grant Writing','Scientific Communication','Bioinformatics','Chemistry','Physics','Biology'],
};

// ---- Skill Tag Input Component ----
function SkillTagInput({ value, onChange, category }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const suggestions = (SKILL_SUGGESTIONS[category] || SKILL_SUGGESTIONS.Technical).filter(
    s => !skills.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 12);

  const addSkill = (skill) => {
    const newSkills = [...skills, skill];
    onChange(newSkills.join(', '));
    setInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (idx) => {
    const newSkills = skills.filter((_, i) => i !== idx);
    onChange(newSkills.join(', '));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addSkill(input.trim());
    }
    if (e.key === 'Backspace' && !input && skills.length) {
      removeSkill(skills.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[48px] flex flex-wrap gap-1.5 p-2 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary cursor-text" onClick={() => document.getElementById('skill-input')?.focus()}>
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
            {s}
            <button onMouseDown={(e) => { e.preventDefault(); removeSkill(i); }} className="hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          id="skill-input"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={skills.length ? 'Add more...' : 'Type or pick a skill...'}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="border rounded-lg bg-popover shadow-lg p-2 max-h-40 overflow-y-auto z-10 relative">
          <p className="text-xs text-muted-foreground mb-1.5 px-1">Suggested Skills — click to add</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button key={s} onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30">
                <Plus className="h-2.5 w-2.5 inline mr-0.5" />{s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Press Enter or comma to add · Click × to remove · {skills.length} skill{skills.length !== 1 ? 's' : ''} added</p>
    </div>
  );
}

// ---- Shared File Viewer Overlay ----
function FileViewerOverlay({ file, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!file) return null;

  // Support both old structure (file.isVideo, file.isImage) and new detection
  const isVideo = file.isVideo || file.mime_type?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
  const isImage = file.isImage || file.mime_type?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(file.name);
  const isPDF = file.isPDF || file.mime_type === 'application/pdf' || file.name?.endsWith('.pdf');
  const isDoc = file.mime_type?.includes('word') || /\.(doc|docx)$/i.test(file.name);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
    console.error('Failed to load file:', file.url);
  };

  const overlay = (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, background: '#000', display: 'flex', flexDirection: 'column' }}
      onClick={(e) => e.stopPropagation()}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#111', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isVideo ? <Film className="h-5 w-5 text-red-400" /> : isImage ? <FileImage className="h-5 w-5 text-blue-400" /> : isDoc ? <FileText className="h-5 w-5 text-green-400" /> : <FileText className="h-5 w-5 text-amber-400" />}
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{file.name}</span>
          <span style={{ color: '#888', fontSize: '13px' }}>{isVideo ? 'Video' : isImage ? 'Image' : isDoc ? 'Word Document' : isPDF ? 'PDF Document' : 'Document'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href={file.url} download target="_blank" rel="noopener noreferrer" data-testid="file-viewer-download"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #444', color: '#ccc', fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
            <Download className="h-4 w-4" />Download
          </a>
          <a href={file.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #444', color: '#ccc', fontSize: '13px', textDecoration: 'none', cursor: 'pointer' }}>
            <Eye className="h-4 w-4" />Open in Tab
          </a>
          <button onClick={onClose} data-testid="file-viewer-close"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#333', color: '#fff', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
            <X className="h-4 w-4" />Close
          </button>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', background: '#000', padding: '20px' }}>
        {isVideo && (
          <video key={file.url} controls autoPlay playsInline
            style={{ width: '90%', maxWidth: '1200px', maxHeight: 'calc(100vh - 80px)', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
            data-testid="file-viewer-video"
            onLoadedData={handleImageLoad}
            onError={handleImageError}>
            <source src={file.url} type="video/mp4" />
            <source src={file.url} type="video/webm" />
            Your browser does not support video playback.
          </video>
        )}
        
        {isImage && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
            {!error && (
              <>
                {loading && (
                  <div style={{ position: 'absolute', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                    <span style={{ fontSize: '14px', color: '#aaa' }}>Loading image...</span>
                  </div>
                )}
                <img 
                  src={file.url} 
                  alt={file.name}
                  style={{ 
                    maxWidth: '95%', 
                    maxHeight: 'calc(100vh - 140px)', 
                    objectFit: 'contain', 
                    borderRadius: '8px',
                    display: 'block',
                    opacity: loading ? 0.3 : 1,
                    transition: 'opacity 0.3s',
                    backgroundColor: '#1a1a1a'
                  }} 
                  data-testid="file-viewer-image"
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    console.error('Image failed to load:', file.url, e);
                    handleImageError();
                  }}
                />
              </>
            )}
            {error && (
              <div style={{ textAlign: 'center', color: '#fff', maxWidth: '600px', padding: '40px' }}>
                <FileImage style={{ width: '96px', height: '96px', margin: '0 auto 32px', opacity: 0.4 }} />
                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '16px' }}>Image Preview Unavailable</h3>
                <p style={{ fontSize: '15px', color: '#ccc', marginBottom: '12px', lineHeight: '1.8' }}>
                  This image cannot be displayed directly in the viewer due to browser security settings.
                </p>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
                  Please download the image or open it in a new tab to view it.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '24px' }}>
                  <a 
                    href={file.url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '18px 48px', 
                      borderRadius: '14px', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                      color: '#ffffff', 
                      textDecoration: 'none', 
                      fontSize: '17px', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)', 
                      minWidth: '300px', 
                      justifyContent: 'center',
                      transition: 'transform 0.2s'
                    }}
                    data-testid="image-download-btn"
                  >
                    <Download style={{ width: '24px', height: '24px' }} />
                    <span>Download Image</span>
                  </a>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '14px 40px', 
                      borderRadius: '12px', 
                      border: '2px solid #6366f1', 
                      backgroundColor: 'transparent', 
                      color: '#6366f1', 
                      textDecoration: 'none', 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      cursor: 'pointer', 
                      minWidth: '300px', 
                      justifyContent: 'center'
                    }}
                    data-testid="image-open-tab-btn"
                  >
                    <Eye style={{ width: '20px', height: '20px' }} />
                    <span>Open in New Tab</span>
                  </a>
                </div>
                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <p style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    File: {file.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isPDF && (
          <div style={{ width: '100%', maxWidth: '900px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <iframe 
              src={file.url} 
              style={{ width: '100%', flex: 1, border: 'none' }}
              data-testid="file-viewer-pdf"
              title="PDF Viewer"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div style={{ padding: '12px 16px', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Can't see the PDF? Try opening in a new tab →</span>
              <a href={file.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                <Eye className="h-4 w-4" />Open PDF
              </a>
            </div>
          </div>
        )}
        
        {isDoc && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#000',
            padding: '40px' 
          }}>
            <div style={{ 
              textAlign: 'center', 
              color: '#fff', 
              maxWidth: '600px',
              width: '100%'
            }}>
              {/* Icon */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                margin: '0 auto 30px',
                backgroundColor: '#333',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '50px'
              }}>
                📄
              </div>
              
              {/* Filename */}
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#ffffff' 
              }}>
                {file.name}
              </h2>
              
              {/* Message */}
              <p style={{ 
                fontSize: '16px', 
                color: '#cccccc', 
                marginBottom: '15px', 
                lineHeight: '1.6' 
              }}>
                Word documents cannot be previewed in the browser.
              </p>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#999999', 
                marginBottom: '40px', 
                lineHeight: '1.6' 
              }}>
                Click the download button below to save and view this file.
              </p>
              
              {/* DOWNLOAD BUTTON - SUPER VISIBLE */}
              <a 
                href={file.url}
                download
                style={{
                  display: 'inline-block',
                  width: '320px',
                  padding: '20px 50px',
                  marginBottom: '15px',
                  backgroundColor: '#6366f1',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  borderRadius: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.6)',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.6)';
                }}
              >
                ⬇️ DOWNLOAD DOCUMENT
              </a>
              
              <br />
              
              {/* OPEN IN NEW TAB BUTTON */}
              <a 
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  width: '320px',
                  padding: '16px 40px',
                  backgroundColor: 'transparent',
                  color: '#6366f1',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  border: '2px solid #6366f1',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                👁️ OPEN IN NEW TAB
              </a>
              
              {/* Tip */}
              <p style={{ 
                fontSize: '12px', 
                color: '#666666', 
                marginTop: '30px', 
                fontStyle: 'italic' 
              }}>
                💡 After downloading, open with Microsoft Word or Google Docs
              </p>
            </div>
          </div>
        )}
        
        {!isVideo && !isImage && !isPDF && !isDoc && (
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <FileText className="h-20 w-20 mx-auto mb-4 opacity-30" />
            <p style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>{file.name}</p>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>This file type cannot be previewed</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a href={file.url} download target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <Download className="h-5 w-5" />Download
              </a>
              <a href={file.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', border: '1px solid #444', color: '#ccc', textDecoration: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <Eye className="h-5 w-5" />Open
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}

function getFileInfo(item, email) {
  const ext = (item.file_name || '').split('.').pop().toLowerCase();
  const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';
  return {
    url: `${API_URL}/wallet/file/${email}/${item.file_id}`,
    name: item.file_name,
    mime_type: item.mime_type,
    isVideo: item.is_video || ['mp4','mov','avi','webm','mkv','flv'].includes(ext),
    isImage: !item.is_video && ['jpg','jpeg','png','gif','webp','bmp'].includes(ext),
    isPDF: !item.is_video && ext === 'pdf',
  };
}
function VaultCard({ item, user, onDelete, onVerify, onTranscribe, onAIParse, onRename, onEditType, onView, transcribing, parsing }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.file_name || '');
  const [editingType, setEditingType] = useState(false);
  const [editType, setEditType] = useState(item.item_type || 'project');

  const typeConfig = {
    resume:       { color: 'from-blue-500 to-indigo-600',   bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',     border: 'border-blue-200 dark:border-blue-800',     label: 'Resume/CV' },
    certificate:  { color: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', border: 'border-green-200 dark:border-green-800',   label: 'Certificate' },
    project:      { color: 'from-purple-500 to-violet-600', bg: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',  border: 'border-purple-200 dark:border-purple-800', label: 'Project' },
    video_resume: { color: 'from-red-500 to-rose-600',     bg: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',           border: 'border-red-200 dark:border-red-800',       label: 'Video Resume' },
  };
  const cfg = typeConfig[item.item_type] || typeConfig.project;

  const sizeLabel = item.file_size > 1024 * 1024
    ? (item.file_size / (1024 * 1024)).toFixed(1) + ' MB'
    : (item.file_size / 1024).toFixed(0) + ' KB';

  const fileInfo = getFileInfo(item, user.email);
  const { url: fileUrl, isImage, isPDF } = fileInfo;
  const ext = (item.file_name || '').split('.').pop().toLowerCase();
  const textPreview = item.extracted_text ? item.extracted_text.replace(/\s+/g, ' ').trim().slice(0, 200) : null;
  const videoSummary = item.video_analysis?.summary;
  const videoSkills = item.video_skills?.length > 0 ? item.video_skills.slice(0, 5) : [];
  const videoScore = item.video_analysis?.overall_score;
  const transcript = item.video_transcript ? item.video_transcript.replace(/\s+/g, ' ').trim().slice(0, 300) : null;

  return (
    <>
      <Card className={`overflow-hidden feature-card border-2 ${expanded ? cfg.border : 'border-border'} transition-all duration-300`}>
      {/* Card Header Banner */}
      <div className={`bg-gradient-to-r ${cfg.color} p-4 relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              {item.is_video ? <Film className="h-5 w-5 text-white" /> : isImage ? <Image className="h-5 w-5 text-white" /> : <FileText className="h-5 w-5 text-white" />}
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { onRename(item.file_id, editName); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
                    className="bg-white/20 text-white text-sm rounded px-1.5 py-0.5 outline-none border border-white/40 w-[160px]" autoFocus data-testid="rename-input" />
                  <button onClick={() => { onRename(item.file_id, editName); setEditing(false); }} className="text-white/80 hover:text-white" data-testid="rename-save"><CheckCircle className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setEditName(item.file_name); setEditing(false); }} className="text-white/80 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-white text-sm leading-tight max-w-[180px] truncate">{item.file_name}</h4>
                  <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(item.file_name); }}
                    className="text-white/60 hover:text-white transition-opacity" data-testid="rename-btn" title="Rename file">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="text-white/70 text-xs mt-0.5">
                {editingType ? (
                  <span className="inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <select value={editType} onChange={e => setEditType(e.target.value)}
                      className="bg-white/20 text-white text-xs rounded px-1 py-0.5 border border-white/40 outline-none" data-testid="edit-type-select">
                      <option value="resume" className="text-black">Resume/CV</option>
                      <option value="certificate" className="text-black">Certificate</option>
                      <option value="project" className="text-black">Project</option>
                      <option value="video_resume" className="text-black">Video Resume</option>
                    </select>
                    <button onClick={() => { if (onEditType) onEditType(item.file_id, editType); setEditingType(false); }}
                      className="text-white/80 hover:text-white" data-testid="edit-type-save"><CheckCircle className="h-3 w-3" /></button>
                    <button onClick={() => { setEditType(item.item_type); setEditingType(false); }}
                      className="text-white/80 hover:text-white"><X className="h-3 w-3" /></button>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    {cfg.label} · {sizeLabel}
                    <button onClick={(e) => { e.stopPropagation(); setEditingType(true); }}
                      className="text-white/50 hover:text-white transition-opacity" data-testid="edit-type-btn" title="Change type">
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {item.blockchain_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium border border-white/30">
                <CheckCircle className="h-3 w-3" />Verified
              </span>
            )}
            {item.ai_parsed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium border border-white/30">
                <Brain className="h-3 w-3" />AI Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {item.is_video && (
        <div className="relative bg-black/90 group" style={{ minHeight: '180px' }}>
          <video
            className="w-full object-contain"
            controls
            preload="metadata"
            playsInline
            style={{ display: 'block', width: '100%', height: '200px' }}
            data-testid="vault-video-player"
          >
            <source src={fileUrl} type={item.mime_type || 'video/mp4'} />
            Your browser does not support video.
          </video>
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
              <Play className="h-3 w-3" />Video Resume
            </span>
          </div>
        </div>
      )}

      {isImage && !item.is_video && (
        <div className="overflow-hidden bg-secondary/30 border-b border-border">
          <img
            src={fileUrl}
            alt={item.file_name}
            className="w-full object-contain max-h-56 cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => window.open(fileUrl, '_blank')}
            onError={(e) => { e.target.style.display='none'; }}
          />
        </div>
      )}

      {isPDF && textPreview && !item.is_video && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900 p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-10 bg-red-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-[9px] font-bold">PDF</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{textPreview}…</p>
          </div>
        </div>
      )}

      {!isImage && !isPDF && !item.is_video && !textPreview && (
        <div className="bg-secondary/20 border-b border-border p-4 text-center">
          <FileImage className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground mt-1">Scanned / image document</p>
        </div>
      )}

      {/* Card Body */}
      <div className={`p-4 bg-gradient-to-b ${cfg.bg} space-y-3`}>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          {item.edit_count > 0 && <span className="flex items-center gap-1"><Edit2 className="h-3 w-3" />{item.edit_count} edits</span>}
        </div>

        {/* Video AI Summary */}
        {item.is_video && videoSummary && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-background/60 border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" />AI Video Summary</p>
              <p className="text-sm leading-relaxed">{videoSummary}</p>
              {videoScore && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Score:</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: videoScore + '%' }} />
                  </div>
                  <span className="text-xs font-bold text-purple-600">{videoScore}</span>
                </div>
              )}
            </div>
            {videoSkills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Zap className="h-3 w-3" />Skills Detected</p>
                <div className="space-y-1.5">
                  {videoSkills.map((sk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs w-28 truncate font-medium">{sk.skill || sk}</span>
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: (sk.confidence || 70) + '%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{sk.confidence || 70}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {!item.blockchain_verified && (
            <Button size="sm" variant="outline" onClick={() => onVerify(item.file_id)} data-testid="verify-btn"
              className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20">
              <Shield className="h-3 w-3" />Verify
            </Button>
          )}
          {item.is_video && !item.ai_parsed && (
            <Button size="sm" variant="outline" onClick={() => onTranscribe(item.file_id)} disabled={transcribing[item.file_id]} data-testid="transcribe-btn"
              className="h-7 text-xs gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20">
              {transcribing[item.file_id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Brain className="h-3 w-3" />Transcribe</>}
            </Button>
          )}
          {!item.is_video && !item.ai_parsed && (
            <Button size="sm" variant="outline" onClick={() => onAIParse(item)} disabled={parsing} data-testid="ai-parse-btn"
              className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              {parsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Brain className="h-3 w-3" />AI Parse</>}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onView(fileInfo)} data-testid="view-file-btn"
            className="h-7 text-xs gap-1 ml-auto border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20">
            <Eye className="h-3 w-3" />View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} data-testid="expand-btn" className="h-7 text-xs gap-1">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(item.file_id)} data-testid="delete-btn"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-border/50 pt-3 space-y-3 animate-fade-in">
            {item.content_hash && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Hash className="h-3 w-3" />SHA-256 Hash</p>
                <code className="text-xs font-mono bg-background px-2 py-1 rounded border block truncate">{item.content_hash}</code>
              </div>
            )}
            {item.blockchain_tx && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Shield className="h-3 w-3 text-green-500" />Blockchain TX</p>
                <code className="text-xs font-mono bg-background px-2 py-1 rounded border block truncate">{item.blockchain_tx}</code>
                {item.blockchain_block && <p className="text-xs text-muted-foreground mt-0.5">ETH Block: #{item.blockchain_block}</p>}
              </div>
            )}
            {transcript && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Film className="h-3 w-3" />Transcript</p>
                <p className="text-xs text-muted-foreground bg-background p-2 rounded border max-h-24 overflow-y-auto leading-relaxed">{transcript}…</p>
              </div>
            )}
            {item.extracted_text && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" />Document Text</p>
                <p className="text-xs text-muted-foreground bg-background p-2 rounded border max-h-32 overflow-y-auto leading-relaxed">{item.extracted_text.slice(0, 800)}…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
    </>
  );
}

// ---- Profile Completion Gate ----
function ProfileGate({ user, requiredFields, profileData, role }) {
  const location = useLocation();
  const profilePath = `/${role}/profile`;
  const isOnProfile = location.pathname.includes('/profile');

  const missing = requiredFields.filter(f => !profileData || !profileData[f.key] || (Array.isArray(profileData[f.key]) ? profileData[f.key].length < 3 : String(profileData[f.key]).trim().length < 2));
  const completePct = Math.round(((requiredFields.length - missing.length) / requiredFields.length) * 100);
  const isComplete = missing.length === 0;

  if (isComplete || isOnProfile) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border-2 border-primary/30 shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5">
          <User className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile First</h2>
        <p className="text-muted-foreground text-sm mb-5">
          You must complete your profile to 100% before you can upload documents, post jobs, or access other features.
        </p>
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Profile Completion</span>
            <span className="font-bold text-primary">{completePct}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: completePct + '%' }} />
          </div>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 text-left mb-6 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Still needed:</p>
          {missing.map(f => (
            <div key={f.key} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              {f.label}
            </div>
          ))}
        </div>
        <Link to={profilePath}>
          <Button className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600">
            Complete My Profile <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

const CANDIDATE_REQUIRED_FIELDS = [
  { key: 'name',            label: 'Full Name' },
  { key: 'mobile',          label: 'Mobile Number' },
  { key: 'college',         label: 'College / University' },
  { key: 'talent_category', label: 'Talent Category' },
  { key: 'skills',          label: 'At least 3 skills' },
  { key: 'resume_text',     label: 'Professional Bio / Resume Summary' },
  { key: 'state',           label: 'State' },
  { key: 'city',            label: 'City' },
];
function ProfilePage({ user, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    email: user.email,
    name: user.name || '',
    talent_category: '',
    skills: '',
    experience_years: 0,
    resume_text: '',
    college: '',
    mobile: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    past_records: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeStep, setEmailChangeStep] = useState('input'); // 'input' | 'otp'
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getCandidateProfile(user.email);
      const p = res.data;
      setProfile({
        email: p.email,
        name: p.name || user.name || '',
        talent_category: p.talent_category || '',
        skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
        experience_years: p.experience_years || 0,
        resume_text: p.resume_text || '',
        college: p.college || '',
        mobile: p.mobile || '',
        address: p.address || '',
        country: p.country || 'India',
        state: p.state || '',
        city: p.city || '',
        past_records: p.past_records || '',
        linkedin: p.linkedin || '',
        github: p.github || '',
        portfolio: p.portfolio || ''
      });
      setEditHistory(Array.isArray(p.edit_history) ? p.edit_history : []);
    } catch {
      // New profile
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setProfile(p => ({ ...p, [key]: e.target ? e.target.value : e }));

  const handleSave = async () => {
    if (!profile.name.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      await api.createCandidateProfile({
        ...profile,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      toast.success('Profile saved!');
      if (onProfileUpdated) onProfileUpdated(profile.name);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
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
    } finally {
      setEmailChangeLoading(false);
    }
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
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const availableCities = getCitiesForState(profile.state);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const completeness = [profile.name, profile.mobile, profile.college, profile.talent_category, profile.skills, profile.resume_text, profile.linkedin].filter(Boolean).length;
  const completenessPct = Math.round((completeness / 7) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 text-3xl font-bold text-white flex-shrink-0">
              {(profile.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white">{profile.name || 'Your Name'}</h2>
              <p className="text-white/80 text-sm">{user.email}</p>
              {profile.talent_category && <p className="text-white/70 text-xs mt-0.5">{profile.talent_category}</p>}
              {editHistory.length > 0 && (
                <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />Edited {editHistory.length} times
                </p>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold text-white">{completenessPct}%</div>
              <p className="text-white/70 text-xs">Complete</p>
              <div className="w-20 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: completenessPct + '%' }} />
              </div>
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
                <span data-testid="profile-email">{user.email}</span>
                <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmailChange(!showEmailChange)} data-testid="change-email-btn" className="gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />Change
              </Button>
            </div>
            {showEmailChange && (
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 space-y-3">
                {emailChangeStep === 'input' ? (
                  <>
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2"><Lock className="h-4 w-4" />Enter your new email. We'll send a verification OTP.</p>
                    <div className="flex gap-2">
                      <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" className="flex-1" data-testid="new-email-input" />
                      <Button onClick={handleRequestEmailChange} disabled={emailChangeLoading} data-testid="send-email-otp-btn">
                        {emailChangeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2"><Mail className="h-4 w-4" />OTP sent to <strong>{newEmail}</strong>. Check inbox & spam.</p>
                    <div className="flex gap-2">
                      <Input value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="Enter 6-digit OTP" maxLength={6} className="flex-1 text-center text-lg tracking-widest" data-testid="email-change-otp-input" />
                      <Button onClick={handleVerifyEmailChange} disabled={emailChangeLoading || emailOtp.length !== 6} data-testid="verify-email-change-btn">
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
              <User className="h-3.5 w-3.5" />Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" />Full Name <span className="text-red-500">*</span></Label>
                <Input value={profile.name} onChange={set('name')} placeholder="e.g. Abhishek Sharma" data-testid="profile-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />Mobile Number <span className="text-red-500">*</span></Label>
                <Input value={profile.mobile} onChange={set('mobile')} placeholder="+91 9876543210" data-testid="profile-mobile" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><GraduationCap className="h-3 w-3 text-muted-foreground" />College / University <span className="text-red-500">*</span></Label>
                <Input value={profile.college} onChange={set('college')} placeholder="e.g. IIT Bombay" data-testid="profile-college" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />Location
            </h3>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm">Country</Label>
                <div className="px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>India</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">State <span className="text-red-500">*</span></Label>
                <Select key={`state-${profile.state}`} value={profile.state} onValueChange={v => setProfile(p => ({ ...p, state: v, city: '' }))}>
                  <SelectTrigger data-testid="profile-state">
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
                  <SelectTrigger data-testid="profile-city">
                    <SelectValue placeholder={profile.state ? "Select City" : "Select state first"}>{profile.city || (profile.state ? "Select City" : "Select state first")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award className="h-3.5 w-3.5" />Professional Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Talent Category <span className="text-red-500">*</span></Label>
                <Select value={profile.talent_category} onValueChange={v => setProfile(p => ({ ...p, talent_category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select your domain" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical (IT/Engineering)</SelectItem>
                    <SelectItem value="Creative">Creative (Design/Arts)</SelectItem>
                    <SelectItem value="Performance">Performance (Music/Drama)</SelectItem>
                    <SelectItem value="Sports">Sports and Athletics</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Research">Research and Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Years of Experience</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" max="50" value={profile.experience_years} onChange={e => setProfile(p => ({ ...p, experience_years: parseInt(e.target.value) || 0 }))} className="w-24" />
                  <span className="text-sm text-muted-foreground">years</span>
                  <div className="flex-1 flex gap-1">
                    {[0,1,2,3,5,8,10,15].map(yr => (
                      <button key={yr} onClick={() => setProfile(p => ({ ...p, experience_years: yr }))}
                        className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${profile.experience_years === yr ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-transparent hover:border-primary/30'}`}>
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills with Autocomplete */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />Skills <span className="text-red-500">*</span>
            </h3>
            <SkillTagInput value={profile.skills} onChange={v => setProfile(p => ({ ...p, skills: v }))} category={profile.talent_category} />
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />Bio & Records
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Professional Bio / Resume Summary <span className="text-red-500">*</span></Label>
                  <span className="text-xs text-muted-foreground">{(profile.resume_text || '').length} chars</span>
                </div>
                <Textarea value={profile.resume_text} onChange={set('resume_text')} rows={4}
                  placeholder="Describe your professional journey, key achievements, and what makes you stand out. Include your specialties, notable projects, and career goals. The more details you add, the better AI can assess your profile." />
                <p className="text-xs text-muted-foreground">Tip: Add your full resume text here for best AI analysis</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Past Records & Achievements</Label>
                  <span className="text-xs text-muted-foreground">{(profile.past_records || '').length} chars</span>
                </div>
                <Textarea value={profile.past_records} onChange={set('past_records')} rows={3}
                  placeholder="List awards, hackathons won, certifications, notable projects, publications, competitions, volunteering, sports records, or any standout accomplishments." />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />Social Links
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><Linkedin className="h-3 w-3 text-blue-600" />LinkedIn</Label>
                <Input value={profile.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><Github className="h-3 w-3" />GitHub</Label>
                <Input value={profile.github} onChange={set('github')} placeholder="github.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5"><Globe className="h-3 w-3 text-green-600" />Portfolio</Label>
                <Input value={profile.portfolio} onChange={set('portfolio')} placeholder="yourportfolio.com" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-base">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><CheckCircle className="h-4 w-4 mr-2" />Save Profile</>}
          </Button>
        </div>
      </Card>

      {editHistory.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />Edit History <Badge variant="secondary">{editHistory.length}</Badge>
          </h3>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {editHistory.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span>{new Date(h.edited_at).toLocaleString()}</span>
                <Badge variant="outline" className="text-xs">{h.edited_by || 'user'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---- Overview Page ----
function Overview({ user, onNameChange }) {
  const [profile, setProfile] = useState(null);
  const [walletItems, setWalletItems] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingOverview, setGeneratingOverview] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.getCandidateProfile(user.email).catch(() => null),
      api.getWalletItems(user.email).catch(() => ({ data: [] }))
    ]).then(([profileRes, walletRes]) => {
      if (profileRes) {
        setProfile(profileRes.data);
        setOverview(profileRes.data.ai_overview);
        if (profileRes.data.name && onNameChange) onNameChange(profileRes.data.name);
      }
      setWalletItems(walletRes.data);
    }).finally(() => setLoading(false));
  }, [user.email]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateOverview = async () => {
    setGeneratingOverview(true);
    toast.info('Generating AI overview… this may take 15-30 seconds');
    try {
      const res = await api.generateOverview(user.email);
      setOverview(res.data.overview);
      toast.success('AI Overview ready!');
      fetchData();
    } catch (err) {
      if (err.response?.status === 520 || err.code === 'ECONNABORTED') {
        toast.error('AI overview timed out. Please ensure your profile has text data and try again.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to generate overview');
      }
    } finally {
      setGeneratingOverview(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Loading your profile…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20 space-y-4 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <User className="h-12 w-12 text-primary/50" />
      </div>
      <h2 className="text-2xl font-bold">Set Up Your Profile First</h2>
      <p className="text-muted-foreground text-sm">Fill in your details to enable AI-powered talent matching</p>
      <Link to="/candidate/profile">
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
          Create Profile <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );

  const ov = overview || {};
  const skillScores = (profile.parsed_data?.skill_scores) || ov.skill_scores || {};
  const verifiedDocs = walletItems.filter(i => i.blockchain_verified).length;
  const videoDocs = walletItems.filter(i => i.is_video).length;
  const mainScore = ov.overall_score || profile.ai_score || profile.talent_score || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
          <div className="relative flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 text-4xl font-bold text-white flex-shrink-0">
              {(profile.name || user.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white truncate">{profile.name || user.name}</h1>
              <p className="text-white/80 mt-1 text-sm">{ov.headline || profile.talent_category || 'Talented Professional'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.college && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30"><GraduationCap className="h-3 w-3" />{profile.college}</span>}
                {profile.mobile && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30"><Phone className="h-3 w-3" />{profile.mobile}</span>}
                {profile.address && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30"><MapPin className="h-3 w-3" />{profile.address}</span>}
              </div>
              <div className="flex gap-3 mt-2">
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>}
                {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>}
                {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>}
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="text-5xl font-bold text-white">{mainScore}</div>
              <p className="text-white/70 text-xs">Overall Score</p>
              {ov.career_level && <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30">{ov.career_level}</span>}
              <button onClick={handleGenerateOverview} disabled={generatingOverview}
                className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs transition-all border border-white/30 disabled:opacity-50">
                {generatingOverview ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Refresh Score
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Documents', value: walletItems.length, icon: FileText, color: 'from-blue-500 to-blue-600' },
          { label: 'Verified', value: verifiedDocs, icon: Shield, color: 'from-green-500 to-green-600' },
          { label: 'Videos', value: videoDocs, icon: Video, color: 'from-purple-500 to-purple-600' },
          { label: 'Talent Score', value: profile.talent_score || 0, icon: Star, color: 'from-orange-500 to-orange-600' }
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4 overflow-hidden relative feature-card">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
              <div className="relative flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color}`}><Icon className="h-5 w-5 text-white" /></div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Overview Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />AI Profile Overview
          </h3>
          <Button onClick={handleGenerateOverview} disabled={generatingOverview} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" size="sm">
            {generatingOverview ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Analysing…</> : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />{overview ? 'Refresh Overview' : 'Generate AI Overview'}</>}
          </Button>
        </div>

        {overview ? (
          <div className="space-y-5">
            {ov.summary && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900">
                <p className="text-sm leading-relaxed">{ov.summary}</p>
              </div>
            )}

            {(ov.profile_completeness || ov.communication_score || ov.readiness_score) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: ov.profile_completeness, label: 'Profile', color: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
                  { value: ov.document_quality_score, label: 'Documents', color: 'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/20' },
                  { value: ov.communication_score, label: 'Communication', color: 'border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
                  { value: ov.readiness_score, label: 'Job Ready', color: 'border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/20' }
                ].map(sc => (
                  <div key={sc.label} className={`text-center p-3 rounded-xl border-2 ${sc.color}`}>
                    <div className={`text-2xl font-bold`}>{sc.value || '—'}</div>
                    <p className="text-xs font-medium mt-0.5">{sc.label}</p>
                    {sc.value && <Progress value={sc.value} className="h-1 mt-2" />}
                  </div>
                ))}
              </div>
            )}

            {Object.keys(skillScores).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-indigo-500" />Skill Confidence Scores</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(skillScores).slice(0, 10).map(([skill, score]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{skill}</span>
                        <span className="text-muted-foreground">{score}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: score + '%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {ov.strengths?.length > 0 && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
                  <h4 className="text-sm font-semibold mb-2 text-green-700 dark:text-green-400 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Strengths</h4>
                  <ul className="space-y-1.5">
                    {ov.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-green-700 dark:text-green-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ov.areas_for_improvement?.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                  <h4 className="text-sm font-semibold mb-2 text-orange-700 dark:text-orange-400 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />Areas to Improve</h4>
                  <ul className="space-y-1.5">
                    {ov.areas_for_improvement.map((a, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-orange-700 dark:text-orange-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {ov.recommended_roles?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Target className="h-4 w-4 text-indigo-500" />Recommended Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {ov.recommended_roles.map((r, i) => (
                    <Badge key={i} className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">{r}</Badge>
                  ))}
                </div>
              </div>
            )}

            {ov.badges?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Award className="h-4 w-4 text-yellow-500" />Achievement Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {ov.badges.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-medium shadow-sm">
                      <Award className="h-3 w-3" />{b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ov.insights && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground flex items-center gap-1.5 mb-1"><Brain className="h-4 w-4 text-purple-500" />AI Insights</strong>
                {ov.insights}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <p className="font-medium">No AI Overview Yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Generate AI Overview" to get your comprehensive AI-powered talent assessment</p>
            </div>
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 max-w-sm mx-auto">
              Tip: Upload your resume PDF and fill in your profile details first for the most accurate AI assessment
            </p>
          </div>
        )}
      </Card>

      {/* Skills display */}
      {profile.skills?.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-indigo-500" />Your Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <Badge key={i} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1">{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {profile.past_records && (
        <Card className="p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-yellow-500" />Achievements & Records</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.past_records}</p>
        </Card>
      )}

      {/* Score Improvement Tips */}
      <Card className="p-6 border-2 border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />How to Improve Your Score
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { done: !!(profile.resume_text && profile.resume_text.length > 100), label: 'Add detailed bio / resume text', tip: 'Go to Profile → Bio section. Paste your full resume text for best AI results.', points: '+8 pts' },
            { done: !!(profile.skills && profile.skills.length >= 5), label: 'Add at least 5 skills', tip: 'Go to Profile → Skills. Use the autocomplete suggestions to add relevant skills.', points: '+10 pts' },
            { done: walletItems.some(i => !i.is_video && i.item_type === 'resume'), label: 'Upload your resume PDF', tip: 'Go to Vault → Upload a PDF resume. AI will parse it automatically.', points: '+12 pts' },
            { done: walletItems.some(i => !i.is_video && i.ai_parsed), label: 'Run AI Parse on a document', tip: 'In Vault, click "AI Parse" on your uploaded resume or certificate.', points: '+15 pts' },
            { done: walletItems.some(i => i.is_video), label: 'Upload a video resume', tip: 'Record a 2–5 min video introducing yourself. AI scores your communication.', points: '+20 pts' },
            { done: walletItems.some(i => i.is_video && i.ai_parsed), label: 'Transcribe your video with AI', tip: 'After uploading a video, click "Transcribe" to get skills + communication score.', points: '+15 pts' },
            { done: verifiedDocs > 0, label: 'Verify a document on blockchain', tip: 'In Vault, click "Verify" on any document. This adds trusted proof to your profile.', points: '+10 pts' },
            { done: !!(profile.college && profile.mobile && profile.address), label: 'Complete personal details', tip: 'Go to Profile → add College, Mobile, and Location for a complete profile.', points: '+5 pts' },
            { done: !!(profile.linkedin || profile.github || profile.portfolio), label: 'Add social/portfolio links', tip: 'Go to Profile → Social Links. Add LinkedIn, GitHub, or Portfolio URL.', points: '+5 pts' },
            { done: !!overview, label: 'Generate AI Overview', tip: 'Click "Generate AI Overview" above to get your comprehensive talent assessment.', points: '+5 pts' },
          ].map((tip, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${tip.done ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-background border-border'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${tip.done ? 'bg-green-500' : 'bg-secondary border-2 border-muted-foreground/20'}`}>
                {tip.done ? <CheckCircle className="h-4 w-4 text-white" /> : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${tip.done ? 'line-through text-muted-foreground' : ''}`}>{tip.label}</p>
                  <span className={`text-xs font-bold flex-shrink-0 ${tip.done ? 'text-green-600' : 'text-indigo-600'}`}>{tip.done ? 'Done!' : tip.points}</span>
                </div>
                {!tip.done && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.tip}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks completed</span>
            <span className="font-bold text-indigo-600">
              {[
                !!(profile.resume_text && profile.resume_text.length > 100),
                !!(profile.skills && profile.skills.length >= 5),
                walletItems.some(i => !i.is_video && i.item_type === 'resume'),
                walletItems.some(i => !i.is_video && i.ai_parsed),
                walletItems.some(i => i.is_video),
                walletItems.some(i => i.is_video && i.ai_parsed),
                verifiedDocs > 0,
                !!(profile.college && profile.mobile && profile.address),
                !!(profile.linkedin || profile.github || profile.portfolio),
                !!overview,
              ].filter(Boolean).length} / 10
            </span>
          </div>
          <Progress value={[
            !!(profile.resume_text && profile.resume_text.length > 100),
            !!(profile.skills && profile.skills.length >= 5),
            walletItems.some(i => !i.is_video && i.item_type === 'resume'),
            walletItems.some(i => !i.is_video && i.ai_parsed),
            walletItems.some(i => i.is_video),
            walletItems.some(i => i.is_video && i.ai_parsed),
            verifiedDocs > 0,
            !!(profile.college && profile.mobile && profile.address),
            !!(profile.linkedin || profile.github || profile.portfolio),
            !!overview,
          ].filter(Boolean).length * 10} className="h-2 mt-2" />
        </div>
      </Card>
    </div>
  );
}

// ---- Vault Page ----
function VaultPage({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcribing, setTranscribing] = useState({});
  const [parsing, setParsing] = useState(false);
  const [parsingItemId, setParsingItemId] = useState(null);
  const [skillsDialog, setSkillsDialog] = useState(false);
  const [newSkills, setNewSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [itemType, setItemType] = useState('resume');
  const [filter, setFilter] = useState('all');
  const [viewingFile, setViewingFile] = useState(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const fetchItems = useCallback(() => {
    api.getWalletItems(user.email)
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.email]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e, isVideo) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = isVideo ? 200 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) { toast.error(`File too large! Max: ${maxSize / (1024 * 1024)}MB`); return; }
    setUploading(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('email', user.email);
      fd.append('item_type', isVideo ? 'video_resume' : itemType);
      await api.uploadWalletItem(fd, e => setUploadProgress(Math.round((e.loaded * 100) / e.total)));
      toast.success(`${file.name} uploaded!`);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false); setUploadProgress(0); e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this item from your vault?')) return;
    try {
      await api.deleteWalletItem(user.email, fileId);
      toast.success('Deleted');
      fetchItems();
    } catch { toast.error('Delete failed'); }
  };

  const handleVerify = async (fileId) => {
    try {
      const res = await api.verifyBlockchain(user.email, fileId);
      toast.success(`Verified on ETH! Block #${res.data.eth_block_number}`);
      fetchItems();
    } catch { toast.error('Verification failed'); }
  };

  const handleTranscribe = async (fileId) => {
    setTranscribing(p => ({ ...p, [fileId]: true }));
    toast.info('Transcribing video with AI… this takes 30-60 seconds');
    try {
      await api.transcribeVideo(user.email, fileId);
      toast.success('Video transcribed!');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transcription failed');
    } finally {
      setTranscribing(p => ({ ...p, [fileId]: false }));
    }
  };

  const handleAIParse = async (item) => {
    // Track which specific item is being parsed
    setParsingItemId(item.file_id);
    setParsing(true);
    toast.info('Starting AI analysis... This may take 20-30 seconds for image-based documents');
    try {
      const res = await api.parseFileWithVision(user.email, item.file_id);
      const foundSkills = res.data.new_skills || [];
      const fullParsedData = res.data.parsed_data || {};
      
      // Store parsed data for preview
      setParsedData(fullParsedData);
      
      if (foundSkills.length > 0) {
        // Show skills confirmation dialog
        setNewSkills(foundSkills);
        setSelectedSkills(foundSkills); // All selected by default
        setSkillsDialog(true);
        toast.success(`AI analysis complete! Found ${foundSkills.length} new skills`);
      } else {
        toast.success('AI analysis complete! No new skills found (all skills already in your profile)');
        // Still show dialog to display extracted content
        setNewSkills([]);
        setSelectedSkills([]);
        setSkillsDialog(true);
      }
      
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI parsing failed');
    } finally {
      setParsing(false);
      setParsingItemId(null);
    }
  };

  const handleConfirmSkills = async () => {
    if (selectedSkills.length === 0) {
      setSkillsDialog(false);
      toast.info('No skills added to profile');
      return;
    }
    
    try {
      const res = await api.confirmSkills(user.email, selectedSkills);
      toast.success(res.data.message);
      setSkillsDialog(false);
      fetchProfile(); // Refresh profile to show new skills
    } catch (err) {
      toast.error('Failed to add skills');
    }
  };

  const toggleSkillSelection = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRename = async (fileId, newName) => {
    if (!newName.trim()) { toast.error('File name cannot be empty'); return; }
    try {
      await api.renameWalletItem(user.email, fileId, newName.trim());
      toast.success('File renamed!');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Rename failed');
    }
  };

  const handleEditType = async (fileId, newType) => {
    try {
      await api.updateWalletItem(user.email, fileId, newType);
      toast.success('File type updated!');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const filteredItems = filter === 'all' ? items
    : filter === 'video' ? items.filter(i => i.is_video)
    : filter === 'verified' ? items.filter(i => i.blockchain_verified)
    : items.filter(i => i.item_type === filter);

  return (
    <>
    <div className="space-y-6 animate-fade-in">
      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          <Upload className="h-5 w-5 text-indigo-500" />Upload to Vault
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Document Type</Label>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="resume">Resume / CV</SelectItem>
                <SelectItem value="certificate">Certificate / Award</SelectItem>
                <SelectItem value="project">Project Document</SelectItem>
              </SelectContent>
            </Select>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
              onClick={() => fileInputRef.current?.click()}>
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold">Drop or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, DOC (max 20MB)</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e => handleUpload(e, false)} className="hidden" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Video Resume</Label>
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-100 dark:border-red-900 text-sm">
              <p className="font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5"><Film className="h-4 w-4" />Show your skills in action!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Record 2-5 min · AI transcribes & scores it</p>
            </div>
            <div className="border-2 border-dashed border-red-200 dark:border-red-800 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all group"
              onClick={() => videoInputRef.current?.click()}>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileVideo className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-semibold">Drop or click to upload video</p>
              <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI, WebM (max 200MB)</p>
            </div>
            <input ref={videoInputRef} type="file" accept=".mp4,.mov,.avi,.webm,.mkv,.flv" onChange={e => handleUpload(e, true)} className="hidden" />
          </div>
        </div>
        {uploading && (
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" />Uploading…</span>
              <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </Card>

      {/* Filter + Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Your Vault <Badge variant="secondary">{items.length} items</Badge>
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {['all','resume','certificate','project','video','verified'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold text-muted-foreground">{items.length === 0 ? 'Your vault is empty' : 'No items match this filter'}</p>
            <p className="text-sm text-muted-foreground mt-1">{items.length === 0 ? 'Upload documents, certificates, or a video resume above' : 'Try a different filter'}</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <VaultCard
                key={item.file_id}
                item={item}
                user={user}
                onDelete={handleDelete}
                onVerify={handleVerify}
                onTranscribe={handleTranscribe}
                onAIParse={handleAIParse}
                onRename={handleRename}
                onEditType={handleEditType}
                onView={setViewingFile}
                transcribing={transcribing}
                parsing={parsingItemId === item.file_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    {viewingFile && <FileViewerOverlay file={viewingFile} onClose={() => setViewingFile(null)} />}
    
    {/* Skills Confirmation Dialog */}
    <Dialog open={skillsDialog} onOpenChange={(open) => { 
      setSkillsDialog(open); 
      if (!open) { setParsedData(null); setNewSkills([]); setSelectedSkills([]); }
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Analysis Complete!
          </DialogTitle>
          <DialogDescription>
            {newSkills.length > 0 
              ? `AI found ${newSkills.length} new skills. Select which ones to add to your profile:`
              : 'AI analysis complete. Review the extracted information below:'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Skills Selection */}
          {newSkills.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-3 block">New Skills Discovered</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {newSkills.map((skill, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleSkillSelection(skill)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-300 dark:border-purple-700'
                        : 'bg-muted/30 border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSkills.includes(skill)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-muted-foreground/30'
                      }`}>
                        {selectedSkills.includes(skill) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span>{selectedSkills.length} of {newSkills.length} selected</span>
              </div>
            </div>
          )}

          {/* Extracted Content Preview */}
          {parsedData && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Extracted Information from Document
              </Label>

              {/* Summary */}
              {parsedData.summary && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Professional Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
                </Card>
              )}

              {/* Extracted Text Preview */}
              {parsedData.extracted_text && (
                <Card className="p-4 bg-muted/30">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Text Preview
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono bg-background p-3 rounded border max-h-[150px] overflow-y-auto">
                    {parsedData.extracted_text.slice(0, 500)}
                    {parsedData.extracted_text.length > 500 && '...'}
                  </p>
                </Card>
              )}

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    Education
                  </h4>
                  <div className="space-y-2">
                    {parsedData.education.slice(0, 3).map((edu, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium">{edu.degree || 'Degree'}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution || 'Institution'} {edu.year && `• ${edu.year}`}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Experience */}
              {parsedData.experience && parsedData.experience.length > 0 && (
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-600" />
                    Experience
                  </h4>
                  <div className="space-y-3">
                    {parsedData.experience.slice(0, 2).map((exp, idx) => (
                      <div key={idx} className="text-sm border-l-2 border-orange-200 pl-3">
                        <p className="font-medium">{exp.title || 'Position'}</p>
                        <p className="text-xs text-muted-foreground">{exp.company || 'Company'} {exp.duration && `• ${exp.duration}`}</p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground mt-1">{exp.description.slice(0, 100)}...</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* All Skills Found */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    All Skills Found ({parsedData.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Talent Score */}
              {parsedData.overall_talent_score && (
                <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    AI Talent Assessment
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-purple-600">{parsedData.overall_talent_score}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                          style={{ width: `${parsedData.overall_talent_score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Overall Talent Score</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
        
        {/* Always visible buttons at bottom */}
        <div className="border-t pt-4 mt-auto flex-shrink-0">
          {newSkills.length > 0 ? (
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedSkills([]);
                  setSkillsDialog(false);
                  setParsedData(null);
                  toast.info('No skills added');
                }}
                variant="outline"
                className="flex-1"
                data-testid="skip-skills-btn"
              >
                Skip
              </Button>
              <Button
                onClick={handleConfirmSkills}
                disabled={selectedSkills.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                data-testid="confirm-skills-btn"
              >
                Add {selectedSkills.length} Skill{selectedSkills.length !== 1 ? 's' : ''}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setSkillsDialog(false);
                  setParsedData(null);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                data-testid="close-dialog-btn"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

// ---- Main Dashboard ----
export default function CandidateDashboard({ user, setUser }) {
  const location = useLocation();
  const [profileName, setProfileName] = useState(user.name);
  const [profileData, setProfileData] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Fetch profile on mount for gate check
  useEffect(() => {
    api.getCandidateProfile(user.email)
      .then(res => { setProfileData(res.data); if (res.data?.name) setProfileName(res.data.name); })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, [user.email]);

  const updateName = (name, newProfileData) => {
    setProfileName(name);
    if (newProfileData) setProfileData(newProfileData);
    else {
      // Re-fetch profile data to update the gate
      api.getCandidateProfile(user.email).then(r => setProfileData(r.data)).catch(() => {});
    }
    setProfileName(name);
    // Also persist to App.js user state so it survives navigation/refresh
    if (setUser && name) {
      setUser(prev => {
        const updated = { ...prev, name };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const isActive = (path) =>
    location.pathname === path || (path === '/candidate' && location.pathname === '/candidate/');

  const navItems = [
    { to: '/candidate', icon: Home, label: 'Overview' },
    { to: '/candidate/vault', icon: Wallet, label: 'Vault' },
    { to: '/candidate/profile', icon: User, label: 'Profile' },
    { to: '/candidate/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="candidate-dashboard">
      {profileLoaded && (
        <ProfileGate user={user} requiredFields={CANDIDATE_REQUIRED_FIELDS} profileData={profileData} role="candidate" />
      )}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Talent Scout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {(profileName || '?').charAt(0).toUpperCase()}
              </div>
              <span className="font-medium truncate max-w-[120px]">{profileName}</span>
            </div>
            <NotificationBell userEmail={user.email} />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => { setUser(null); localStorage.removeItem('user'); }} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link key={item.to} to={item.to}>
                    <Button variant={active ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 h-10 transition-all hover:translate-x-1 ${active ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900' : ''}`}>
                      <Icon className="h-4 w-4" /><span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-4">
            <Routes>
              <Route path="/" element={<Overview user={user} onNameChange={updateName} />} />
              <Route path="/vault" element={<VaultPage user={user} />} />
              <Route path="/profile" element={<ProfilePage user={user} onProfileUpdated={updateName} />} />
              <Route path="/settings" element={<Settings user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
