import React from 'react';
import { Sliders } from 'lucide-react';
import { ZoneStatus, TransportationStatus } from '../../types';
import { SharedOpsProps } from './types';

interface RealTimeControlsProps extends SharedOpsProps {
  crowdZones: ZoneStatus[];
  transports: TransportationStatus[];
  onUpdateDensity: (zoneId: string, currentDensity: string) => void;
  onUpdateTransport: (transId: string, currentStatus: string) => void;
}

/**
 * Real-Time Controls - Staff controls for crowd density and transport status
 */
export default function RealTimeControls({
  accessibilityMode,
  panelClasses,
  headingClasses,
  labelClasses,
  crowdZones,
  transports,
  onUpdateDensity,
  onUpdateTransport
}: RealTimeControlsProps) {
  return (
    <section className={panelClasses}>
      <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-emerald-400'}`}>
        <Sliders className="w-5 h-5 inline-block" />
        <span>Real-Time Crowd & Transport Feeds</span>
      </h2>

      <div className="space-y-4">
        {/* Gates Crowd densities */}
        <div>
          <p className={`${labelClasses} mb-2`}>Gates Status Control (Tap to Cycle Density)</p>
          <div className="grid grid-cols-2 gap-2">
            {crowdZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => onUpdateDensity(zone.id, zone.density)}
                className={`p-2 rounded-lg border text-xs text-left transition-all hover:bg-slate-800/20 flex flex-col justify-between h-14 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border-slate-800'}`}
                aria-label={`Cycle Crowd Density for ${zone.name}. Current is ${zone.density}.`}
              >
                <span className="text-slate-400 block line-clamp-1">{zone.name}</span>
                <span className={`font-black uppercase tracking-wider ${zone.density === 'high' ? 'text-rose-400' : zone.density === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {zone.density}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Shuttle statuses */}
        <div className="border-t border-slate-800 pt-3">
          <p className={`${labelClasses} mb-2`}>Transportation Status Control (Tap to Shift status)</p>
          <div className="space-y-1.5">
            {transports.map((item) => (
              <button
                key={item.id}
                onClick={() => onUpdateTransport(item.id, item.status)}
                className={`w-full p-2 rounded-lg border text-xs flex items-center justify-between text-left hover:bg-slate-800/20 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border-slate-800'}`}
                aria-label={`Update Transport Status for ${item.name}. Currently is ${item.status}.`}
              >
                <span className="text-slate-300 font-medium">{item.name}</span>
                <div className="text-right">
                  <span className="font-bold text-blue-400">{item.status} ({item.eta})</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
