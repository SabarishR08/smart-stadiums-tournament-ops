import React, { useRef } from 'react';
import { Leaf, CheckCircle } from 'lucide-react';
import { SustainabilityScore } from '../../types';
import { SharedFanViewProps } from './types';

interface SustainabilityPanelProps extends SharedFanViewProps {
  sustainabilityData: SustainabilityScore;
  isClassifying: boolean;
  classificationResult: any;
  scanMessage: string;
  onImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SustainabilityPanel({
  accessibilityMode,
  cardClasses,
  headingSize,
  sustainabilityData,
  isClassifying,
  classificationResult,
  scanMessage,
  onImageFileChange
}: SustainabilityPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const labelSize = accessibilityMode ? 'text-base font-black uppercase mb-1 text-white' : 'text-xs text-slate-400 mb-1';
  const buttonClasses = accessibilityMode 
    ? 'py-4 px-6 bg-white text-black font-black text-lg uppercase border-4 border-black hover:bg-yellow-400 focus:ring-4 focus:ring-yellow-400' 
    : 'py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-sm hover:bg-emerald-500/20 transition-all focus:ring-2 focus:ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]';

  return (
    <section className={cardClasses} aria-label="EcoCup Sustainability Tracker">
      <h2 className={headingSize}>
        <Leaf className="w-5 h-5 inline-block text-zinc-400" />
        <span>Sustainability EcoCup Assistant</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
        
        {/* Scoring Panel */}
        <div className={`sm:col-span-5 p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/30 border border-zinc-800/50'}`}>
          <div>
            <h3 className={labelSize}>Your Stadium Impact</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`font-black tracking-tight ${accessibilityMode ? 'text-5xl text-yellow-400' : 'text-4xl text-zinc-200'}`}>
                {sustainabilityData.score}
              </span>
              <span className="text-xs text-zinc-500 font-bold uppercase">PTS</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Items Sorted:</span>
            <span className="font-bold text-slate-200">{sustainabilityData.itemsScanned} items</span>
          </div>
        </div>

        {/* Upload/Scanner Form */}
        <div className="sm:col-span-7 space-y-3">
          <p className="text-xs text-slate-400">
            Take a photo of your cup, wrapper, or container. Gemini Vision will categorize it and show the correct bin.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageFileChange}
              accept="image/*"
              capture="environment" // trigger camera on mobile devices
              className="hidden"
              aria-label="Upload item image for sustainability classification"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isClassifying}
              className={`w-full ${buttonClasses} text-center flex items-center justify-center gap-2`}
            >
              <Leaf className="w-4 h-4" />
              <span>{isClassifying ? 'Analyzing...' : 'Scan / Upload Item'}</span>
            </button>
          </div>

          {scanMessage && (
            <p className="text-xs text-slate-400 bg-slate-950 p-2 border border-slate-800 rounded font-mono">
              {scanMessage}
            </p>
          )}
        </div>
      </div>

      {/* Classification Result Card */}
      {classificationResult && (
        <div className={`mt-4 p-4 rounded-xl border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950 border-slate-800'} flex gap-3`}>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 self-start text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-200">
              Category: <span className="text-emerald-400 capitalize">{classificationResult.category}</span>
            </p>
            <p className="font-bold text-yellow-400 mt-1">
              Correct Bin: {classificationResult.correctBin}
            </p>
            <p className="text-slate-400 mt-1 text-xs">
              {classificationResult.explanation}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold mt-2">
              +{classificationResult.scoreAwarded} POINTS AWARDED TO CLOUD PROFILE
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
