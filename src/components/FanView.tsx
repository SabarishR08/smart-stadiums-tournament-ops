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
import MapSVG from './MapSVG';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Leaf, 
  Users, 
  Bus, 
  Send, 
  QrCode,
  Trophy,
  Accessibility,
  Sparkles,
  CheckCircle
} from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [crowdZones.length]); // Dependencies based on list length to avoid excessive refetching on slight updates

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
      // Auto-detect voice language based on chat detection if possible
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
      // Speak quick feedback
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
    recognition.lang = 'en-US'; // Default, but speech recognizers support multi-lang

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
    
    // Add User Message
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
      // Craft query about transit directions and live statuses
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
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanMessage('Invalid file type. Please upload an image.');
      return;
    }

    // Read file as base64
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
          
          // Write sustainability points updating directly to Firestore
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

    reader.onerror = () => {
      setScanMessage('Failed to read image.');
      setIsClassifying(false);
    };

    reader.readAsDataURL(file);
  };

  // 12. Map crowd density value to Color/Aria description
  const getDensityColor = (density: string) => {
    switch (density) {
      case 'low': return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400', label: 'Low Congestion' };
      case 'medium': return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', dot: 'bg-amber-400', label: 'Moderate Crowds' };
      case 'high': return { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', dot: 'bg-rose-400', label: 'Heavy Congestion' };
      default: return { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400', dot: 'bg-slate-400', label: 'Unknown' };
    }
  };

  // Setup contrast classes for Access Mode
  const themeClasses = accessibilityMode 
    ? 'bg-black text-white' 
    : 'bg-transparent text-zinc-100';

  const cardClasses = accessibilityMode
    ? 'bg-black border-2 border-white rounded-none p-5'
    : 'bg-zinc-900/20 backdrop-blur-xl border border-zinc-800/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10';

  const inputClasses = accessibilityMode
    ? 'bg-black border-2 border-white text-white rounded-none focus:ring-4 focus:ring-yellow-400 focus:border-white focus:outline-none placeholder-slate-400 text-lg p-3'
    : 'bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 text-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 focus:outline-none placeholder-zinc-500 p-2.5';

  const buttonClasses = accessibilityMode
    ? 'bg-yellow-400 text-black border-2 border-black font-bold py-3 px-5 rounded-none hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-400'
    : 'bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 px-4 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:ring-2 focus:ring-zinc-300/50';

  const labelSize = accessibilityMode ? 'text-lg font-bold' : 'text-xs font-semibold uppercase tracking-wider text-zinc-400';
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
              time: "HISTORIC FINALE",
              teamA: "ARG",
              teamB: "FRA",
              flagA: "🇦🇷",
              flagB: "🇫🇷",
              color: "from-amber-600/10"
            }
          ].map((slide, idx) => (
            <div 
              key={slide.id} 
              className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col md:flex-row items-end justify-end p-6 md:p-8 pb-16 md:pb-16 gap-6 z-0 ${
                heroSlide === idx ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {/* Background with fading gradients */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <img 
                  src={slide.image} 
                  alt="World Cup moment" 
                  className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                    heroSlide === idx ? "scale-105 opacity-100" : "scale-100 opacity-80"
                  }`}
                  referrerPolicy="no-referrer"
                />
                {/* Vignette overlays to make the image look like a cinema frame and blend nicely */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-[#02040a]/40`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40"></div>
              </div>

              {/* Live Match scorecard widget overlay */}
              <div className="relative z-10 bg-[#050816]/95 backdrop-blur-2xl border border-slate-800 p-4 rounded-2xl w-full md:w-auto md:min-w-[280px] space-y-3 shadow-2xl self-end mb-4 md:mb-0">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">{slide.match}</span>
                  <span className="text-[10px] font-black text-red-500 flex items-center gap-1.5 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 absolute"></span> LIVE
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl filter drop-shadow">{slide.flagA}</span>
                    <span className="text-xs font-bold text-slate-200">{slide.teamA}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-black text-emerald-400 shadow-inner">
                      {slide.score}
                    </span>
                    <p className="text-[9px] text-slate-500 font-bold mt-2 tracking-wider font-mono">{slide.time}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-xl filter drop-shadow">{slide.flagB}</span>
                    <span className="text-xs font-bold text-slate-200">{slide.teamB}</span>
                  </div>
                </div>

                {/* Scorecard quick tabs / links - pill buttons requested below scorecard */}
                <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-800/60 justify-center">
                  <button
                    onClick={() => { setTournamentHubTab('matches'); setIsTournamentHubOpen(true); }}
                    className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 text-[9px] font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all border border-zinc-850"
                  >
                    Matches
                  </button>
                  <button
                    onClick={() => { setTournamentHubTab('bracket'); setIsTournamentHubOpen(true); }}
                    className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 text-[9px] font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all border border-zinc-850"
                  >
                    Bracket
                  </button>
                  <button
                    onClick={() => { setTournamentHubTab('standings'); setIsTournamentHubOpen(true); }}
                    className="px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-750 text-[9px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  >
                    Standings
                  </button>
                  <button
                    onClick={() => { setTournamentHubTab('players'); setIsTournamentHubOpen(true); }}
                    className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 text-[9px] font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all border border-zinc-850"
                  >
                    Stats
                  </button>
                </div>

              </div>
            </div>
          ))}

          {/* DOTS CONTROLS */}
          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-slate-800/40 pt-4 mt-auto">
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    heroSlide === idx ? "w-8 bg-emerald-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-widest">
              Commercial Broadcast Feed
            </div>
          </div>

        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6" role="main">
        
        {/* LEFT COLUMN: Map & Wayfinding + Crowd Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. MAP & WAYFINDING */}
          <section className={cardClasses} aria-label="Wayfinding & Stadium Map">
            <h2 className={headingSize}>
              <QrCode className="w-5 h-5 inline-block text-zinc-400" />
              <span>Wayfinding & Gate Locator</span>
            </h2>

            {/* Stadium Map rendering */}
            <div className="mb-4">
              <MapSVG 
                selectedSection={selectedSection}
                onSectionSelect={handleMapSectionClick}
              />
            </div>

            {/* Selected Wayfinding Info - Only show when section is selected */}
            {selectedWayfinding && (
              <div className={`p-4 rounded-xl ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/30 backdrop-blur-md border border-zinc-800/50'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                    <span className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-base text-white'}`}>
                      Section {selectedWayfinding.section} Selected
                    </span>
                    <span className="text-xs bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 px-2.5 py-0.5 rounded-full font-semibold">
                      Fastest Path
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className={labelSize}>Nearest Gate</p>
                      <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                        {selectedWayfinding.nearestGate}
                      </p>
                    </div>
                    <div>
                      <p className={labelSize}>Nearest Restroom</p>
                      <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                        {selectedWayfinding.nearestRestroom}
                      </p>
                    </div>
                    <div>
                      <p className={labelSize}>ADA Entrance</p>
                      <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                        {selectedWayfinding.accessibleEntrance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* B. LIVE CROWD STATUS */}
          <section className={cardClasses} aria-label="Real-time Gate Densities">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900/60 pb-2.5">
              <h2 className={headingSize}>
                <Users className="w-5 h-5 inline-block text-zinc-400" />
                <span>Live Crowd Status</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400"></span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">15s AUTO-REFRESH</span>
              </div>
            </div>

            {/* List of crowd densities */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {crowdZones.map((zone) => {
                const density = getDensityColor(zone.density);
                return (
                  <div 
                    key={zone.id} 
                    className={`p-3 rounded-lg border flex flex-col justify-between ${density.bg}`}
                    aria-label={`${zone.name} is reporting ${density.label} with approximately ${zone.count} people.`}
                  >
                    <div>
                      <span className="text-xs font-semibold line-clamp-1 block text-slate-300">{zone.name}</span>
                      <span className={`text-xs font-black block mt-0.5 uppercase tracking-wider`}>
                        {zone.density}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-800/20">
                      <span className="text-[10px] text-slate-400 font-mono">{zone.count} FANS</span>
                      <span className={`w-2 h-2 rounded-full ${density.dot}`}></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gemini Live Recommendation */}
            <div className={`p-4 rounded-xl border ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/20 backdrop-blur-md border-zinc-800/40 shadow-inner'}`}>
              <div className="flex gap-2 items-start">
                <Sparkles className={`w-5 h-5 shrink-0 ${accessibilityMode ? 'text-yellow-400' : 'text-zinc-300'}`} />
                <div>
                  <h3 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-sm text-white'}`}>
                    StadiumPulse AI Congestion Routing
                  </h3>
                  <p className={`mt-1 ${accessibilityMode ? 'text-lg' : 'text-xs text-slate-300 leading-relaxed'}`}>
                    {isCrowdLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <span className="w-1.5 h-1.5 bg-slate-400 animate-bounce rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 animate-bounce rounded-full delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 animate-bounce rounded-full delay-300"></span>
                        <span>Generating live congestion advice...</span>
                      </span>
                    ) : crowdRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* C. SUSTAINABILITY HELPER */}
          <section className={cardClasses} aria-label="EcoCup Sustainability Tracker">
            <h2 className={headingSize}>
              <Leaf className="w-5 h-5 inline-block text-zinc-400" />
              <span>Sustainability EcoCup Assistant</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* Scoring Panel */}
              <div className={`sm:col-span-5 p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/30 border border-zinc-800/50'}`}>
                <div>
                  <h3 className={labelSize}>Your Stadium Impact</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`font-black tracking-tight ${accessibilityMode ? 'text-5xl text-yellow-400' : 'text-4xl text-zinc-200'}`}>
                      {sustainabilityData.score}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold uppercase">PTS</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Items Sorted:</span>
                  <span className="font-bold text-slate-200">{sustainabilityData.itemsScanned} items</span>
                </div>
              </div>

              {/* Upload/Scanner Form */}
              <div className="sm:col-span-7 space-y-3">
                <p className="text-xs text-slate-400">
                  Take a photo of your cup, wrapper, or container. Gemini Vision will categorize it and show the correct bin.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    capture="environment" // trigger camera on mobile devices
                    className="hidden"
                    aria-label="Upload item image for sustainability classification"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isClassifying}
                    className={`w-full ${buttonClasses} text-center flex items-center justify-center gap-2`}
                  >
                    <Leaf className="w-4 h-4" />
                    <span>{isClassifying ? 'Analyzing...' : 'Scan / Upload Item'}</span>
                  </button>
                </div>

                {scanMessage && (
                  <p className="text-xs text-slate-400 bg-slate-950 p-2 border border-slate-800 rounded font-mono">
                    {scanMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Classification Result Card */}
            {classificationResult && (
              <div className={`mt-4 p-4 rounded-xl border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950 border-slate-800'} flex gap-3`}>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 self-start text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-200">
                    Category: <span className="text-emerald-400 capitalize">{classificationResult.category}</span>
                  </p>
                  <p className="font-bold text-yellow-400 mt-1">
                    Correct Bin: {classificationResult.correctBin}
                  </p>
                  <p className="text-slate-400 mt-1 text-xs">
                    {classificationResult.explanation}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-2">
                    +{classificationResult.scoreAwarded} POINTS AWARDED TO CLOUD PROFILE
                  </p>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: AI Concierge Chat + Transport Advice (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. MULTILINGUAL AI CONCIERGE CHAT */}
          <section className={`${cardClasses} flex flex-col h-[520px]`} aria-label="AI Concierge Companion">
            
            {/* Header with speech options */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
              <h2 className={`${headingSize} !mb-0`}>
                <Sparkles className="w-5 h-5 inline-block text-zinc-400" />
                <span>Multilingual AI Concierge</span>
              </h2>
 
              <div className="flex items-center gap-1.5">
                {/* Text-to-Speech Output Toggle */}
                <button
                  onClick={toggleVoiceOutput}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-center focus:ring-4 focus:ring-yellow-400 ${voiceOutputActive ? 'bg-white border-zinc-200 text-black shadow-lg' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'}`}
                  aria-label={voiceOutputActive ? "Mute automatic voice response" : "Enable automatic voice reading"}
                  title={voiceOutputActive ? "Mute Speech Out" : "Enable Speech Out"}
                >
                  {voiceOutputActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                </button>
              </div>
            </div>

            {/* Message Box */}
            <div 
              className={`flex-1 overflow-y-auto p-3 space-y-3 rounded-xl mb-3 ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/40 border border-zinc-900/60'}`}
              role="log"
              aria-live="polite"
              aria-label="Concierge Chat logs"
            >
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 max-w-[85%] text-sm ${msg.sender === 'user' 
                      ? (accessibilityMode ? 'bg-white text-black border border-black font-bold' : 'bg-zinc-100/10 border border-zinc-200/20 rounded-2xl rounded-tr-none text-white') 
                      : (accessibilityMode ? 'bg-black text-white border-2 border-white' : 'bg-zinc-900/40 border border-zinc-800/60 rounded-2xl rounded-tl-none text-zinc-300')
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] block text-right mt-1 opacity-60 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-xl text-sm ${accessibilityMode ? 'border border-white' : 'bg-slate-900 text-slate-400'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full delay-300"></span>
                      <span>StadiumPulse AI is replying...</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form with Speech Recognition */}
            <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-3 border flex items-center justify-center shrink-0 focus:ring-4 focus:ring-yellow-400 ${voiceInputActive ? 'bg-rose-600 border-rose-500 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 rounded-lg'}`}
                aria-label={voiceInputActive ? "Stop speaking" : "Start speaking concierge request"}
                title={voiceInputActive ? "Listening..." : "Speak Request"}
              >
                {voiceInputActive ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about gate, match, seat..."
                className={`flex-1 ${inputClasses}`}
                aria-label="Type your concierge question"
                disabled={isChatLoading}
              />

              <button
                type="submit"
                className={buttonClasses}
                disabled={isChatLoading || !chatInput.trim()}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* B. TRANSPORTATION PANEL */}
          <section className={cardClasses} aria-label="Shuttle & Parking Feeds">
            <h2 className={headingSize}>
              <Bus className="w-5 h-5 inline-block text-zinc-400" />
              <span>Transportation & Parking Feeds</span>
            </h2>

            {/* Live shuttle feeds from Firestore */}
            <div className="space-y-2 mb-4">
              {transports.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/40 border-zinc-800/60'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status.includes('Full') || item.status.includes('Delay') ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                    <span className="font-medium text-zinc-200">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-zinc-400 block">{item.status}</span>
                    <span className="font-bold text-zinc-300">{item.eta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Best route generator form */}
            <form onSubmit={handleGetTransitSuggestions} className="space-y-2">
              <label htmlFor="stated-location-input" className={labelSize}>
                Stated Location Route Advisor
              </label>
              <div className="flex gap-2">
                <input
                  id="stated-location-input"
                  type="text"
                  value={userLocationInput}
                  onChange={(e) => setUserLocationInput(e.target.value)}
                  placeholder="e.g. Metro Station, Gate A, Downtown Hotel"
                  className={`flex-1 ${inputClasses}`}
                  aria-label="Enter your current location to compute best route"
                />
                <button
                  type="submit"
                  disabled={isTransitLoading || !userLocationInput.trim()}
                  className={buttonClasses}
                >
                  {isTransitLoading ? 'Routing...' : 'Get Route'}
                </button>
              </div>
            </form>

            {/* Transit Advice Result */}
            {transitRouteSuggestion && (
              <div className={`mt-3 p-3.5 rounded-lg border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-zinc-950/40 border-zinc-800/60'}`}>
                <p className="text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Gemini Recommended Route:</span>
                </p>
                <p className={`text-xs text-zinc-400 leading-relaxed`}>
                  {transitRouteSuggestion}
                </p>
              </div>
            )}
          </section>

        </div>

      </main>

      {/* TOURNAMENT HUB COMPONENT DRAWERS */}
      <TournamentHub 
        isOpen={isTournamentHubOpen}
        onClose={() => setIsTournamentHubOpen(false)}
        defaultTab={tournamentHubTab}
      />
    </div>
  );
}
