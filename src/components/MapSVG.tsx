import React, { useState } from 'react';
import { WayfindingInfo } from '../types';

interface MapSVGProps {
  onSectionSelect: (info: WayfindingInfo) => void;
  selectedSection: string | null;
}

// Map of sections to nearest amenities
export const WAYFINDING_DATA: { [key: string]: WayfindingInfo } = {
  'A': { section: 'A', nearestGate: 'Gate A (North)', nearestRestroom: 'Restroom 101 (Level 1)', accessibleEntrance: 'Gate D (West)' },
  'B': { section: 'B', nearestGate: 'Gate A (North)', nearestRestroom: 'Restroom 102 (Level 1)', accessibleEntrance: 'Gate D (West)' },
  'C': { section: 'C', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 103 (Level 1)', accessibleEntrance: 'Gate D (West)' },
  'D': { section: 'D', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 104 (Level 1)', accessibleEntrance: 'Gate D (West)' },
  'E': { section: 'E', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 201 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'F': { section: 'F', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 202 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'G': { section: 'G', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 203 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'H': { section: 'H', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 204 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'I': { section: 'I', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 205 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'J': { section: 'J', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 206 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'K': { section: 'K', nearestGate: 'Gate B (East)', nearestRestroom: 'Restroom 207 (Level 2)', accessibleEntrance: 'Gate D (West)' },
  'L': { section: 'L', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 301 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'M': { section: 'M', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 302 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'N': { section: 'N', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 303 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'O': { section: 'O', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 304 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'P': { section: 'P', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 305 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'Q': { section: 'Q', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 306 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'R': { section: 'R', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 307 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'S': { section: 'S', nearestGate: 'Gate C (South)', nearestRestroom: 'Restroom 308 (Level 3)', accessibleEntrance: 'Gate D (West)' },
  'T': { section: 'T', nearestGate: 'Gate D (West)', nearestRestroom: 'Restroom 401 (Level 4 - Accessible)', accessibleEntrance: 'Gate D (West)' },
  'U': { section: 'U', nearestGate: 'Gate D (West)', nearestRestroom: 'Restroom 402 (Level 4 - Accessible)', accessibleEntrance: 'Gate D (West)' },
  'V': { section: 'V', nearestGate: 'Gate D (West)', nearestRestroom: 'Restroom 403 (Level 4 - Accessible)', accessibleEntrance: 'Gate D (West)' },
  'W': { section: 'W', nearestGate: 'Gate D (West)', nearestRestroom: 'Restroom 404 (Level 4 - Accessible)', accessibleEntrance: 'Gate D (West)' },
  'X': { section: 'X', nearestGate: 'Gate D (West)', nearestRestroom: 'Restroom 405 (Level 4 - Accessible)', accessibleEntrance: 'Gate D (West)' },
  'Y': { section: 'Y', nearestGate: 'Gate A (North)', nearestRestroom: 'Restroom 105 (Level 1)', accessibleEntrance: 'Gate D (West)' },
  'Z': { section: 'Z', nearestGate: 'Gate A (North)', nearestRestroom: 'Restroom 106 (Level 1)', accessibleEntrance: 'Gate D (West)' }
};

export default function MapSVG({ onSectionSelect, selectedSection }: MapSVGProps) {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  
  // We lay out 26 sections in an oval stadium ring shape
  const sections = Object.keys(WAYFINDING_DATA);
  const cx = 150;
  const cy = 100;
  const rx = 110;
  const ry = 70;

  // Render Section Color based on heat levels
  const getSectionColor = (sec: string, isSelected: boolean) => {
    if (isSelected) {
      return { fill: '#ffffff', stroke: '#ffffff', text: '#09090b' }; // Premium White selection with dark text
    }
    if (!showHeatmap) {
      return { fill: 'rgba(255, 255, 255, 0.03)', stroke: 'rgba(255, 255, 255, 0.12)', text: '#a1a1aa' }; // Default elegant wireframe
    }

    // Interactive Heat levels
    const highDensitySecs = ['E', 'F', 'G', 'H', 'I', 'J', 'K']; // Near crowded Gate B
    const mediumDensitySecs = ['C', 'D', 'A', 'B', 'Y', 'Z'];    // Moderate Gate A
    
    if (highDensitySecs.includes(sec)) {
      return { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444', text: '#fca5a5' }; // High Congestion Red
    }
    if (mediumDensitySecs.includes(sec)) {
      return { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b', text: '#fcd34d' }; // Moderate Congestion Amber
    }
    return { fill: 'rgba(34, 197, 94, 0.1)', stroke: '#22c55e', text: '#86efac' }; // Free-Flowing Green
  };

  return (
    <div className="w-full relative overflow-hidden bg-zinc-900/20 backdrop-blur-md border border-zinc-800/40 rounded-3xl p-4 flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-500/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 relative z-10 border-b border-zinc-900/60 pb-3">
        <div className="text-center sm:text-left">
          <p className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
            StadiumPulse AI Heatmap
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Select a section to inspect wayfinding routes and live operations</p>
        </div>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
            showHeatmap 
              ? 'bg-white border-zinc-200 text-black shadow-md' 
              : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400'
          }`}
          aria-label="Toggle AI Crowd Congestion Heatmap Overlay"
        >
          Heatmap Overlay: {showHeatmap ? 'ACTIVE' : 'MUTED'}
        </button>
      </div>

      <div className="relative w-full max-w-[400px] aspect-[3/2] flex justify-center">
        <svg 
          viewBox="0 0 300 200" 
          className="w-full h-full select-none"
          aria-label="Stadium sections grid map. A-Z section blocks arranged in an oval ring around the central pitch."
          role="img"
        >
          {/* Central Pitch / Field - Premium Transparent Wireframe Blueprint */}
          <rect 
            x="90" 
            y="65" 
            width="120" 
            height="70" 
            rx="4" 
            fill="rgba(255, 255, 255, 0.02)" 
            opacity="0.85" 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="1.5"
          />
          {/* Field markings */}
          <circle cx="150" cy="100" r="18" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <line x1="150" y1="65" x2="150" y2="135" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <text 
            x="150" 
            y="103" 
            textAnchor="middle" 
            fill="rgba(255, 255, 255, 0.35)" 
            fontSize="7" 
            fontWeight="bold" 
            className="pointer-events-none font-sans uppercase tracking-widest"
          >
            PITCH
          </text>
 
          {/* Render Gates indicator */}
          <text x="150" y="25" textAnchor="middle" fill="#71717a" fontSize="6" className="font-mono">GATE A (NORTH)</text>
          <text x="270" y="103" textAnchor="middle" fill="#71717a" fontSize="6" className="font-mono rotate-90 origin-[270px_103px]">GATE B (EAST)</text>
          <text x="150" y="185" textAnchor="middle" fill="#71717a" fontSize="6" className="font-mono">GATE C (SOUTH)</text>
          <text x="25" y="103" textAnchor="middle" fill="#71717a" fontSize="6" className="font-mono -rotate-90 origin-[25px_103px]">GATE D (WEST - ADA)</text>
 
          {/* Ring of Sections */}
          {sections.map((sec, idx) => {
            const angle = (idx / sections.length) * 2 * Math.PI - Math.PI / 2;
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            const isSelected = selectedSection === sec;
            const style = getSectionColor(sec, isSelected);

            return (
              <g 
                key={sec}
                onClick={() => onSectionSelect(WAYFINDING_DATA[sec])}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSectionSelect(WAYFINDING_DATA[sec]);
                  }
                }}
                className="cursor-pointer group focus:outline-none"
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Stadium Section ${sec}. Select to see nearest gate and restrooms.`}
              >
                {/* Sector circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="10.5"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isSelected ? '2' : '1'}
                  className="transition-all duration-150 group-hover:opacity-80 group-focus:ring-2 group-focus:ring-blue-500"
                />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fill={style.text}
                  fontSize="8"
                  fontWeight="bold"
                  className="pointer-events-none font-sans"
                >
                  {sec}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 relative z-10">
        {showHeatmap ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-emerald-400 block"></span>
              <span>Low (Clear)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700 border border-amber-400 block"></span>
              <span>Medium (Moderate)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-700 border border-red-400 block"></span>
              <span>High (Congested)</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 block"></span>
            <span>All Sections Muted</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white block"></span>
          <span>Selected Section</span>
        </div>
      </div>

      {/* Simple Instruction Text */}
      <p className="text-center text-xs text-slate-400 mt-3 relative z-10">
        Tap any section on the stadium circle map above to inspect route exits & services instantly.
      </p>
    </div>
  );
}
