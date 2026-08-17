'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Switch } from './ui/Switch';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
];

const EMERGENCY_PHRASES = {
  en: ['Help me', 'Emergency', 'Trapped', 'Fire', 'Flood', 'Earthquake', 'Need rescue', 'Medical emergency'],
  hi: ['मदद करो', 'आपातकाल', 'फंसे हुए', 'आग', 'बाढ़', 'भूकंप', 'बचाव चाहिए', 'चिकित्सा आपातकाल'],
  ta: ['உதவி', 'அவசரம்', 'கുടுங்கிய', 'தீ', 'வெள்ளம்', 'நிலநடுக்கம்', 'இயக்கம் வேண்டும்', 'மருத்துவ அவசரம்'],
  bn: ['সাহায্য', 'জরুরি', 'আটকে যাওয়া', 'আগুন', 'বন্যা', 'ভূচাল', 'উদ্ধার দরকার', 'চিকিত্সা জরুরি'],
  es: ['Ayuda', 'Emergencia', 'Atrapado', 'Incendio', 'Inundación', 'Terremoto', 'Necesito rescate', 'Emergencia médica'],
  fr: ['Aidez-moi', 'Urgence', 'Coincé', 'Incendie', 'Inondation', 'Séisme', 'Besoin de secours', 'Urgence médicale'],
};

