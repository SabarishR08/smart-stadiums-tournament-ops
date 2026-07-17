import React from 'react';
import { Bus, Sparkles } from 'lucide-react';
import { TransportationStatus } from '../../types';
import { SharedFanViewProps } from './types';

interface TransportPanelProps extends SharedFanViewProps {
  transports: TransportationStatus[];
  userLocationInput: string;
  transitRouteSuggestion: string;
  isTransitLoading: boolean;
  onLocationInputChange: (value: string) => void;
  onGetTransitSuggestions: (e: React.FormEvent) => void;
}

/**
 * TransportPanel Component
 *
 * Real-time transportation routes and shuttle schedules layout.
 * Integrates location-based travel recommendation helpers using generative intelligence.
 *
 * @param props The props for the component.
 * @returns A polished transit routing card.
 */
export default function TransportPanel({
  accessibilityMode,
  cardClasses,
  headingSize,
  transports,
  userLocationInput,
  transitRouteSuggestion,
  isTransitLoading,
  onLocationInputChange,
  onGetTransitSuggestions
}: TransportPanelProps) {
  const labelSize = accessibilityMode ? 'text-base font-black uppercase mb-1 text-white' : 'text-xs text-slate-400 mb-1';
  const inputClasses = accessibilityMode 
    ? 'py-3 px-4 bg-white text-black font-bold text-lg border-4 border-black focus:ring-4 focus:ring-yellow-400' 
    : 'py-2 px-3 bg-zinc-950/60 border border-zinc-800/80 text-zinc-200 rounded-lg text-sm placeholder-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const buttonClasses = accessibilityMode 
    ? 'py-3 px-6 bg-white text-black font-black text-lg uppercase border-4 border-black hover:bg-yellow-400 disabled:opacity-50 focus:ring-4 focus:ring-yellow-400' 
    : 'py-2 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-500/20 transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]';

  return (
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
      <form onSubmit={onGetTransitSuggestions} className="space-y-2">
        <label htmlFor="stated-location-input" className={labelSize}>
          Stated Location Route Advisor
        </label>
        <div className="flex gap-2">
          <input
            id="stated-location-input"
            type="text"
            value={userLocationInput}
            onChange={(e) => onLocationInputChange(e.target.value)}
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
  );
}
