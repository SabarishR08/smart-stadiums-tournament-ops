import React, { useState, useEffect } from 'react';
import { seedInitialDataIfEmpty } from './lib/firebase';
import FanView from './components/FanView';
import OpsDashboard from './components/OpsDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  MapPin, 
  Menu,
  X
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
    : 'bg-zinc-950 text-zinc-100 min-h-screen selection:bg-white selection:text-black relative overflow-hidden';

  const navClasses = accessibilityMode
    ? 'bg-black border-b-4 border-white py-4 px-6 sticky top-0 z-50'
    : 'bg-zinc-950/40 backdrop-blur-xl border-b border-zinc-900/40 py-3.5 px-6 sticky top-0 z-50';

  const navLinkActive = accessibilityMode
    ? 'bg-white text-black border-2 border-black font-black px-4 py-1.5 text-xs uppercase tracking-widest'
    : 'px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]';

  const navLinkInactive = accessibilityMode
    ? 'text-white border-2 border-transparent font-bold px-4 py-1.5 text-xs uppercase tracking-widest hover:border-white'
    : 'px-4 py-1.5 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-200 hover:bg-white/5 transition-all';

  return (
    <div className={appBg}>
      {/* Premium ambient decorative elements */}
      {!accessibilityMode && (
        <>
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-zinc-800/15 blur-[120px] pointer-events-none select-none z-0"></div>
          <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-900/15 blur-[150px] pointer-events-none select-none z-0"></div>
          <div className="absolute bottom-[5%] left-[15%] w-[450px] h-[450px] rounded-full bg-zinc-800/10 blur-[140px] pointer-events-none select-none z-0"></div>
        </>
      )}

      {/* WCAG SKIP LINK */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-yellow-400 focus:text-black focus:p-4 focus:z-[9999] font-black uppercase text-xs tracking-widest border-4 border-black focus:outline-none"
      >
        Skip to main content
      </a>

      {/* HEADER NAV */}
      <nav className={navClasses} role="navigation" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${accessibilityMode ? 'bg-white text-black' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg'}`}>
              S
            </div>
            <div>
              <span className={`tracking-tighter font-sans font-black uppercase italic ${accessibilityMode ? 'text-2xl text-white' : 'text-xl text-white'}`}>
                STADIUM<span className="text-zinc-400">PULSE</span> AI
              </span>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">FIFA World Cup 2026 Smart Stadium</p>
            </div>
          </div>

          {/* Desktop Navigation Links & Live Status */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 border border-zinc-800/50" role="menubar">
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
            <div className="flex items-center gap-3 text-xs font-semibold font-mono text-zinc-400 tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-zinc-300 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
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
      <div id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none">
        
        {/* LANDING WORLD CUP FLAG CONTEXT */}
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-zinc-500 border-b border-zinc-900/80 pb-3 relative z-10">
          <div className="flex items-center gap-1.5 font-mono">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span>VENUE: FIFA WORLD CUP AZTECA/METLIFE STADIUM (MOCK)</span>
          </div>
          <div className="font-mono">
            MATCHDAY LIVE: JULY 2026
          </div>
        </div>

        {/* Dynamic routing */}
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      {/* FOOTER ACCESSIBILITY STRIP */}
      <footer className="mt-12 bg-zinc-950/20 backdrop-blur-md border-t border-zinc-900/80 py-4 px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono shrink-0 relative z-10">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700"></div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">High Contrast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-zinc-800 border border-zinc-700"></div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Screen Reader Ready</span>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 font-medium text-center md:text-right">
          FIFA WORLD CUP 2026 SMART COMPANION • VERSION 4.0.2-STABLE
          <p className="text-[9px] text-zinc-600 mt-0.5">Secure Firestore DB • server-side Gemini API verification</p>
        </div>
      </footer>
    </div>
  );
}
