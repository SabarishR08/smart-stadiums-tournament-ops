import React from 'react';
import { type Match } from '../TournamentData';
import Flag from '../Flag';

interface MatchesTabProps {
  /** List of matches filtered by stage and search query */
  filteredMatches: Match[];
  /** The currently selected match for the detail stats view, or null */
  selectedMatch: Match | null;
  /** Callback to set the active selected match */
  setSelectedMatch: (match: Match | null) => void;
  /** Current active stage filter ID (e.g., 'All', 'Groups') */
  matchStageFilter: string;
  /** Callback to update the stage filter */
  setMatchStageFilter: (filter: string) => void;
}

/**
 * MatchesTab - Displays a list of tournament matches filtered by stage and search queries, with dynamic stat cards for selected matches.
 */
export default function MatchesTab({
  filteredMatches,
  selectedMatch,
  setSelectedMatch,
  matchStageFilter,
  setMatchStageFilter
}: MatchesTabProps): React.JSX.Element {
  if (selectedMatch) {
    // Match Details Stat view
    return (
      <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMatch(null)}
            className="text-[11px] font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1"
          >
            ← Back to Matchlist
          </button>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
            selectedMatch.status === 'live' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse' :
            selectedMatch.status === 'upcoming' ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' :
            'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            {selectedMatch.status}
          </span>
        </div>

        {/* Dynamic Scoreboard Box */}
        <div className="text-center space-y-3 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
          <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{selectedMatch.venue}</p>
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center gap-1.5 w-1/3">
              <Flag countryName={selectedMatch.teamA} />
              <span className="text-xs font-black text-white">{selectedMatch.teamA}</span>
            </div>
            <div className="w-1/3">
              {selectedMatch.score ? (
                <span className="font-mono text-xl font-black text-emerald-400 tracking-wider">
                  {selectedMatch.score}
                </span>
              ) : (
                <span className="text-xs font-bold text-zinc-500">VS</span>
              )}
              <p className="text-[9px] text-zinc-400 font-bold mt-1.5 tracking-wider uppercase font-mono">{selectedMatch.time}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-1/3">
              <Flag countryName={selectedMatch.teamB} />
              <span className="text-xs font-black text-white">{selectedMatch.teamB}</span>
            </div>
          </div>
        </div>

        {/* Match Stats Table */}
        {selectedMatch.possession ? (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">LIVE MATCH STATISTICS</h3>
            
            {/* Stat Rows */}
            {[
              { label: 'Possession', valA: selectedMatch.possession.split(' - ')[0], valB: selectedMatch.possession.split(' - ')[1] },
              { label: 'Shots', valA: selectedMatch.shots?.split(' - ')[0], valB: selectedMatch.shots?.split(' - ')[1] },
              { label: 'Corners', valA: selectedMatch.corners?.split(' - ')[0], valB: selectedMatch.corners?.split(' - ')[1] },
              { label: 'Yellow Cards', valA: selectedMatch.yellowCards?.split(' - ')[0], valB: selectedMatch.yellowCards?.split(' - ')[1] },
              { label: 'Red Cards', valA: selectedMatch.redCards?.split(' - ')[0], valB: selectedMatch.redCards?.split(' - ')[1] }
            ].map((stat, sIdx) => {
              const numA = parseInt(stat.valA || '0', 10);
              const numB = parseInt(stat.valB || '0', 10);
              const total = numA + numB || 1;
              const pctA = Math.round((numA / total) * 100);
              const pctB = 100 - pctA;
              
              return (
                <div key={sIdx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-300 font-mono">{stat.valA}</span>
                    <span className="text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-zinc-300 font-mono">{stat.valB}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full flex overflow-hidden">
                    <div style={{ width: `${pctA}%` }} className="bg-zinc-300 h-full"></div>
                    <div style={{ width: `${pctB}%` }} className="bg-zinc-600 h-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-500 italic">
            Live Statistics will be available when match kicks off.
          </div>
        )}
      </div>
    );
  }

  // Matches List
  return (
    <div className="space-y-4">
      {/* Stage filter buttons row */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-2 px-2 scrollbar-none shrink-0">
        {[
          { id: 'All', label: 'All' },
          { id: 'Groups', label: 'Groups' },
          { id: 'R32', label: 'R32' },
          { id: 'R16', label: 'R16' },
          { id: 'QF', label: 'QF' },
          { id: 'SF/Finals', label: 'SF/Final' }
        ].map(stage => (
          <button
            key={stage.id}
            onClick={() => setMatchStageFilter(stage.id)}
            className={`py-1 px-3.5 rounded-full text-[10px] font-bold shrink-0 border transition-all ${
              matchStageFilter === stage.id
                ? 'bg-zinc-100 text-black border-zinc-100'
                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <div 
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="bg-zinc-900/20 border border-zinc-900/50 hover:border-zinc-800/80 p-4 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : match.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                  <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                    {match.status} • {match.stage} • {match.date}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flag countryName={match.teamA} />
                    <span className="text-xs font-bold text-white">{match.teamA}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold px-1.5">vs</span>
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <Flag countryName={match.teamB} />
                    <span className="text-xs font-bold text-white">{match.teamB}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                {match.score ? (
                  <div className="text-xs font-mono font-black text-emerald-400 bg-zinc-900/40 border border-zinc-800/60 px-2.5 py-1 rounded-lg">
                    {match.score}
                  </div>
                ) : (
                  <div className="text-[9px] text-zinc-400 font-semibold font-mono bg-zinc-900/30 px-2 py-0.5 rounded border border-zinc-900">
                    Upcoming
                  </div>
                )}
                <p className="text-[9px] text-zinc-500 font-bold mt-1 tracking-wider font-mono">{match.time.split(' ')[0]}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-xs text-zinc-500 italic">
            No matches found matching this stage filter.
          </div>
        )}
      </div>
    </div>
  );
}
