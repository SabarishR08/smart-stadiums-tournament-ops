import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatMessage, ZoneStatus, TransportationStatus, WayfindingInfo, SustainabilityScore } from '../types';
import MapSVG from './MapSVG';
import TournamentWidget from './TournamentWidget';
import {
  Volume2, VolumeX, Mic, MicOff, Leaf, Users, Bus, Send,
  Accessibility, CheckCircle, HelpCircle, Sparkles, Trophy,
  Newspaper, BarChart2, UserCircle2
} from 'lucide-react';

interface FanViewProps {
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
}

/* ─────────────────────────── style tokens ──────────────────────────────── */
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: 20,
};
const input: React.CSSProperties = {
  background: '#0f1623',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9',
  borderRadius: 9,
  padding: '9px 13px',
  fontSize: 14,
  outline: 'none',
  width: '100%',
};
const btnPrimary: React.CSSProperties = {
  background: '#3b82f6', color: '#fff', border: 'none',
  borderRadius: 9, padding: '9px 16px', fontSize: 13,
  fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  whiteSpace: 'nowrap' as const,
};
const btnGhost: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
  padding: '7px 12px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
};
const btnIcon: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: 8, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(255,255,255,0.45)',
};
const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
};
const sectionHeading: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#f1f5f9',
  display: 'flex', alignItems: 'center', gap: 8, margin: 0,
};
const divider: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.06)', margin: '14px 0',
};

const slides = [
  { id: 0, image: '/images/messi_kissing_trophy_1783343437487.jpg', pos: 'center', match: 'ARG vs POR', score: '2 – 1', time: "78'", flagA: '🇦🇷', flagB: '🇵🇹' },
  { id: 1, image: '/images/messi_wc_kiss_1783341826301.jpg',         pos: 'top',    match: 'ARG vs FRA · FINAL', score: '3 – 3', time: 'PENS', flagA: '🇦🇷', flagB: '🇫🇷' },
  { id: 2, image: '/images/neymar_brazil_focus_1783343496361.jpg',   pos: 'top',    match: 'BRA vs GER', score: '1 – 1', time: "34'", flagA: '🇧🇷', flagB: '🇩🇪' },
];