export function CitizenSOSPortal() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [offlineMode, setOfflineMode] = useState(false);
  const [smsFallback, setSmsFallback] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ incidentId: string; priority: string; eta: string } | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { listening, transcript, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    language,
    onResult: (text) => setMessage(text),
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 40.7128, lng: -74.0060 })
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: detectIncidentType(message),
          title: `Citizen SOS - ${message.substring(0, 50)}`,
          description: message,
          latitude: location?.lat || 40.7128,
          longitude: location?.lng || -74.0060,
          severity: calculateSeverity(message),
          language,
          keywords: extractKeywords(message),
          reported_by: 'citizen-portal',
        }),
      });
      const data = await res.json();
      setResult({
        incidentId: data.incident_id,
        priority: data.priority,
        eta: data.estimated_response_time,
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      console.error('SOS submission failed:', err);
      alert('Failed to submit SOS. Please try again or use SMS fallback.');
    } finally {
      setSubmitting(false);
    }
  };

  const detectIncidentType = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('flood') || lower.includes('water') || lower.includes('बाढ़') || lower.includes('வெள்ளம்') || lower.includes('বন্যা')) return 'flood';
    if (lower.includes('fire') || lower.includes('burn') || lower.includes('आग') || lower.includes('தீ') || lower.includes('আগুন')) return 'fire';
    if (lower.includes('quake') || lower.includes('shak') || lower.includes('भूकंप') || lower.includes('நிலநடுக்கம்') || lower.includes('ভূচাল')) return 'earthquake';
    if (lower.includes('hurricane') || lower.includes('cyclone') || lower.includes('तूफान') || lower.includes('পুয়ল') || lower.includes('huracán')) return 'hurricane';
    if (lower.includes('landslide') || lower.includes('mudslide') || lower.includes('भूस्खलन') || lower.includes('மணlide') || lower.includes('ভূপতন')) return 'landslide';
    return 'other';
  };

  const calculateSeverity = (text: string) => {
    const urgentWords = ['trapped', 'dying', 'critical', 'emergency', 'urgent', 'help', 'sos', 'collapsed', 'buried', 'bleeding', 'unconscious'];
    const matches = urgentWords.filter(w => text.toLowerCase().includes(w)).length;
    return Math.min(5 + matches * 2, 10);
  };

  const extractKeywords = (text: string) => {
    const keywords = ['help', 'emergency', 'trapped', 'urgent', 'sos', 'rescue', 'evacuate', 'injured', 'dying', 'critical'];
    return keywords.filter(k => text.toLowerCase().includes(k));
  };

  const handleVoiceInput = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const insertEmergencyPhrase = (phrase: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + phrase);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Citizen SOS Portal</h2>
          <p className="text-slate-400 mt-1">Emergency reporting with multilingual voice-to-text</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="emerald" className="text-sm">{browserSupportsSpeechRecognition ? 'Voice Ready' : 'Voice Unavailable'}</Badge>
          <Badge variant={offlineMode ? 'amber' : 'emerald'} className="text-sm">
            {offlineMode ? 'Offline Mode' : 'Online'}
          </Badge>
        </div>
      </div>

      <Card className="glass-panel-emerald">
        <h3 className="text-lg font-semibold text-white mb-4">Report Emergency</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
              <Select
                value={language}
                onValueChange={setLanguage}
                options={LANGUAGES.map(l => ({ value: l.code, label: `${l.flag} ${l.name} (${l.native})` }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <Input
                value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Detecting...'}
                readOnly
                className="bg-slate-800/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Emergency Message {listening && <span className="text-emerald-400 ml-2 animate-pulse">🎙️ Listening...</span>}
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Describe your emergency... (e.g., 'Trapped in basement, water rising fast, family of 4')"
                aria-label="Emergency description"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                  listening
                    ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/30 animate-pulse-glow'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                disabled={!browserSupportsSpeechRecognition}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={listening ? "M6 18L18 6M6 6l12 12" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6m-6 0h.01M19 11l-5 5m0 0l-5-5m5 5v12"} />
                </svg>
              </button>
            </div>
            {listening && (
              <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center">Quick phrases:</span>
            {EMERGENCY_PHRASES[language as keyof typeof EMERGENCY_PHRASES]?.slice(0, 6).map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertEmergencyPhrase(phrase)}
                className="px-3 py-1 text-xs rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Switch
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
              label="Offline Mode (Store & Sync)"
            />
            <Switch
              checked={smsFallback}
              onCheckedChange={setSmsFallback}
              label="SMS Fallback"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" variant="danger" disabled={submitting || !message.trim()}>
            {submitting ? 'Sending SOS...' : '🚨 SEND SOS ALERT'}
          </Button>
        </form>
      </Card>

      {submitted && result && (
        <Card className="glass-panel-crimson animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">SOS Submitted Successfully</h3>
            <Badge variant="crimson">PRIORITY: {result.priority.toUpperCase()}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="glass-panel p-4 rounded-lg">
              <p className="text-xs text-slate-400">Incident ID</p>
              <p className="font-mono text-lg font-bold text-white">{result.incidentId}</p>
            </div>
            <div className="glass-panel p-4 rounded-lg">
              <p className="text-xs text-slate-400">Priority</p>
              <p className="font-bold text-lg text-crimson-400">{result.priority.toUpperCase()}</p>
            </div>
            <div className="glass-panel p-4 rounded-lg">
              <p className="text-xs text-slate-400">Est. Response</p>
              <p className="font-bold text-lg text-emerald-400">{result.eta}</p>
            </div>
          </div>
          <div className="mt-4 text-center text-slate-400">
            <p>Help is on the way. Stay calm and stay safe.</p>
          </div>
          <Button onClick={() => setSubmitted(false)} variant="secondary" className="mt-4 w-full">
            Report Another Emergency
          </Button>
        </Card>
      )}

      <Card className="glass-panel">
        <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard step="1" title="Speak or Type" desc="Use voice-to-text in your language or type your emergency" icon="Mic" />
          <StepCard step="2" title="AI Analysis" desc="Our AI detects incident type, severity, and priority automatically" icon="Brain" />
          <StepCard step="3" title="Instant Dispatch" desc="Nearest rescue units notified with your exact location" icon="Truck" />
        </div>
      </Card>
    </div>
  );
}

function StepCard({ step, title, desc, icon }: { step: string; title: string; desc: string; icon: string }) {
  const icons: Record<string, JSX.Element> = {
    Mic: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6m-6 0h.01M19 11l-5 5m0 0l-5-5m5 5v12" /></svg>,
    Brain: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Truck: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 1a1 1 0 001 1h1M5 17a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>,
  };

  return (
    <div className="glass-panel p-5 rounded-xl text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <span className="text-2xl font-bold">{step}</span>
      </div>
      <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center text-emerald-400">
        {icons[icon]}
      </div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}