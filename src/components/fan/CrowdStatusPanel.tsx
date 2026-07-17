import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { ZoneStatus } from '../../types';
import { SharedFanViewProps } from './types';

interface CrowdStatusPanelProps extends SharedFanViewProps {
  crowdZones: ZoneStatus[];
  crowdRecommendation: string;
  isCrowdLoading: boolean;
}

/**
 * Helper function to map crowd density to color & aria-label
 */
function getDensityColor(density: string) {
  switch (density) {
    case 'Low':
      return { 
        bg: 'bg-emerald-950/40 border-emerald-800/40', 
        dot: 'bg-emerald-400', 
        label: 'Low Congestion' 
      };
    case 'Medium':
      return { 
        bg: 'bg-yellow-950/40 border-yellow-800/40', 
        dot: 'bg-yellow-400', 
        label: 'Medium Congestion' 
      };
    case 'High':
      return { 
        bg: 'bg-red-950/40 border-red-800/40', 
        dot: 'bg-red-400', 
        label: 'High Congestion' 
      };
    default:
      return { 
        bg: 'bg-zinc-950/40 border-zinc-800/40', 
        dot: 'bg-zinc-400', 
        label: 'Unknown' 
      };
  }
}

export default function CrowdStatusPanel({
  accessibilityMode,
  cardClasses,
  headingSize,
  crowdZones,
  crowdRecommendation,
  isCrowdLoading
}: CrowdStatusPanelProps) {
  return (
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
  );
}
