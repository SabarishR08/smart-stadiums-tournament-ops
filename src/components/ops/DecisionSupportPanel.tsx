import React from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { SharedOpsProps } from './types';

interface DecisionSupportPanelProps extends SharedOpsProps {
  situationInput: string;
  isDeciding: boolean;
  decisionRecommendations: Array<string | { action?: string }>;
  onSetSituationInput: (value: string) => void;
  onGetDecisionSupport: (e: React.FormEvent) => void;
}

/**
 * AI Tactical Decision Support Panel
 * Provides Gemini-powered operational recommendations
 */
export default function DecisionSupportPanel({
  accessibilityMode,
  panelClasses,
  headingClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  situationInput,
  isDeciding,
  decisionRecommendations,
  onSetSituationInput,
  onGetDecisionSupport
}: DecisionSupportPanelProps) {
  return (
    <section className={panelClasses}>
      <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-blue-400'}`}>
        <Activity className="w-5 h-5 inline-block text-blue-400" />
        <span>AI Tactical Decision Support</span>
      </h2>

      <form onSubmit={onGetDecisionSupport} className="space-y-2">
        <label htmlFor="situation-desc" className="text-xs text-slate-400 leading-relaxed block">
          Enter an active tactical situation or stadium challenge. Gemini will provide ranked, reasoned operational maneuvers.
        </label>
        <div className="flex gap-2">
          <input
            id="situation-desc"
            type="text"
            value={situationInput}
            onChange={(e) => onSetSituationInput(e.target.value)}
            placeholder="e.g., Power outage in East section, crowd surge at Gate B..."
            className={`flex-1 ${inputClasses}`}
            aria-label="Describe the active operational situation"
          />
          <button
            type="submit"
            disabled={isDeciding || !situationInput.trim()}
            className={buttonClasses}
          >
            {isDeciding ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {/* Decision Recommendations */}
      {decisionRecommendations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className={`${labelClasses} flex items-center gap-1`}>
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Gemini Recommended Maneuvers (Ranked by Priority)</span>
          </p>
          {decisionRecommendations.map((rec, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-lg border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950/60 border-slate-800'}`}
            >
              <div className="flex items-start gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : idx === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  #{idx + 1}
                </span>
                <p className="text-sm text-slate-300 flex-1">{typeof rec === 'string' ? rec : (rec.action || '')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
