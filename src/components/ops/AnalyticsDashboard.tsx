import React from 'react';
import { TrendingUp } from 'lucide-react';
import { IncidentReport } from '../../types';
import { SharedOpsProps } from './types';

interface AnalyticsDashboardProps extends SharedOpsProps {
  incidents: IncidentReport[];
}

/**
 * Analytics Dashboard - Real-time SVG incident charts
 */
export default function AnalyticsDashboard({
  accessibilityMode,
  panelClasses,
  headingClasses,
  labelClasses,
  incidents
}: AnalyticsDashboardProps) {
  // Aggregate incident counts by type
  const incidentCountsByType = incidents.reduce((acc, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const incidentTypes = ['security', 'medical', 'facility', 'crowd', 'other'];
  const maxCount = Math.max(...incidentTypes.map(t => incidentCountsByType[t] || 0), 1);

  return (
    <section className={panelClasses}>
      <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-blue-400'}`}>
        <TrendingUp className="w-5 h-5 inline-block" />
        <span>Real-Time Incident Analytics</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Native SVG Bar Chart */}
        <div className={`p-4 rounded-xl ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
          <p className={`${labelClasses} mb-3`}>Incidents by Type</p>
          <svg viewBox="0 0 300 180" className="w-full h-auto">
            {incidentTypes.map((type, idx) => {
              const count = incidentCountsByType[type] || 0;
              const barHeight = (count / maxCount) * 140;
              const x = idx * 55 + 20;
              const y = 160 - barHeight;
              return (
                <g key={type}>
                  <rect x={x} y={y} width="40" height={barHeight} fill="#3b82f6" opacity="0.8" />
                  <text x={x + 20} y="175" textAnchor="middle" fontSize="10" fill="#94a3b8">
                    {type.slice(0, 3)}
                  </text>
                  <text x={x + 20} y={y - 5} textAnchor="middle" fontSize="12" fill="#e2e8f0" fontWeight="bold">
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Summary Stats */}
        <div className={`p-4 rounded-xl space-y-3 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
          <p className={labelClasses}>Summary Metrics</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Active Incidents:</span>
              <span className="font-bold text-white">{incidents.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">High Severity:</span>
              <span className="font-bold text-rose-400">
                {incidents.filter(i => i.severity === 'high' || i.aiPriority === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg Response Time:</span>
              <span className="font-bold text-emerald-400">2.3 mins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Most Common Type:</span>
              <span className="font-bold text-blue-400 capitalize">
                {Object.entries(incidentCountsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
