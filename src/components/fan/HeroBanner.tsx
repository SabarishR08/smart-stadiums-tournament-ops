import React from 'react';

interface HeroBannerProps {
  /** The index of the currently active hero slide */
  heroSlide: number;
  /** Callback function to manually update the active slide index */
  setHeroSlide: (index: number) => void;
  /** Callback to change the default active tab of the Tournament Hub drawer when opened */
  setTournamentHubTab: (tab: 'matches' | 'news' | 'standings' | 'players' | 'bracket') => void;
  /** Callback to open or close the Tournament Hub drawer */
  setIsTournamentHubOpen: (open: boolean) => void;
}

/**
 * HeroBanner - Renders the exquisite commercial rotating World Cup slideshow with live scorecard and navigation shortcuts.
 */
export default function HeroBanner({
  heroSlide,
  setHeroSlide,
  setTournamentHubTab,
  setIsTournamentHubOpen
}: HeroBannerProps): React.JSX.Element {
  const slides = [
    {
      id: 0,
      match: "ARG vs FRA • WORLD CUP FINAL",
      score: "3(4) - 3(2)",
      time: "120' PENALTY SHOOTOUT",
      teamA: "ARG",
      teamB: "FRA",
      flagA: "🇦🇷",
      flagB: "🇫🇷",
      color: "from-blue-600/10"
    },
    {
      id: 1,
      match: "ARG • 2022 WORLD CUP CHAMPIONS",
      score: "CHAMPIONS",
      time: "FULL TIME",
      teamA: "ARG",
      teamB: "FRA",
      flagA: "🇦🇷",
      flagB: "🇫🇷",
      color: "from-blue-500/10"
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-[#02040a] shadow-2xl min-h-[340px] flex flex-col justify-end p-6 md:p-8">
      {/* SLIDES */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            heroSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background with fading gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-zinc-900 to-blue-950 flex items-center justify-center">
            {/* Vignette overlays to make the gradient blend nicely */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-[#02040a]/40"></div>
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
          {[0, 1].map(idx => (
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
  );
}
