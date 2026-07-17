import React from 'react';
import { COUNTRY_CODES } from './TournamentData';

interface FlagProps {
  /** The full name of the country (e.g., "Germany", "Argentina") */
  countryName: string;
}

/**
 * Flag - Renders a country flag with robust CDN image fallback and high-resolution emoji backup.
 * @param countryName - The name of the country to fetch the flag for
 */
export default function Flag({ countryName }: FlagProps): React.JSX.Element {
  const data = COUNTRY_CODES[countryName];
  if (!data) return <span className="text-sm">🏳️</span>;
  return (
    <span className="inline-flex items-center gap-1.5 font-sans">
      <img 
        src={`https://flagcdn.com/w40/${data.code}.png`} 
        alt={countryName} 
        className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0 border border-zinc-800/20"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <span className="text-base select-none filter drop-shadow-sm shrink-0 md:hidden block">{data.emoji}</span>
    </span>
  );
}
