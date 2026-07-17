import React from 'react';
import { NEWS_DATA } from '../TournamentData';

interface NewsTabProps {
  /** The text string used to filter headlines/summary/category */
  searchQuery: string;
}

/**
 * NewsTab - Displays tournament news cards with image thumbnails and quick-read summaries.
 */
export default function NewsTab({ searchQuery }: NewsTabProps): React.JSX.Element {
  const filteredNews = NEWS_DATA.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.headline.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {filteredNews.map(news => (
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
  );
}
