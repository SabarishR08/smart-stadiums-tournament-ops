import React from 'react';
import { QrCode } from 'lucide-react';
import MapSVG from '../MapSVG';
import { WayfindingInfo } from '../../types';
import { SharedFanViewProps } from './types';

interface WayfindingPanelProps extends SharedFanViewProps {
  selectedSection: string | null;
  selectedWayfinding: WayfindingInfo | null;
  onSectionSelect: (info: WayfindingInfo) => void;
}

export default function WayfindingPanel({
  accessibilityMode,
  cardClasses,
  headingSize,
  selectedSection,
  selectedWayfinding,
  onSectionSelect
}: WayfindingPanelProps) {
  const labelSize = accessibilityMode ? 'text-base font-black uppercase mb-1 text-white' : 'text-xs text-slate-400 mb-1';

  return (
    <section className={cardClasses} aria-label="Wayfinding & Stadium Map">
      <h2 className={headingSize}>
        <QrCode className="w-5 h-5 inline-block text-zinc-400" />
        <span>Wayfinding & Gate Locator</span>
      </h2>

      {/* Stadium Map rendering */}
      <div className="mb-4">
        <MapSVG 
          selectedSection={selectedSection}
          onSectionSelect={onSectionSelect}
        />
      </div>

      {/* Selected Wayfinding Info - Only show when section is selected */}
      {selectedWayfinding && (
        <div className={`p-4 rounded-xl ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/30 backdrop-blur-md border border-zinc-800/50'}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
              <span className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-base text-white'}`}>
                Section {selectedWayfinding.section} Selected
              </span>
              <span className="text-xs bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 px-2.5 py-0.5 rounded-full font-semibold">
                Fastest Path
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className={labelSize}>Nearest Gate</p>
                <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                  {selectedWayfinding.nearestGate}
                </p>
              </div>
              <div>
                <p className={labelSize}>Nearest Restroom</p>
                <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                  {selectedWayfinding.nearestRestroom}
                </p>
              </div>
              <div>
                <p className={labelSize}>ADA Entrance</p>
                <p className={`font-semibold ${accessibilityMode ? 'text-lg' : 'text-slate-200'}`}>
                  {selectedWayfinding.accessibleEntrance}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
