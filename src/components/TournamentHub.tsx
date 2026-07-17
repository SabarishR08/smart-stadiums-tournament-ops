import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Search, 
  Trophy, 
  Calendar, 
  Newspaper, 
  Users as UsersIcon,
  Sparkles 
} from 'lucide-react';

import { useTournamentData } from './tournament/hooks/useTournamentData';
import MatchesTab from './tournament/tabs/MatchesTab';
import NewsTab from './tournament/tabs/NewsTab';
import StandingsTab from './tournament/tabs/StandingsTab';
import PlayersTab from './tournament/tabs/PlayersTab';
import BracketTab from './tournament/tabs/BracketTab';

interface TournamentHubProps {
  /** Boolean indicating whether the slide drawer is currently open */
  isOpen: boolean;
  /** Callback function fired when user requests to close the drawer */
  onClose: () => void;
  /** Optional pre-selected active tab, overriding any locally cached settings */
  defaultTab?: 'matches' | 'news' | 'standings' | 'players' | 'bracket';
}

/**
 * TournamentHub - Elegant sliding drawer acting as the central live tournament information hub for World Cup 2026.
 * Manages tab state, search filters, and aggregates sub-panels including Matches, News, Standings, Player Stats, and Brackets.
 */
export default function TournamentHub({ isOpen, onClose, defaultTab }: TournamentHubProps): React.JSX.Element | null {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroupExpand,
    expandAllGroups,
    collapseAllGroups,
    selectedMatch,
    setSelectedMatch,
    playersTab,
    setPlayersTab,
    filterQualifiedOnly,
    setFilterQualifiedOnly,
    matchStageFilter,
    setMatchStageFilter,
    filteredMatches,
    filteredGroups
  } = useTournamentData(isOpen, defaultTab);

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
                  onClick={() => { setActiveTab(tab.id as 'matches' | 'news' | 'standings' | 'players' | 'bracket'); setSelectedMatch(null); }}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-850">
          {activeTab === 'matches' && (
            <MatchesTab
              filteredMatches={filteredMatches}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              matchStageFilter={matchStageFilter}
              setMatchStageFilter={setMatchStageFilter}
            />
          )}

          {activeTab === 'news' && (
            <NewsTab searchQuery={searchQuery} />
          )}

          {activeTab === 'standings' && (
            <StandingsTab
              filteredGroups={filteredGroups}
              expandedGroups={expandedGroups}
              toggleGroupExpand={toggleGroupExpand}
              expandAllGroups={expandAllGroups}
              collapseAllGroups={collapseAllGroups}
              filterQualifiedOnly={filterQualifiedOnly}
              setFilterQualifiedOnly={setFilterQualifiedOnly}
            />
          )}

          {activeTab === 'players' && (
            <PlayersTab
              playersTab={playersTab}
              setPlayersTab={setPlayersTab}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'bracket' && (
            <BracketTab />
          )}
        </div>
      </motion.div>
    </div>
  );
}
