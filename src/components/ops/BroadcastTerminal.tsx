import React from 'react';
import { Radio, Sparkles } from 'lucide-react';
import { SharedOpsProps } from './types';

interface BroadcastTerminalProps extends SharedOpsProps {
  broadcastInput: string;
  isTranslating: boolean;
  broadcastResult: Record<string, string> | null;
  onSetBroadcastInput: (value: string) => void;
  onGenerateBroadcast: (e: React.FormEvent) => void;
}

/**
 * Multilingual Broadcast Terminal
 * Generates instant translations for stadium announcements
 */
export default function BroadcastTerminal({
  accessibilityMode,
  panelClasses,
  headingClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  broadcastInput,
  isTranslating,
  broadcastResult,
  onSetBroadcastInput,
  onGenerateBroadcast
}: BroadcastTerminalProps) {
  const languages = ['English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Portuguese'];

  return (
    <section className={panelClasses}>
      <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-amber-400'}`}>
        <Radio className="w-5 h-5 inline-block" />
        <span>Multilingual Broadcast Generator</span>
      </h2>

      <form onSubmit={onGenerateBroadcast} className="space-y-2">
        <label htmlFor="broadcast-msg" className="text-xs text-slate-400 leading-relaxed block">
          Enter an urgent announcement in English. Gemini will translate it instantly into all 6 tournament languages.
        </label>
        <div className="flex gap-2">
          <input
            id="broadcast-msg"
            type="text"
            value={broadcastInput}
            onChange={(e) => onSetBroadcastInput(e.target.value)}
            placeholder="e.g., Gates will close in 10 minutes..."
            className={`flex-1 ${inputClasses}`}
            aria-label="Enter urgent broadcast message in English"
          />
          <button
            type="submit"
            disabled={isTranslating || !broadcastInput.trim()}
            className={buttonClasses}
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </form>

      {/* Broadcast Results */}
      {broadcastResult && (
        <div className="mt-4 space-y-2">
          <p className={`${labelClasses} flex items-center gap-1`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generated Multilingual Announcements</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {languages.map((lang) => (
              <div 
                key={lang}
                className={`p-3 rounded-lg border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950/60 border-slate-800'}`}
              >
                <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">{lang}</p>
                <p className="text-sm text-slate-300">{broadcastResult[lang.toLowerCase()] || broadcastInput}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
