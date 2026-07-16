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

// Static image imports for production build asset compilation
import messiKissingTrophy from '../assets/images/messi_kissing_trophy_1783343437487.jpg';
import ronaldoTunnelCrying from '../assets/images/ronaldo_tunnel_crying_1783343479370.jpg';
import neymarBrazilFocus from '../assets/images/neymar_brazil_focus_1783343496361.jpg';
import argentina2022WcPhoto from '../assets/images/argentina_2022_wc_1784115847868.jpg';
import TournamentHub from './TournamentHub';

interface FanViewProps {
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
}

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
  const recognitionRef = useRef<any>(null);

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
  const [classificationResult, setClassificationResult] = useState<any>(null);
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
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    fetchCsrfToken();
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
        setDoc(scoreDocRef, initialScore);
        setSustainabilityData(initialScore);
      }
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
    });

    const transColRef = collection(db, 'transportation');
    const unsubscribeTrans = onSnapshot(transColRef, (querySnap) => {
      const items: TransportationStatus[] = [];
      querySnap.forEach((docSnap) => {
        items.push(docSnap.data() as TransportationStatus);
      });
      setTransports(items);
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
        const data = await response.json();
        if (data.reply) {
          setCrowdRecommendation(data.reply);
        }
      } catch (err) {
        console.warn('Error generating crowd recommendation:', err);
      } finally {
        setIsCrowdLoading(false);
      }
    };

    // First immediate call, then every 15 seconds
    generateRecommendation();
    const interval = setInterval(generateRecommendation, 15000);

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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognition.onerror = (e: any) => {
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

      const data = await response.json();
      if (response.ok && data.reply) {
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
    } catch (error: any) {
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
      const data = await response.json();
      if (data.reply) {
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
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const data = await response.json();
        if (response.ok && data.category) {
          setClassificationResult(data);
          setScanMessage(`Success! Identified ${data.itemName}.`);
          
          const docRef = doc(db, 'sustainability_scores', sessionUserId);
          await setDoc(docRef, {
            userId: sessionUserId,
            score: increment(data.scoreAwarded || 10),
            itemsScanned: increment(1),
            updatedAt: new Date().toISOString()
          }, { merge: true });

          speakText(`Item identified as ${data.category}. Dispose in the ${data.correctBin}. You earned ${data.scoreAwarded} sustainability points!`);
        } else {
          throw new Error(data.error || 'Failed to classify.');
        }
      } catch (err: any) {
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
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-[#02040a] shadow-2xl min-h-[340px] flex flex-col justify-end p-6 md:p-8">
          
          {/* SLIDES */}
          {[
            {
              id: 0,
              image: messiKissingTrophy,
              match: "ARG vs POR • STADIUM FEED",
              score: "2 - 1",
              time: "78' SEC HALF",
              teamA: "ARG",
              teamB: "POR",
              flagA: "🇦🇷",
              flagB: "🇵🇹",
              color: "from-blue-600/10"
            },
            {
              id: 1,
              image: ronaldoTunnelCrying,
              match: "POR vs MAR • HISTORIC TUNNEL",
              score: "0 - 1",
              time: "FULL TIME",
              teamA: "POR",
              teamB: "MAR",
              flagA: "🇵🇹",
              flagB: "🇲🇦",
              color: "from-purple-600/10"
            },
            {
              id: 2,
              image: neymarBrazilFocus,
              match: "BRA vs GER • LIVE",
              score: "1 - 1",
              time: "34' FIRST HALF",
              teamA: "BRA",
              teamB: "GER",
              flagA: "🇧🇷",
              flagB: "🇩🇪",
              color: "from-emerald-600/10"
            },
            {
              id: 3,
              image: argentina2022WcPhoto,
              match: "ARG vs FRA • 2022 WORLD CUP CHAMPIONS",
              score: "3(4) - 3(2)",
              time: "120' PENALTY SHOOTOUT",
              teamA: "ARG",
              teamB: "FRA",
              flagA: "🇦🇷",
              flagB: "🇫🇷",
              color: "from-blue-500/10"
            }
          ].map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                heroSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background with fading gradients */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src={slide.image} 
                  alt={slide.match}
                  className="w-full h-full object-cover opacity-40"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {/* Vignette overlays to make the image look like a cinema frame and blend nicely */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-[#02040a]/40`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40"></div>
              </div>

              {/* Live Match scorecard widget overlay */}
              <div className="relative z-10 bg-[#050816]/95 backdrop-blur-2xl border border-slate-800 p-4 rounded-2xl w-full md:w-auto md:min-w-[280px] space-y-3 shadow-2xl self-end mb-4 md:mb-0">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{slide.time}</span>
                  <span className="text-[9px] text-slate-600 font-mono">LIVE</span>
                </div>

                <div className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{slide.flagA}</span>
                    <span className="text-lg font-black tracking-tight">{slide.teamA}</span>
                  </div>
                  <span className="text-3xl font-black mx-4">{slide.score.split(' - ')[0]}</span>
                </div>
                <div className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{slide.flagB}</span>
                    <span className="text-lg font-black tracking-tight">{slide.teamB}</span>
                  </div>
                  <span className="text-3xl font-black mx-4">{slide.score.split(' - ')[1]}</span>
                </div>

                {/* Scorecard quick tabs / pill buttons requested below scorecard */}
                <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-800/60 justify-center">
                  <button
                    onClick={() => { setTournamentHubTab('matches'); setIsTournamentHubOpen(true); }}
                    className="py-1 px-3 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] font-bold hover:bg-slate-700/60 transition-all"
                  >
                    LIVE MATCHES
                  </button>
                  <button
                    onClick={() => { setTournamentHubTab('standings'); setIsTournamentHubOpen(true); }}
                    className="py-1 px-3 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] font-bold hover:bg-slate-700/60 transition-all"
                  >
                    STANDINGS
                  </button>
                  <button
                    onClick={() => { setTournamentHubTab('bracket'); setIsTournamentHubOpen(true); }}
                    className="py-1 px-3 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] font-bold hover:bg-slate-700/60 transition-all"
                  >
                    BRACKET
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* DOTS CONTROLS */}
          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-slate-800/40 pt-4 mt-auto">
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(idx => (
                <button
                  key={idx}
                  onClick={() => setHeroSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${heroSlide === idx ? 'bg-white w-6' : 'bg-slate-700'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-600 font-mono">FIFA World Cup 2026™</span>
          </div>
        </div>
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
            onSendChat={handleSendChat}
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
            onGetTransitSuggestions={handleGetTransitSuggestions}
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
