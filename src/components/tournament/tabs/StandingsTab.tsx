import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { type Group } from '../TournamentData';
import Flag from '../Flag';

interface StandingsTabProps {
  /** Array of computed group standings matching filters and search */
  filteredGroups: Group[];
  /** Record mapping Group Letter (e.g. 'A') to boolean indicating if group accordion is open */
  expandedGroups: Record<string, boolean>;
  /** Callback to toggle individual group expand/collapse state */
  toggleGroupExpand: (letter: string) => void;
  /** Callback to expand all groups */
  expandAllGroups: () => void;
  /** Callback to collapse all groups */
  collapseAllGroups: () => void;
  /** Boolean state specifying if only the top 2 teams should be shown */
  filterQualifiedOnly: boolean;
  /** Callback to toggle the qualified filter */
  setFilterQualifiedOnly: (qualified: boolean) => void;
}

/**
 * StandingsTab - Group standings lists that support expanding individual grids to view complete statistics.
 */
export default function StandingsTab({
  filteredGroups,
  expandedGroups,
  toggleGroupExpand,
  expandAllGroups,
  collapseAllGroups,
  filterQualifiedOnly,
  setFilterQualifiedOnly
}: StandingsTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Standings controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterQualifiedOnly(!filterQualifiedOnly)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
              filterQualifiedOnly 
                ? 'bg-zinc-800 border-zinc-700 text-white' 
                : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Qualified Only</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={expandAllGroups} 
            className="text-[10px] font-black text-zinc-400 hover:text-white uppercase transition-colors px-2 py-1"
          >
            Expand All
          </button>
          <span className="text-zinc-800">|</span>
          <button 
            onClick={collapseAllGroups} 
            className="text-[10px] font-black text-zinc-400 hover:text-white uppercase transition-colors px-2 py-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Group Standings list */}
      <div className="space-y-3.5">
        {filteredGroups.map(group => {
          const isExpanded = !!expandedGroups[group.letter];
          return (
            <div 
              key={group.letter} 
              className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden transition-all"
            >
              {/* Accordion Trigger Header */}
              <div 
                onClick={() => toggleGroupExpand(group.letter)}
                className="p-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-900/40 flex items-center justify-between cursor-pointer hover:bg-zinc-900/80 transition-all select-none"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Group {group.letter}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-[10px] font-mono tracking-widest uppercase">Inspect Table</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Accordion Table Body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-zinc-300 font-sans border-collapse">
                        <thead>
                          <tr className="bg-zinc-950/60 border-b border-zinc-900/80 font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-black text-left">
                            <th className="py-2.5 px-3 text-center w-8">#</th>
                            <th className="py-2.5 px-3 text-left">Team</th>
                            <th className="py-2.5 px-2 text-center">MP</th>
                            <th className="py-2.5 px-2 text-center">W</th>
                            <th className="py-2.5 px-2 text-center">D</th>
                            <th className="py-2.5 px-2 text-center">L</th>
                            <th className="py-2.5 px-2 text-center hidden md:table-cell">GF</th>
                            <th className="py-2.5 px-2 text-center hidden md:table-cell">GA</th>
                            <th className="py-2.5 px-2 text-center">GD</th>
                            <th className="py-2.5 px-3 text-center font-black text-white bg-zinc-900/40">PTS</th>
                            <th className="py-2.5 px-3 text-center w-28">Form</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.teams.map((team, tIdx) => {
                            const position = tIdx + 1;
                            const isQualified = position <= 2;
                            const isDanger = position === 4;
                            
                            return (
                              <tr 
                                key={team.name} 
                                className={`border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-all ${
                                  isQualified ? 'bg-emerald-500/[0.015]' : isDanger ? 'bg-rose-500/[0.01]' : ''
                                }`}
                              >
                                <td className="py-3 px-3 text-center">
                                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold ${
                                    isQualified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    isDanger ? 'bg-zinc-800 text-zinc-500' :
                                    'text-zinc-400'
                                  }`}>
                                    {position}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-semibold text-white">
                                  <div className="flex items-center gap-2">
                                    <Flag countryName={team.name} />
                                    <span className="truncate max-w-[100px] sm:max-w-none">{team.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center font-mono">{team.mp}</td>
                                <td className="py-3 px-2 text-center font-mono">{team.w}</td>
                                <td className="py-3 px-2 text-center font-mono">{team.d}</td>
                                <td className="py-3 px-2 text-center font-mono">{team.l}</td>
                                <td className="py-3 px-2 text-center font-mono hidden md:table-cell">{team.gf}</td>
                                <td className="py-3 px-2 text-center font-mono hidden md:table-cell">{team.ga}</td>
                                <td className="py-3 px-2 text-center font-mono font-medium">
                                  <span className={team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-rose-400' : 'text-zinc-500'}>
                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-black text-white bg-zinc-900/20 font-mono">
                                  {team.pts}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1 font-mono">
                                    {team.form.map((f, fIdx) => (
                                      <div 
                                        key={fIdx} 
                                        className="group/form relative cursor-default"
                                      >
                                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-black select-none ${
                                          f.outcome === 'W' ? 'bg-emerald-500 text-black' :
                                          f.outcome === 'D' ? 'bg-amber-500 text-black' :
                                          'bg-rose-500 text-white'
                                        }`}>
                                          {f.outcome === 'W' ? 'W' : f.outcome === 'D' ? 'D' : 'L'}
                                        </span>
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-300 p-2 rounded-lg shadow-2xl opacity-0 group-hover/form:opacity-100 pointer-events-none transition-all duration-200 z-50 min-w-[110px] text-center uppercase tracking-wider">
                                          <p className="font-bold text-white">vs {f.opponent}</p>
                                          <p className="text-emerald-400 font-mono font-black my-0.5">{f.score}</p>
                                          <p className="text-[8px] text-zinc-500 font-mono">{f.date}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
