import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Trophy, 
  Calendar, 
  Newspaper, 
  Users as UsersIcon,
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Filter
} from 'lucide-react';
import defaultUserPhoto from '../assets/images/default_user_1784115831811.jpg';

// Import all data structures and constants from TournamentData
import {
  COUNTRY_CODES,
  GROUP_TEAMS,
  PLAYER_STATS_DATA,
  NEWS_DATA,
  MATCHES_DATA,
  type TeamStanding,
  type Group,
  type PlayerStat,
  type Match
} from './tournament/TournamentData';

interface TournamentHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'matches' | 'news' | 'standings' | 'players' | 'bracket';
}

export default function TournamentHub({ isOpen, onClose, defaultTab }: TournamentHubProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'news' | 'standings' | 'players' | 'bracket'>('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "A": true });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [playersTab, setPlayersTab] = useState<'goals' | 'assists' | 'yellow' | 'red'>('goals');
  const [filterQualifiedOnly, setFilterQualifiedOnly] = useState(false);
  const [matchStageFilter, setMatchStageFilter] = useState<string>('All');

  // Filtered matches based on stage filter & search queries
  const filteredMatches = useMemo(() => {
    return MATCHES_DATA.filter(m => {
      // Search query filter first
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesA = m.teamA.toLowerCase().includes(q);
        const matchesB = m.teamB.toLowerCase().includes(q);
        const matchesStage = m.stage.toLowerCase().includes(q);
        const matchesVenue = m.venue.toLowerCase().includes(q);
        if (!matchesA && !matchesB && !matchesStage && !matchesVenue) {
          return false;
        }
      }
      
      // Stage filter
      if (matchStageFilter === 'All') return true;
      if (matchStageFilter === 'Groups') return m.stage.startsWith('Group');
      if (matchStageFilter === 'R32') return m.stage === 'Round of 32';
      if (matchStageFilter === 'R16') return m.stage === 'Round of 16';
      if (matchStageFilter === 'QF') return m.stage === 'Quarterfinals';
      if (matchStageFilter === 'SF/Finals') return ['Semifinals', '3rd Place Play-off', 'Final'].includes(m.stage);
      return true;
    });
  }, [matchStageFilter, searchQuery]);

  // Dynamically compute standings from MATCHES_DATA
  const groups = useMemo<Group[]>(() => {
    const standings: Record<string, Record<string, TeamStanding>> = {};
    
    // Setup initial structures
    Object.entries(GROUP_TEAMS).forEach(([letter, teams]) => {
      standings[letter] = {};
      teams.forEach(name => {
        standings[letter][name] = {
          name,
          mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
          form: []
        };
      });
    });

    // Populate stats from MATCHES_DATA
    MATCHES_DATA.forEach(match => {
      if (match.status !== 'completed') return;
      if (!match.stage.startsWith('Group')) return; // Only Group stage counts for standings
      
      const letter = match.stage.replace('Group ', '');
      if (!standings[letter]) return;

      const teamAStats = standings[letter][match.teamA];
      const teamBStats = standings[letter][match.teamB];
      if (!teamAStats || !teamBStats) return;

      // Parse score "X - Y"
      const scoreParts = match.score ? match.score.split(' - ') : null;
      if (!scoreParts || scoreParts.length !== 2) return;

      const gfA = parseInt(scoreParts[0].trim());
      const gfB = parseInt(scoreParts[1].trim());

      teamAStats.mp += 1;
      teamBStats.mp += 1;
      teamAStats.gf += gfA;
      teamAStats.ga += gfB;
      teamBStats.gf += gfB;
      teamBStats.ga += gfA;
      teamAStats.gd = teamAStats.gf - teamAStats.ga;
      teamBStats.gd = teamBStats.gf - teamBStats.ga;

      if (gfA > gfB) {
        teamAStats.w += 1;
        teamAStats.pts += 3;
        teamBStats.l += 1;
        teamAStats.form.push({ outcome: 'W', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'L', opponent: match.teamA, score: `${gfB} - ${gfA}`, date: match.date });
      } else if (gfA < gfB) {
        teamBStats.w += 1;
        teamBStats.pts += 3;
        teamAStats.l += 1;
        teamAStats.form.push({ outcome: 'L', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'W', opponent: match.teamA, score: `${gfB} - ${gfA}`, date: match.date });
      } else {
        teamAStats.d += 1;
        teamBStats.d += 1;
        teamAStats.pts += 1;
        teamBStats.pts += 1;
        teamAStats.form.push({ outcome: 'D', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'D', opponent: match.teamA, score: match.score || '', date: match.date });
      }
    });

    // Convert Record to list, sort teams, and return Group[]
    return Object.entries(standings).map(([letter, teamMap]) => {
      const sortedTeams = Object.values(teamMap).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });
      return {
        letter,
        teams: sortedTeams
      };
    });
  }, []);

  // Initialize/remember tab settings
  useEffect(() => {
    if (isOpen) {
      if (defaultTab) {
        setActiveTab(defaultTab);
      } else {
        try {
          const stored = localStorage.getItem('tournament_hub_last_tab');
          if (stored && ['matches', 'news', 'standings', 'players', 'bracket'].includes(stored)) {
            setActiveTab(stored as any);
          }
        } catch (e) {
          console.warn('localStorage is not accessible in TournamentHub:', e);
        }
      }
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem('tournament_hub_last_tab', activeTab);
      } catch (e) {
        console.warn('localStorage writing is not accessible in TournamentHub:', e);
      }
    }
  }, [activeTab, isOpen]);

  // Helper for rendering Flag nicely with fallbacks
  const renderFlag = (countryName: string) => {
    const data = COUNTRY_CODES[countryName];
    if (!data) return <span className="text-sm">🏳️</span>;
    return (
      <span className="inline-flex items-center gap-1.5 font-sans">
        <img 
          src={`https://flagcdn.com/w40/${data.code}.png`} 
          alt={countryName} 
          className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0 border border-zinc-800/20"
          onError={(e) => {
            (e.currentTarget).style.display = 'none';
          }}
        />
        <span className="text-base select-none filter drop-shadow-sm shrink-0 md:hidden block">{data.emoji}</span>
      </span>
    );
  };

  const renderBracketMatch = (teamA: string, teamB: string, score: string | undefined, date: string, isCompleted: boolean, winner: string | null) => {
    return (
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-2.5 space-y-1.5 w-[180px] text-left hover:border-zinc-800 transition-all shadow-md select-none shrink-0">
        <p className="text-[8px] font-bold text-zinc-500 font-mono tracking-wider">{date}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {renderFlag(teamA)}
              <span className={`text-[11px] font-black truncate ${winner === teamA ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamA}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[0]}</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {renderFlag(teamB)}
              <span className={`text-[11px] font-black truncate ${winner === teamB ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamB}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[1]}</span>}
          </div>
        </div>
      </div>
    );
  };

  const toggleGroupExpand = (letter: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  const expandAllGroups = () => {
    const next: Record<string, boolean> = {};
    groups.forEach(g => {
      next[g.letter] = true;
    });
    setExpandedGroups(next);
  };

  const collapseAllGroups = () => {
    setExpandedGroups({});
  };

  // Memoized Filtered Standings
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = groups.map(g => {
        // Match group letter or team names
        const matchesLetter = `group ${g.letter.toLowerCase()}`.includes(q);
        const filteredTeams = g.teams.filter(t => t.name.toLowerCase().includes(q));
        if (matchesLetter) {
          return g; // Keep all teams if group matches
        } else if (filteredTeams.length > 0) {
          return { ...g, teams: filteredTeams };
        }
        return null;
      }).filter(Boolean);
    }

    // Filter Qualified only (top 2 of each group)
    if (filterQualifiedOnly) {
      result = result.map(g => {
        // Sort teams first to find top 2
        const sorted = [...g.teams].sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });
        return {
          ...g,
          teams: sorted.slice(0, 2)
        };
      });
    }

    return result;
  }, [groups, searchQuery, filterQualifiedOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Dark Overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slide Drawer Content container */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="relative w-full max-w-lg md:max-w-2xl h-full bg-zinc-950 border-l border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10"
      >
        {/* Sticky Header */}
        <header className="p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  Tournament Hub
                  <span className="text-[10px] bg-zinc-800 border border-zinc-700/50 text-zinc-300 px-2 py-0.5 rounded-full font-bold">LIVE STATS</span>
                </h1>
                <p className="text-[11px] text-zinc-500 font-mono">Official FIFA World Cup 2026 Tournament Information</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white transition-all focus:outline-none"
              aria-label="Close Tournament Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sticky Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search teams, players, groups, matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-zinc-400 focus:outline-none placeholder-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tab Selection Row */}
          <nav className="flex gap-1.5 bg-zinc-900/40 p-1 border border-zinc-900 rounded-xl" role="tablist">
            {[
              { id: 'matches', label: 'Matches', icon: Calendar },
              { id: 'news', label: 'News', icon: Newspaper },
              { id: 'standings', label: 'Standings', icon: Trophy },
              { id: 'players', label: 'Players', icon: UsersIcon },
              { id: 'bracket', label: 'Bracket', icon: Sparkles }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedMatch(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    isActive 
                      ? 'bg-zinc-800/80 text-white border border-zinc-700/30 shadow' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Scrollable Container Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* TAB 1: MATCHES */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {selectedMatch ? (
                // Match Details Stat view
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
                        {renderFlag(selectedMatch.teamA)}
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
                        {renderFlag(selectedMatch.teamB)}
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
                        const numA = parseInt(stat.valA || '0');
                        const numB = parseInt(stat.valB || '0');
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
              ) : (
                // Matches List
                <div className="space-y-3.5">
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
                                {renderFlag(match.teamA)}
                                <span className="text-xs font-bold text-white">{match.teamA}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-bold px-1.5">vs</span>
                              <div className="flex items-center gap-1.5 flex-row-reverse">
                                {renderFlag(match.teamB)}
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
              )}
            </div>
          )}

          {/* TAB 2: NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-3">
              {NEWS_DATA.filter(item => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return item.headline.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
              }).map(news => (
                <div 
                  key={news.id} 
                  className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 hover:shadow-xl transition-all flex flex-col sm:flex-row"
                >
                  <div className="w-full sm:w-1/3 h-32 relative select-none">
                    <img 
                      src={news.thumbnail} 
                      alt="News Thumbnail" 
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 bg-zinc-950/90 text-zinc-300 font-bold border border-zinc-800 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono">
                      {news.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase">{news.time}</p>
                      <h3 className="text-xs font-bold text-white leading-snug">{news.headline}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{news.summary}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-zinc-900/60 flex justify-end">
                      <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                        Read Story <span className="text-[9px]">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: STANDINGS */}
          {activeTab === 'standings' && (
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
                                            {renderFlag(team.name)}
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
          )}

          {/* TAB 4: PLAYER STATISTICS */}
          {activeTab === 'players' && (
            <div className="space-y-4">
              {/* Inner tab category selector */}
              <div className="flex gap-1.5 p-1 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                {[
                  { id: 'goals', label: 'Goals', title: 'Top Goalscorers' },
                  { id: 'assists', label: 'Assists', title: 'Top Assists Playmakers' },
                  { id: 'yellow', label: 'Yellow Cards', title: 'Caution Discipline' },
                  { id: 'red', label: 'Red Cards', title: 'Dismissal Discipline' }
                ].map(pSub => (
                  <button
                    key={pSub.id}
                    onClick={() => setPlayersTab(pSub.id as any)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      playersTab === pSub.id 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {pSub.label}
                  </button>
                ))}
              </div>

              {/* Player list */}
              <div className="space-y-2.5">
                {(playersTab === 'goals' ? PLAYER_STATS_DATA.goals :
                  playersTab === 'assists' ? PLAYER_STATS_DATA.assists :
                  playersTab === 'yellow' ? PLAYER_STATS_DATA.yellowCards :
                  PLAYER_STATS_DATA.redCards).filter(player => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return player.name.toLowerCase().includes(q) || player.country.toLowerCase().includes(q);
                  }).map((player) => (
                    <div 
                      key={player.name} 
                      className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          <img 
                            src={player.photo || defaultUserPhoto} 
                            alt={player.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {player.isGoat && <span className="text-sm" title="GOAT">🐐</span>}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            {renderFlag(player.country)}
                            <span>{player.country}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-emerald-400">
                            {player.value}
                          </span>
                          <p className="text-[8px] text-zinc-500 uppercase tracking-wider font-mono">
                            {playersTab === 'goals' ? 'goals' :
                             playersTab === 'assists' ? 'assists' : 'cards'}
                          </p>
                        </div>
                        {/* Ranking badge */}
                        <div className="w-6 h-6 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: BRACKET */}
          {activeTab === 'bracket' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">WORLD CUP KNOCKOUT BRACKET</h3>
                </div>
                <p className="text-[10px] text-zinc-400 text-center max-w-sm mx-auto">
                  Follow the live road to the final. Drag or scroll horizontally to browse from Round of 16 to the Championship match.
                </p>

                {/* Horizontal visual bracket layout */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-zinc-850">
                  <div className="flex gap-8 min-w-[840px] py-4 h-[780px]">
                    
                    {/* COLUMN 1: ROUND OF 16 */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Round of 16</div>
                      {renderBracketMatch("Canada", "Morocco", "0 - 3", "Sat, Jul 4", true, "Morocco")}
                      {renderBracketMatch("Paraguay", "France", "0 - 1", "Sun, Jul 5", true, "France")}
                      {renderBracketMatch("Portugal", "Spain", "0 - 1", "Tue, Jul 7", true, "Spain")}
                      {renderBracketMatch("USA", "Belgium", "1 - 4", "Tue, Jul 7", true, "Belgium")}
                      {renderBracketMatch("Brazil", "Norway", "1 - 2", "Mon, Jul 6", true, "Norway")}
                      {renderBracketMatch("Mexico", "England", "2 - 3", "Mon, Jul 6", true, "England")}
                      {renderBracketMatch("Argentina", "Egypt", "3 - 2", "Tue, Jul 7", true, "Argentina")}
                      {renderBracketMatch("Switzerland", "Colombia", "0 (4) - 0 (3)", "Wed, Jul 8", true, "Switzerland")}
                    </div>

                    {/* COLUMN 2: QUARTERFINALS */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Quarterfinals</div>
                      {renderBracketMatch("France", "Morocco", "2 - 0", "Fri, Jul 10", true, "France")}
                      {renderBracketMatch("Spain", "Belgium", "2 - 1", "Sat, Jul 11", true, "Spain")}
                      {renderBracketMatch("Norway", "England", "1 - 2", "Sun, Jul 12", true, "England")}
                      {renderBracketMatch("Argentina", "Switzerland", "3 - 1", "Sun, Jul 12", true, "Argentina")}
                    </div>

                    {/* COLUMN 3: SEMIFINALS */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Semifinals</div>
                      {renderBracketMatch("France", "Spain", "0 - 2", "Wed, Jul 15", true, "Spain")}
                      {renderBracketMatch("England", "Argentina", undefined, "Thu, Jul 16", false, null)}
                    </div>

                    {/* COLUMN 4: FINAL & CHAMPION */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Final</div>
                      
                      <div className="space-y-6">
                        {renderBracketMatch("Spain", "Winner SF 2", undefined, "Mon, Jul 20", false, null)}
                        
                        {/* CHAMPIONSHIP PROJECTION / DISPLAY CARD */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2.5 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"></div>
                          <Trophy className="w-7 h-7 text-yellow-400 mx-auto animate-bounce" />
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">CHAMPIONS TROPHY</p>
                            <p className="text-[11px] font-bold text-zinc-200">GRAND FINALE</p>
                            <p className="text-[9px] font-mono font-bold text-zinc-500 mt-1">20 JULY 2026</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
