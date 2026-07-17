import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import Flag from '../Flag';

/**
 * BracketTab - Displays the visual representation of the knockout tournament stage from Round of 16 to the final.
 */
export default function BracketTab(): React.JSX.Element {
  
  const renderBracketMatch = (
    teamA: string, 
    teamB: string, 
    score: string | undefined, 
    date: string, 
    isCompleted: boolean, 
    winner: string | null
  ): React.JSX.Element => {
    return (
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-2.5 space-y-1.5 w-[180px] text-left hover:border-zinc-800 transition-all shadow-md select-none shrink-0">
        <p className="text-[8px] font-bold text-zinc-500 font-mono tracking-wider">{date}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Flag countryName={teamA} />
              <span className={`text-[11px] font-black truncate ${winner === teamA ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamA}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[0]}</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Flag countryName={teamB} />
              <span className={`text-[11px] font-black truncate ${winner === teamB ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamB}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[1]}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
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
  );
}
