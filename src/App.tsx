import React, { useState, useEffect } from 'react';
import { seedInitialDataIfEmpty } from './lib/firebase';
import FanView from './components/FanView';
import OpsDashboard from './components/OpsDashboard';
import { 
  ShieldAlert, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Accessibility,
  Menu,
  X,
  Volume2
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'fan' | 'ops'>('fan');
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // 1. Seed default crowd density and shuttle statuses in Firestore on initial load
  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  // Update root contrast colors based on accessibility mode
  const appBg = accessibilityMode 
    ? 'bg-black text-white min-h-screen' 
    : 'bg-[#02040a] text-slate-100 min-h-screen selection:bg-blue-500 selection:text-white';

  const navClasses = accessibilityMode
    ? 'bg-black border-b-4 border-white py-4 px-6 sticky top-0 z-50'
    : 'bg-[#050816]/80 backdrop-blur-xl border-b border-slate-800 py-3.5 px-6 sticky top-0 z-50';

  const navLinkActive = accessibilityMode
    ? 'bg-white text-black border-2 border-black font-black px-4 py-1.5 text-xs uppercase tracking-widest'
    : 'px-4 py-1.5 rounded-full bg-blue-600 text-xs font-bold uppercase tracking-widest text-slate-100 transition-all';

  const navLinkInactive = accessibilityMode
    ? 'text-white border-2 border-transparent font-bold px-4 py-1.5 text-xs uppercase tracking-widest hover:border-white'
    : 'px-4 py-1.5 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-all';

  return (
    <div className={appBg}>
      {/* HEADER NAV */}
      <nav className={navClasses} role="navigation" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${accessibilityMode ? 'bg-white text-black' : 'bg-gradient-to-tr from-emerald-400 to-blue-500 text-black'}`}>
              S
            </div>
            <div>
              <span className={`tracking-tighter font-sans font-black uppercase italic ${accessibilityMode ? 'text-2xl text-white' : 'text-xl text-slate-100'}`}>
                STADIUM<span className="text-emerald-400">PULSE</span> AI
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">FIFA World Cup 2026 Smart Stadium</p>
            </div>
          </div>

          {/* Desktop Navigation Links & Live Status */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800" role="menubar">
              <button
                onClick={() => { setCurrentView('fan'); }}
                className={currentView === 'fan' ? navLinkActive : navLinkInactive}
                role="menuitem"
                aria-label="Switch to Public Fan Companion View"
              >
                Fan View
              </button>
              <button
                onClick={() => { setCurrentView('ops'); }}
                className={currentView === 'ops' ? navLinkActive : navLinkInactive}
                role="menuitem"
                aria-label="Switch to Secure Stadium Operations Hub"
              >
                Ops Mode
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold font-mono text-slate-400 tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE: MIAMI GARDENS STADIUM
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => { setCurrentView('fan'); setMobileMenuOpen(false); }}
              className={`text-left w-full ${currentView === 'fan' ? navLinkActive : navLinkInactive}`}
            >
              Public Fan View
            </button>
            <button
              onClick={() => { setCurrentView('ops'); setMobileMenuOpen(false); }}
              className={`text-left w-full ${currentView === 'ops' ? navLinkActive : navLinkInactive}`}
            >
              Staff Operations Hub
            </button>
          </div>
        )}
      </nav>

      {/* CORE VIEW BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* LANDING WORLD CUP FLAG CONTEXT */}
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 font-mono">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>VENUE: FIFA WORLD CUP AZTECA/METLIFE STADIUM (MOCK)</span>
          </div>
          <div className="font-mono">
            MATCHDAY LIVE: JULY 2026
          </div>
        </div>

        {/* Dynamic routing */}
        {currentView === 'fan' ? (
          <FanView 
            accessibilityMode={accessibilityMode}
            setAccessibilityMode={setAccessibilityMode}
          />
        ) : (
          <OpsDashboard 
            accessibilityMode={accessibilityMode}
          />
        )}
      </div>

      {/* FOOTER ACCESSIBILITY STRIP */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 py-4 px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono shrink-0">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Contrast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-slate-600"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Screen Reader Ready</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-medium text-center md:text-right">
          FIFA WORLD CUP 2026 SMART COMPANION • VERSION 4.0.2-STABLE
          <p className="text-[9px] text-slate-600 mt-0.5">Secure Firestore DB • server-side Gemini API verification</p>
        </div>
      </footer>
    </div>
  );
}
