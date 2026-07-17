import React from 'react';
import { PLAYER_STATS_DATA } from '../TournamentData';
import Flag from '../Flag';

interface PlayersTabProps {
  /** Selected sub-tab category for player statistics ('goals', 'assists', 'yellow', 'red') */
  playersTab: 'goals' | 'assists' | 'yellow' | 'red';
  /** Callback to change selected sub-tab category */
  setPlayersTab: (tab: 'goals' | 'assists' | 'yellow' | 'red') => void;
  /** Current search query filter string */
  searchQuery: string;
}

/**
 * PlayersTab - Displays top performing tournament players under Goals, Assists, or Card statistics categories.
 */
export default function PlayersTab({
  playersTab,
  setPlayersTab,
  searchQuery
}: PlayersTabProps): React.JSX.Element {
  // Get active statistics list
  const activeList = 
    playersTab === 'goals' ? PLAYER_STATS_DATA.goals :
    playersTab === 'assists' ? PLAYER_STATS_DATA.assists :
    playersTab === 'yellow' ? PLAYER_STATS_DATA.yellowCards :
    PLAYER_STATS_DATA.redCards;

  // Filter list by search query
  const filteredPlayers = activeList.filter(player => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(q) || 
      player.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Inner tab category selector */}
      <div className="flex gap-1.5 p-1 bg-zinc-900/30 border border-zinc-900 rounded-xl">
        {[
          { id: 'goals', label: 'Goals' },
          { id: 'assists', label: 'Assists' },
          { id: 'yellow', label: 'Yellow Cards' },
          { id: 'red', label: 'Red Cards' }
        ].map(pSub => (
          <button
            key={pSub.id}
            onClick={() => setPlayersTab(pSub.id as 'goals' | 'assists' | 'yellow' | 'red')}
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
        {filteredPlayers.map((player) => (
          <div 
            key={player.name} 
            className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                {player.photo ? (
                  <img 
                    src={player.photo} 
                    alt={player.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-200">
                    {player.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{player.name}</span>
                  {player.isGoat && <span className="text-sm" title="GOAT">🐐</span>}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <Flag countryName={player.country} />
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
  );
}