export default function FanView({ accessibilityMode, setAccessibilityMode }: FanViewProps) {
  /* ── state ── */
  const [sessionUserId, setSessionUserId]     = useState('');
  const [ecoData, setEcoData]                 = useState<SustainabilityScore>({ userId: '', score: 0, itemsScanned: 0, updatedAt: '' });
  const [chatInput, setChatInput]             = useState('');
  const [chatMessages, setChatMessages]       = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'assistant', text: 'Welcome to StadiumPulse AI! Ask me anything about seats, gates, food, restrooms, or match schedules — I reply in your language.', timestamp: new Date().toISOString() }
  ]);
  const [isChatLoading, setIsChatLoading]     = useState(false);
  const [voiceIn,  setVoiceIn]               = useState(false);
  const [voiceOut, setVoiceOut]              = useState(false);
  const recognitionRef                        = useRef<any>(null);
  const chatEndRef                            = useRef<HTMLDivElement>(null);
  const fileInputRef                          = useRef<HTMLInputElement>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedWF, setSelectedWF]           = useState<WayfindingInfo | null>(null);
  const [crowdZones, setCrowdZones]           = useState<ZoneStatus[]>([]);
  const [crowdTip, setCrowdTip]               = useState('Gates operating normally. Gate C recommended for fastest entry.');
  const [crowdLoading, setCrowdLoading]       = useState(false);
  const [transports, setTransports]           = useState<TransportationStatus[]>([]);
  const [locationInput, setLocationInput]     = useState('');
  const [transitTip, setTransitTip]           = useState('');
  const [transitLoading, setTransitLoading]   = useState(false);
  const [classifying, setClassifying]         = useState(false);
  const [classResult, setClassResult]         = useState<any>(null);
  const [scanMsg, setScanMsg]                 = useState('');
  const [heroSlide, setHeroSlide]             = useState(0);
  const [tournamentTab, setTournamentTab]     = useState<'matches'|'news'|'standings'|'players'>('standings');
  const [tournamentOpen, setTournamentOpen]   = useState(false);

  /* ── effects ── */
  useEffect(() => {
    if (accessibilityMode) return;
    const t = setInterval(() => setHeroSlide(p => (p + 1) % 3), 7000);
    return () => clearInterval(t);
  }, [accessibilityMode]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  useEffect(() => {
    let uid = localStorage.getItem('sp_uid');
    if (!uid) { uid = 'fan_' + Math.random().toString(36).slice(2, 11); localStorage.setItem('sp_uid', uid); }
    setSessionUserId(uid);
    const ref = doc(db, 'sustainability_scores', uid);
    return onSnapshot(ref, snap => {
      if (snap.exists()) setEcoData(snap.data() as SustainabilityScore);
      else { const d = { userId: uid!, score: 0, itemsScanned: 0, updatedAt: new Date().toISOString() }; setDoc(ref, d); setEcoData(d); }
    });
  }, []);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'crowd_status'),  s => { const z: ZoneStatus[] = [];         s.forEach(d => z.push(d.data() as ZoneStatus));         setCrowdZones(z); });
    const u2 = onSnapshot(collection(db, 'transportation'), s => { const t: TransportationStatus[] = []; s.forEach(d => t.push(d.data() as TransportationStatus)); setTransports(t); });
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => {
    if (!crowdZones.length) return;
    const run = async () => {
      try {
        setCrowdLoading(true);
        const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ message: `Crowd: ${crowdZones.map(z=>`${z.name}: ${z.density}`).join(', ')}. One-line routing tip.` }) });
        const d = await r.json(); if (d.reply) setCrowdTip(d.reply);
      } catch { /* silent */ } finally { setCrowdLoading(false); }
    };
    run(); const iv = setInterval(run, 15000); return () => clearInterval(iv);
  }, [crowdZones.length]);

  /* ── helpers ── */
  const speak = (t: string) => { if (!voiceOut) return; try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } catch {} };

  const toggleVoiceOut = () => { const n = !voiceOut; setVoiceOut(n); if (n) speak('Voice output on.'); else window.speechSynthesis.cancel(); };

  const toggleVoiceIn = () => {
    if (voiceIn) { recognitionRef.current?.stop(); setVoiceIn(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported.'); return; }
    const r = new SR(); r.continuous = false; r.interimResults = false;
    r.onstart = () => setVoiceIn(true);
    r.onresult = (e: any) => setChatInput(e.results[0][0].transcript);
    r.onerror = r.onend = () => setVoiceIn(false);
    recognitionRef.current = r; r.start();
  };

  const sendChat = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput.trim(); setChatInput('');
    setChatMessages(p => [...p, { id:'u'+Date.now(), sender:'user', text:msg, timestamp:new Date().toISOString() }]);
    setIsChatLoading(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:msg, history:chatMessages }) });
      const d = await r.json();
      if (r.ok && d.reply) { setChatMessages(p=>[...p,{id:'a'+Date.now(),sender:'assistant',text:d.reply,timestamp:new Date().toISOString()}]); speak(d.reply); }
      else throw new Error();
    } catch { setChatMessages(p=>[...p,{id:'e'+Date.now(),sender:'assistant',text:'Sorry, an error occurred.',timestamp:new Date().toISOString()}]); }
    finally { setIsChatLoading(false); }
  };

  const getTransitTip = async (e: React.FormEvent) => {
    e.preventDefault(); if (!locationInput.trim() || transitLoading) return;
    setTransitLoading(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ message:`From "${locationInput}", best route? Transports: ${transports.map(t=>`${t.name}: ${t.status}, ETA ${t.eta}`).join('; ')}` }) });
      const d = await r.json(); setTransitTip(d.reply || 'No suggestion available.');
    } catch { setTransitTip('Unable to fetch. Please try again.'); }
    finally { setTransitLoading(false); }
  };

  const classifyImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setScanMsg('Upload an image file.'); return; }
    const reader = new FileReader();
    reader.onloadstart = () => { setClassifying(true); setScanMsg('Reading…'); };
    reader.onload = async () => {
      try {
        setScanMsg('Analyzing with Gemini Vision…');
        const r = await fetch('/api/classify-item', { method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ imageBase64: reader.result, mimeType: file.type }) });
        const d = await r.json();
        if (r.ok && d.category) {
          setClassResult(d); setScanMsg(`Identified: ${d.itemName}`);
          await setDoc(doc(db,'sustainability_scores',sessionUserId), { userId:sessionUserId, score:increment(d.scoreAwarded||10), itemsScanned:increment(1), updatedAt:new Date().toISOString() }, {merge:true});
          speak(`${d.category}. Use the ${d.correctBin}. +${d.scoreAwarded} points!`);
        } else throw new Error(d.error);
      } catch { setScanMsg('Classification failed. Try again.'); }
      finally { setClassifying(false); }
    };
    reader.onerror = () => { setScanMsg('Failed to read image.'); setClassifying(false); };
    reader.readAsDataURL(file);
  };

  const densityStyle = (d: string) => ({
    low:    { bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)',  color:'#4ade80', dot:'#22c55e', label:'Low'      },
    medium: { bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)', color:'#fbbf24', dot:'#f59e0b', label:'Moderate' },
    high:   { bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',  color:'#f87171', dot:'#ef4444', label:'Heavy'    },
  }[d] ?? { bg:'rgba(100,116,139,0.08)', border:'rgba(100,116,139,0.2)', color:'#94a3b8', dot:'#64748b', label:'—' });

  /* ─────────────────────────── render ──────────────────────────────────── */
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── A11Y BAR ──────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, padding:'9px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:6 }}>
          <Accessibility size={13} style={{ color: accessibilityMode ? '#facc15' : '#3b82f6' }} />
          WCAG 2.1 AA Compliant
        </span>
        <button onClick={() => setAccessibilityMode(!accessibilityMode)} style={{ ...btnGhost, ...(accessibilityMode ? { background:'#facc15', color:'#000', borderColor:'#facc15' } : {}) }} aria-label="Toggle Accessibility Mode">
          <Accessibility size={12} /> {accessibilityMode ? 'Accessibility: ON' : 'Accessibility: OFF'}
        </button>
      </div>

      {/* ── HERO CAROUSEL ─────────────────────────────────────────────── */}
      {!accessibilityMode && (
        <div style={{ position:'relative', overflow:'hidden', borderRadius:18, border:'1px solid rgba(255,255,255,0.07)', minHeight:300, background:'#080c14', flexShrink:0 }}>
          {slides.map((sl, idx) => (
            <div key={sl.id} style={{ position:'absolute', inset:0, opacity: heroSlide===idx ? 1 : 0, transition:'opacity 1s ease', pointerEvents: heroSlide===idx ? 'auto' : 'none', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', padding:20 }}>
              <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
                <img src={sl.image} alt="Match moment" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: sl.pos as any, transition:'transform 7s ease-out', transform: heroSlide===idx ? 'scale(1.04)' : 'scale(1)' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,12,20,0.9) 0%, transparent 55%)' }} />
              </div>
              <div style={{ position:'relative', zIndex:10, background:'rgba(8,12,20,0.8)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', minWidth:220 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, paddingBottom:6, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize:9, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{sl.match}</span>
                  <span style={{ fontSize:9, color:'#ef4444', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} /> LIVE
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14 }}>
                  <span style={{ fontSize:20 }}>{sl.flagA}</span>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:17, fontWeight:900, color:'#f1f5f9', fontFamily:'monospace' }}>{sl.score}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', marginTop:2 }}>{sl.time}</div>
                  </div>
                  <span style={{ fontSize:20 }}>{sl.flagB}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ position:'absolute', bottom:14, left:20, zIndex:20, display:'flex', gap:5 }}>
            {slides.map((_,i) => <button key={i} onClick={()=>setHeroSlide(i)} aria-label={`Slide ${i+1}`} style={{ width: heroSlide===i ? 22 : 6, height:5, borderRadius:99, border:'none', cursor:'pointer', background: heroSlide===i ? '#3b82f6' : 'rgba(255,255,255,0.2)', transition:'all 0.3s', padding:0 }} />)}
          </div>
        </div>
      )}

      {/* ── TOURNAMENT QUICK-ACCESS STRIP ─────────────────────────────── */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {([
          { key:'matches',   label:'Matches',   icon: <Trophy       size={13}/> },
          { key:'news',      label:'News',      icon: <Newspaper    size={13}/> },
          { key:'standings', label:'Standings', icon: <BarChart2    size={13}/> },
          { key:'players',   label:'Players',   icon: <UserCircle2  size={13}/> },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setTournamentTab(key); setTournamentOpen(true); }}
            style={{ ...btnGhost, gap:6, padding:'7px 13px', ...(tournamentOpen && tournamentTab===key ? { background:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.35)', color:'#93c5fd' } : {}) }}
            aria-label={`View ${label}`}
          >
            {icon}
            <span style={{ fontSize:12 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TOURNAMENT PREVIEW CARD (portal-style, shows on tap) ──────── */}
      {tournamentOpen && (
        <div style={{ position:'relative' }}>
          <TournamentWidget tab={tournamentTab} onClose={() => setTournamentOpen(false)} />
        </div>
      )}

      {/* ── MAIN 2-COL GRID ───────────────────────────────────────────── */}
      <main className="fan-grid" role="main">

        {/* ═══ LEFT COL ═══════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* WAYFINDING MAP */}
          <section style={card} aria-label="Stadium Wayfinding Map">
            <h2 style={sectionHeading}>
              <HelpCircle size={14} style={{ color:'#3b82f6', flexShrink:0 }} />
              Wayfinding & Gate Locator
            </h2>
            <div style={divider} />
            <MapSVG selectedSection={selectedSection} onSectionSelect={info => { setSelectedSection(info.section); setSelectedWF(info); speak(`Section ${info.section}. Gate: ${info.nearestGate}`); }} />
            <div style={{ marginTop:12, padding:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
              {selectedWF ? (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>Section {selectedWF.section}</span>
                    <span style={{ fontSize:10, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', color:'#93c5fd', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>Fastest Path</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {[['Nearest Gate', selectedWF.nearestGate],['Restroom', selectedWF.nearestRestroom],['ADA Entrance', selectedWF.accessibleEntrance]].map(([lbl,val]) => (
                      <div key={lbl}>
                        <div style={sectionLabel}>{lbl}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', marginTop:3 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'12px 0', color:'rgba(255,255,255,0.3)', fontSize:12 }}>
                  Tap any section on the map to see directions
                </div>
              )}
            </div>
          </section>

          {/* LIVE CROWD STATUS */}
          <section style={card} aria-label="Live Crowd Status">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h2 style={sectionHeading}><Users size={14} style={{ color:'#3b82f6', flexShrink:0 }} />Live Crowd Status</h2>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', gap:5, fontFamily:'monospace' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />15s refresh
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:14 }}>
              {crowdZones.map(z => {
                const ds = densityStyle(z.density);
                return (
                  <div key={z.id} style={{ padding:'10px 12px', borderRadius:9, background:ds.bg, border:`1px solid ${ds.border}` }} aria-label={`${z.name}: ${ds.label}`}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#cbd5e1', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{z.name}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:ds.color, textTransform:'uppercase', letterSpacing:'0.04em' }}>{ds.label}</span>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:ds.dot, display:'inline-block', flexShrink:0 }} />
                    </div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', marginTop:3 }}>{z.count.toLocaleString()} fans</div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding:12, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:9, display:'flex', gap:10, alignItems:'flex-start' }}>
              <Sparkles size={13} style={{ color:'#60a5fa', marginTop:1, flexShrink:0 }} />
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.5, margin:0 }}>
                {crowdLoading ? 'Generating routing tip…' : crowdTip}
              </p>
            </div>
          </section>

          {/* SUSTAINABILITY */}
          <section style={card} aria-label="Sustainability EcoCup">
            <h2 style={sectionHeading}><Leaf size={14} style={{ color:'#4ade80', flexShrink:0 }} />EcoCup Sustainability</h2>
            <div style={divider} />
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:16, alignItems:'start' }}>
              <div style={{ padding:'14px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, textAlign:'center', minWidth:90 }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#4ade80', lineHeight:1 }}>{ecoData.score}</div>
                <div style={{ ...sectionLabel, marginTop:4 }}>points</div>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:8, paddingTop:8, fontSize:10, color:'rgba(255,255,255,0.3)' }}>{ecoData.itemsScanned} scanned</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>Photo your waste item — Gemini classifies it and shows the correct bin.</p>
                <input type="file" ref={fileInputRef} onChange={classifyImage} accept="image/*" style={{ display:'none' }} aria-label="Upload item for classification" />
                <button onClick={() => fileInputRef.current?.click()} disabled={classifying} style={{ ...btnPrimary, justifyContent:'center' }}>
                  <Leaf size={13} />{classifying ? 'Analyzing…' : 'Scan Item'}
                </button>
                {scanMsg && <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', margin:0 }}>{scanMsg}</p>}
              </div>
            </div>
            {classResult && (
              <div style={{ marginTop:12, padding:12, background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:9, display:'flex', gap:10 }}>
                <CheckCircle size={16} style={{ color:'#4ade80', flexShrink:0, marginTop:1 }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#f1f5f9' }}>{classResult.correctBin} <span style={{ color:'#4ade80', textTransform:'capitalize' }}>· {classResult.category}</span></div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{classResult.explanation}</div>
                  <div style={{ fontSize:10, color:'#4ade80', fontWeight:700, marginTop:4 }}>+{classResult.scoreAwarded} pts awarded</div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ═══ RIGHT COL ══════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* AI CONCIERGE CHAT */}
          <section style={{ ...card, display:'flex', flexDirection:'column', height:500 }} aria-label="AI Concierge Chat">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, marginBottom:12, borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              <h2 style={sectionHeading}><Sparkles size={14} style={{ color:'#3b82f6', flexShrink:0 }} />AI Concierge</h2>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={toggleVoiceOut} style={{ ...btnIcon, ...(voiceOut ? { background:'#3b82f6', borderColor:'#3b82f6', color:'#fff' } : {}) }} aria-label={voiceOut ? 'Mute voice output' : 'Enable voice output'}>
                  {voiceOut ? <Volume2 size={14}/> : <VolumeX size={14}/>}
                </button>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, marginBottom:12 }} role="log" aria-label="Chat messages">
              {chatMessages.map(m => (
                <div key={m.id} style={{ display:'flex', justifyContent: m.sender==='user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'82%', padding:'9px 13px', borderRadius: m.sender==='user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.sender==='user' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${m.sender==='user' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    fontSize:13, color:'#e2e8f0', lineHeight:1.5 }}>
                    {m.text}
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', textAlign:'right', marginTop:4, fontFamily:'monospace' }}>
                      {new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div style={{ display:'flex', gap:4, padding:'8px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, width:'fit-content' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:5, height:5, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animation:`bounce 1s ${i*0.15}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button type="button" onClick={toggleVoiceIn}
                style={{ ...btnIcon, ...(voiceIn ? { background:'#ef4444', borderColor:'#ef4444', color:'#fff' } : {}) }}
                aria-label={voiceIn ? 'Stop listening' : 'Start voice input'}>
                {voiceIn ? <MicOff size={14}/> : <Mic size={14}/>}
              </button>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about gates, seats, food…" style={{ ...input, flex:1 }} aria-label="Chat input" disabled={isChatLoading} />
              <button type="submit" disabled={isChatLoading||!chatInput.trim()} style={{ ...btnPrimary, padding:'9px 13px' }} aria-label="Send"><Send size={14}/></button>
            </form>
          </section>

          {/* TRANSPORTATION */}
          <section style={card} aria-label="Shuttle and Parking">
            <h2 style={sectionHeading}><Bus size={14} style={{ color:'#3b82f6', flexShrink:0 }} />Transportation & Parking</h2>
            <div style={divider} />
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
              {transports.map(t => {
                const bad = t.status.includes('Full') || t.status.includes('Delay');
                return (
                  <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background: bad ? '#ef4444' : '#22c55e', display:'inline-block', flexShrink:0 }} />
                      <span style={{ fontSize:12, color:'#cbd5e1', fontWeight:500 }}>{t.name}</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{t.status}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#93c5fd' }}>{t.eta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={getTransitTip} style={{ display:'flex', gap:8 }}>
              <input value={locationInput} onChange={e=>setLocationInput(e.target.value)} placeholder="Your location (e.g. Metro Station)" style={{ ...input, flex:1 }} aria-label="Your location" />
              <button type="submit" disabled={transitLoading||!locationInput.trim()} style={{ ...btnPrimary, padding:'9px 13px' }}>{transitLoading ? '…' : 'Route'}</button>
            </form>
            {transitTip && (
              <div style={{ marginTop:10, padding:11, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:8, display:'flex', gap:8 }}>
                <Sparkles size={12} style={{ color:'#60a5fa', marginTop:1, flexShrink:0 }} />
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.5, margin:0 }}>{transitTip}</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
