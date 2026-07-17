import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ChatMessage, 
  ZoneStatus, 
  TransportationStatus, 
  WayfindingInfo, 
  SustainabilityScore 
} from '../types';
import { Trophy, Accessibility } from 'lucide-react';

// Import panel components
import WayfindingPanel from './fan/WayfindingPanel';
import CrowdStatusPanel from './fan/CrowdStatusPanel';
import SustainabilityPanel from './fan/SustainabilityPanel';
import ChatConcierge from './fan/ChatConcierge';
import TransportPanel from './fan/TransportPanel';
import HeroBanner from './fan/HeroBanner';

import TournamentHub from './TournamentHub';

interface FanViewProps {
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
}

/**
 * FanView Component
 *
 * Renders the comprehensive modern Fan Companion Web Interface.
 * Orchestrates Wayfinding, real-time Crowd densities, sustainable item scans,
 * AI Chat concierge, real-time transit status, and the World Cup slideshow hub.
 *
 * @param props The props for the component.
 * @returns The main Fan dashboard layout.
 */
export default function FanView({ accessibilityMode, setAccessibilityMode }: FanViewProps) {
  // CSRF Token State
  const [csrfToken, setCsrfToken] = useState<string>('');
  
  // Shared & Local State
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityScore>({
    userId: '',
    score: 0,
    itemsScanned: 0,
    updatedAt: ''
  });

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'assistant', text: 'Welcome to StadiumPulse AI! Ask me anything about seat wayfinding, gates, food, restrooms, or match schedules. I will reply in your language!', timestamp: new Date().toISOString() }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Voice State
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [voiceOutputActive, setVoiceOutputActive] = useState(false);
  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  // Stadium Wayfinding State
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedWayfinding, setSelectedWayfinding] = useState<WayfindingInfo | null>(null);

  // Live Crowd Status State
  const [crowdZones, setCrowdZones] = useState<ZoneStatus[]>([]);
  const [crowdRecommendation, setCrowdRecommendation] = useState<string>('Gates are currently operating normally. Gate C is recommended for fastest entry.');
  const [isCrowdLoading, setIsCrowdLoading] = useState(false);

  // Transportation State
  const [transports, setTransports] = useState<TransportationStatus[]>([]);
  const [userLocationInput, setUserLocationInput] = useState('');
  const [transitRouteSuggestion, setTransitRouteSuggestion] = useState<string>('');
  const [isTransitLoading, setIsTransitLoading] = useState(false);

  // Sustainability State
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{
    category: string;
    itemName: string;
    scoreAwarded: number;
    correctBin: string;
    ecoTip: string;
  } | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');

  // Hero Slides Carousel State
  const [heroSlide, setHeroSlide] = useState(0);

  // Tournament Hub Drawer State
  const [isTournamentHubOpen, setIsTournamentHubOpen] = useState(false);
  const [tournamentHubTab, setTournamentHubTab] = useState<'matches' | 'news' | 'standings' | 'players' | 'bracket'>('matches');

  // Auto rotate slides every 7 seconds
  useEffect(() => {
    if (accessibilityMode) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(interval);
  }, [accessibilityMode]);

  // Ref for chat auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 0. Fetch CSRF Token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = (await response.json()) as { token?: string };
        if (data && typeof data.token === 'string') {
          setCsrfToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    void fetchCsrfToken();
  }, []);

  // 1. Initialize sessionUserId and fetch/create Score doc
  useEffect(() => {
    let uId: string | null = null;
    try {
      uId = localStorage.getItem('stadiumpulse_session_uid');
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
    if (!uId) {
      uId = 'fan_' + Math.random().toString(36).substring(2, 11);
      try {
        localStorage.setItem('stadiumpulse_session_uid', uId);
      } catch (e) {
        console.warn('localStorage writing is not accessible:', e);
      }
    }
    setSessionUserId(uId);

    // Set up Firestore listener for this user's sustainability score
    const scoreDocRef = doc(db, 'sustainability_scores', uId);
    const unsubscribe = onSnapshot(scoreDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSustainabilityData(docSnap.data() as SustainabilityScore);
      } else {
        const initialScore: SustainabilityScore = {
          userId: uId,
          score: 0,
          itemsScanned: 0,
          updatedAt: new Date().toISOString()
        };
        setDoc(scoreDocRef, initialScore).catch((err) => {
          console.warn('Failed to set initial sustainability score in Firestore:', err);
        });
        setSustainabilityData(initialScore);
      }
    }, (error) => {
      console.warn('Sustainability score subscription error (might be unauthenticated or offline):', error);
      // Fallback: set basic local initial score
      setSustainabilityData({
        userId: uId || 'unknown_user',
        score: 0,
        itemsScanned: 0,
        updatedAt: new Date().toISOString()
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Listeners for Crowd Status and Transportation
  useEffect(() => {
    const crowdColRef = collection(db, 'crowd_status');
    const unsubscribeCrowd = onSnapshot(crowdColRef, (querySnap) => {
      const zones: ZoneStatus[] = [];
      querySnap.forEach((docSnap) => {
        zones.push(docSnap.data() as ZoneStatus);
      });
      setCrowdZones(zones);
    }, (error) => {
      console.warn('Crowd status subscription error (might be unauthenticated or offline):', error);
    });

    const transColRef = collection(db, 'transportation');
    const unsubscribeTrans = onSnapshot(transColRef, (querySnap) => {
      const items: TransportationStatus[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as TransportationStatus);
      });
      setTransports(items);
    }, (error) => {
      console.warn('Transportation status subscription error (might be unauthenticated or offline):', error);
    });

    return () => {
      unsubscribeCrowd();
      unsubscribeTrans();
    };
  }, []);

  // 3. Debounced/Interval Fetch for Live AI Crowd Recommendation (every 15 seconds)
  useEffect(() => {
    if (crowdZones.length === 0) return;

    const generateRecommendation = async () => {
      try {
        setIsCrowdLoading(true);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            message: `Analyze this current crowd densities of gates at the World Cup Stadium and give a 1-line friendly routing suggestion: ${crowdZones.map(z => `${z.name}: ${z.density} density (${z.count} fans)`).join(', ')}`
          })
        });
        const data = (await response.json()) as { reply?: string };
        if (data && typeof data.reply === 'string') {
          setCrowdRecommendation(data.reply);
        }
      } catch (err) {
        console.warn('Error generating crowd recommendation:', err);
      } finally {
        setIsCrowdLoading(false);
      }
    };

    // First immediate call, then every 15 seconds
    void generateRecommendation();
    const interval = setInterval(() => {
      void generateRecommendation();
    }, 15000);

    return () => clearInterval(interval);
  }, [crowdZones.length, csrfToken]); 

  // 4. Scroll Chat to Bottom
  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 5. Speak Text (Accessibility speech out)
  const speakText = (text: string) => {
    if (!voiceOutputActive) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Text to speech failed:', e);
    }
  };

  // 6. Handle Wayfinding map clicks
  const handleMapSectionClick = (info: WayfindingInfo) => {
    setSelectedSection(info.section);
    setSelectedWayfinding(info);
    speakText(`Section ${info.section}. Nearest entry gate is ${info.nearestGate}. Nearest restrooms are ${info.nearestRestroom}.`);
  };

  // 7. Text-to-Speech Output Toggle
  const toggleVoiceOutput = () => {
    const nextState = !voiceOutputActive;
    setVoiceOutputActive(nextState);
    if (nextState) {
      const u = new SpeechSynthesisUtterance("Voice output activated. I will read response messages out loud.");
      window.speechSynthesis.speak(u);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  // 8. Speech-to-Text Input Toggle
  const toggleVoiceInput = () => {
    if (voiceInputActive) {
      recognitionRef.current?.stop();
      setVoiceInputActive(false);
      return;
    }

    type SpeechRecognitionConstructor = new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onstart: () => void;
      onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
      onerror: (e: unknown) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };
    const win = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please type your message.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceInputActive(true);
    };

    recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognition.onerror = (e: unknown) => {
      console.error('Speech recognition error:', e);
      setVoiceInputActive(false);
    };

    recognition.onend = () => {
      setVoiceInputActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // 9. Send Chat message
  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    
    const userMsgObj: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMsgObj]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages
        })
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (response.ok && typeof data.reply === 'string') {
        const assistantMsgObj: ChatMessage = {
          id: 'msg_' + (Date.now() + 1),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, assistantMsgObj]);
        speakText(data.reply);
      } else {
        throw new Error(data.error || 'Failed to get chat response.');
      }
    } catch (error) {
      console.warn(error);
      setChatMessages(prev => [...prev, {
        id: 'error_' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 10. Fetch transit suggestions from stated location
  const handleGetTransitSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocationInput.trim() || isTransitLoading) return;

    setIsTransitLoading(true);
    try {
      const queryPrompt = `Based on my location "${userLocationInput}", recommend the best stadium transit path using the following live transportation statuses: ${transports.map(t => `${t.name} is ${t.status} with ETA ${t.eta}`).join(', ')}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ message: queryPrompt })
      });
      const data = (await response.json()) as { reply?: string };
      if (data && typeof data.reply === 'string') {
        setTransitRouteSuggestion(data.reply);
      } else {
        throw new Error();
      }
    } catch {
      setTransitRouteSuggestion('Unable to retrieve transit suggestions. Please check your network and try again.');
    } finally {
      setIsTransitLoading(false);
    }
  };

  // 11. Handle Sustainability Image Upload/Classify
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanMessage('Invalid file type. Please upload an image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => {
      setIsClassifying(true);
      setScanMessage('Reading file...');
    };
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        setScanMessage('Analyzing with Gemini Vision...');
        
        const response = await fetch('/api/classify-item', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            imageBase64: base64String,
            mimeType: file.type
          })
        });

        const data = (await response.json()) as {
          category?: string;
          itemName?: string;
          scoreAwarded?: number;
          correctBin?: string;
          error?: string;
        };
        if (response.ok && typeof data.category === 'string') {
          setClassificationResult({
            category: data.category,
            itemName: data.itemName || 'Item',
            scoreAwarded: data.scoreAwarded || 10,
            correctBin: data.correctBin || 'Bin',
            ecoTip: 'Keep up the sustainable work!'
          });
          setScanMessage(`Success! Identified ${data.itemName || 'item'}.`);
          
          const docRef = doc(db, 'sustainability_scores', sessionUserId);
          await setDoc(docRef, {
            userId: sessionUserId,
            score: increment(data.scoreAwarded || 10),
            itemsScanned: increment(1),
            updatedAt: new Date().toISOString()
          }, { merge: true });

          speakText(`Item identified as ${data.category}. Dispose in the ${data.correctBin || 'correct bin'}. You earned ${data.scoreAwarded || 10} sustainability points!`);
        } else {
          throw new Error(data.error || 'Failed to classify.');
        }
      } catch (err) {
        console.warn(err);
        setScanMessage('Failed to scan item. Please check your image and try again.');
      } finally {
        setIsClassifying(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Theme & Style Classes
  const themeClasses = accessibilityMode ? 'bg-black text-white' : 'bg-[#080913] text-zinc-300';
  const cardClasses = accessibilityMode 
    ? 'p-6 border-4 border-white bg-black' 
    : 'p-5 rounded-2xl border border-zinc-800/50 bg-zinc-950/30 backdrop-blur-lg shadow-xl';
  const headingSize = accessibilityMode ? 'text-2xl font-black mb-3' : 'text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-white';

  return (
    <div className={`space-y-6 ${themeClasses}`}>
      
      {/* 1. ACCESSIBILITY TOGGLE LANDMARK BAR */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 relative z-10 ${accessibilityMode ? 'border-b-4 border-white bg-black' : 'bg-zinc-900/15 backdrop-blur-md border border-zinc-800/50 rounded-xl'}`}>
        <div className="flex items-center gap-2">
          <Accessibility className={`w-5 h-5 ${accessibilityMode ? 'text-yellow-400' : 'text-zinc-300'}`} />
          <span className={accessibilityMode ? 'text-xl font-black text-yellow-400' : 'text-sm font-medium text-zinc-300'}>
            Accessibility Center (WCAG 2.1 AA Compliant)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setTournamentHubTab('matches'); setIsTournamentHubOpen(true); }}
            className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 focus:ring-4 focus:ring-emerald-400 ${accessibilityMode ? 'bg-white text-black border-2 border-black font-black uppercase' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'}`}
            aria-label="Open World Cup 2026 Tournament Hub Drawer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Tournament Hub</span>
          </button>
          <button
            id="accessibility-mode-toggle"
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 focus:ring-4 focus:ring-yellow-400 ${accessibilityMode ? 'bg-yellow-400 text-black' : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 border border-zinc-800/40'}`}
            aria-label="Toggle Full Accessibility Mode: High Contrast Theme, Large Text, Keyboard Focus Enhancements."
          >
            <span>Accessibility Mode:</span>
            <span className={accessibilityMode ? 'text-black' : 'text-zinc-400'}>
              {accessibilityMode ? 'ACTIVE' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* EXQUISITE COMMERCIAL WORLD CUP HERO BANNER */}
      {!accessibilityMode && (
        <HeroBanner
          heroSlide={heroSlide}
          setHeroSlide={setHeroSlide}
          setTournamentHubTab={setTournamentHubTab}
          setIsTournamentHubOpen={setIsTournamentHubOpen}
        />
      )}

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6" role="main">
        
        {/* LEFT COLUMN: Map & Wayfinding + Crowd Status + Sustainability (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <WayfindingPanel
            accessibilityMode={accessibilityMode}
            csrfToken={csrfToken}
            sessionUserId={sessionUserId}
            cardClasses={cardClasses}
            headingSize={headingSize}
            selectedSection={selectedSection}
            selectedWayfinding={selectedWayfinding}
            onSectionSelect={handleMapSectionClick}
          />

          <CrowdStatusPanel
            accessibilityMode={accessibilityMode}
            csrfToken={csrfToken}
            sessionUserId={sessionUserId}
            cardClasses={cardClasses}
            headingSize={headingSize}
            crowdZones={crowdZones}
            crowdRecommendation={crowdRecommendation}
            isCrowdLoading={isCrowdLoading}
          />

          <SustainabilityPanel
            accessibilityMode={accessibilityMode}
            csrfToken={csrfToken}
            sessionUserId={sessionUserId}
            cardClasses={cardClasses}
            headingSize={headingSize}
            sustainabilityData={sustainabilityData}
            isClassifying={isClassifying}
            classificationResult={classificationResult}
            scanMessage={scanMessage}
            onImageFileChange={handleImageFileChange}
          />
        </div>

        {/* RIGHT COLUMN: AI Concierge Chat + Transport Advice (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ChatConcierge
            accessibilityMode={accessibilityMode}
            csrfToken={csrfToken}
            sessionUserId={sessionUserId}
            cardClasses={cardClasses}
            headingSize={headingSize}
            chatInput={chatInput}
            chatMessages={chatMessages}
            isChatLoading={isChatLoading}
            voiceInputActive={voiceInputActive}
            voiceOutputActive={voiceOutputActive}
            onChatInputChange={setChatInput}
            onSendChat={(e) => { void handleSendChat(e); }}
            onToggleVoiceInput={toggleVoiceInput}
            onToggleVoiceOutput={toggleVoiceOutput}
          />

          <TransportPanel
            accessibilityMode={accessibilityMode}
            csrfToken={csrfToken}
            sessionUserId={sessionUserId}
            cardClasses={cardClasses}
            headingSize={headingSize}
            transports={transports}
            userLocationInput={userLocationInput}
            transitRouteSuggestion={transitRouteSuggestion}
            isTransitLoading={isTransitLoading}
            onLocationInputChange={setUserLocationInput}
            onGetTransitSuggestions={(e) => { void handleGetTransitSuggestions(e); }}
          />
        </div>
      </main>

      {/* Tournament Hub Drawer */}
      <TournamentHub
        isOpen={isTournamentHubOpen}
        onClose={() => setIsTournamentHubOpen(false)}
        defaultTab={tournamentHubTab}
      />
    </div>
  );
}
