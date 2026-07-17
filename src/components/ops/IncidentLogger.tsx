import React from 'react';
import { AlertOctagon, MapPin, Sparkles } from 'lucide-react';
import { IncidentReport } from '../../types';
import { SharedOpsProps } from './types';

interface IncidentLoggerProps extends SharedOpsProps {
  incidents: IncidentReport[];
  incType: 'security' | 'medical' | 'facility' | 'crowd' | 'other';
  incZone: string;
  incSeverity: 'low' | 'medium' | 'high';
  incNotes: string;
  isLoggingIncident: boolean;
  onSetIncType: (value: 'security' | 'medical' | 'facility' | 'crowd' | 'other') => void;
  onSetIncZone: (value: string) => void;
  onSetIncSeverity: (value: 'low' | 'medium' | 'high') => void;
  onSetIncNotes: (value: string) => void;
  onLogIncident: (e: React.FormEvent) => void;
  onResolveIncident: (incId: string) => void;
}

/**
 * Incident Logger Component
 * Allows staff to log incidents with Gemini-generated tactical advice
 */
export default function IncidentLogger({
  accessibilityMode,
  panelClasses,
  headingClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  incidents,
  incType,
  incZone,
  incSeverity,
  incNotes,
  isLoggingIncident,
  onSetIncType,
  onSetIncZone,
  onSetIncSeverity,
  onSetIncNotes,
  onLogIncident,
  onResolveIncident
}: IncidentLoggerProps) {
  return (
    <section className={panelClasses}>
      <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-rose-400'}`}>
        <AlertOctagon className="w-5 h-5 inline-block" />
        <span>Incident Command Logger</span>
      </h2>

      <form onSubmit={onLogIncident} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
        <div className="sm:col-span-3">
          <label htmlFor="incident-type-select" className={labelClasses}>Type</label>
          <select 
            id="incident-type-select"
            value={incType} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSetIncType(e.target.value as "security" | "medical" | "facility" | "crowd" | "other")}
            className={`w-full mt-1 ${inputClasses} text-slate-300`}
            aria-label="Incident type"
          >
            <option value="security">Security</option>
            <option value="medical">Medical</option>
            <option value="facility">Facility</option>
            <option value="crowd">Crowd</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="incident-zone-select" className={labelClasses}>Zone</label>
          <select 
            id="incident-zone-select"
            value={incZone} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSetIncZone(e.target.value)}
            className={`w-full mt-1 ${inputClasses} text-slate-300`}
            aria-label="Incident zone or location"
          >
            <option value="Gate A">Gate A (North)</option>
            <option value="Gate B">Gate B (East)</option>
            <option value="Gate C">Gate C (South)</option>
            <option value="Gate D">Gate D (West)</option>
            <option value="Section A-D">Sections A-D</option>
            <option value="Section E-H">Sections E-H</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="incident-severity-select" className={labelClasses}>Severity</label>
          <select 
            id="incident-severity-select"
            value={incSeverity} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSetIncSeverity(e.target.value as "low" | "medium" | "high")}
            className={`w-full mt-1 ${inputClasses} text-slate-300`}
            aria-label="Incident severity level"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="sm:col-span-12 flex gap-2">
          <input
            type="text"
            required
            value={incNotes}
            onChange={(e) => onSetIncNotes(e.target.value)}
            placeholder="Describe the incident (e.g., ticket scanner offline, spill on concourse)"
            className={`flex-1 ${inputClasses}`}
            aria-label="Incident description or notes"
          />
          <button
            type="submit"
            disabled={isLoggingIncident}
            className={buttonClasses}
            aria-label="Submit and log incident with AI routing"
          >
            {isLoggingIncident ? 'Logging...' : 'Log & Route'}
          </button>
        </div>
      </form>

      {/* Active Incidents Feed */}
      <div className="space-y-3">
        <p className={labelClasses}>Active Incident Logs ({incidents.length})</p>
        {incidents.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
            No active incidents. Safe operations confirmed.
          </div>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <div 
                key={inc.id} 
                className={`p-4 rounded-xl border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950/60 border-slate-800'} space-y-2`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inc.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {inc.type} | {inc.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{inc.zone}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => onResolveIncident(inc.id)}
                    className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black py-0.5 px-2 rounded transition-all"
                  >
                    Mark Resolved
                  </button>
                </div>

                <p className="text-sm text-slate-200">{inc.notes}</p>

                {/* Gemini Response Suggestion */}
                {inc.aiAction && (
                  <div className="bg-blue-950/30 border border-blue-900/30 p-2.5 rounded text-xs">
                    <p className="font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Gemini Action Directive (Priority: <span className="uppercase text-yellow-400">{inc.aiPriority}</span>):</span>
                    </p>
                    <p className="text-slate-400 mt-1">{inc.aiAction}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
