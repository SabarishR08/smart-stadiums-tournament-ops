import React, { useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import { SharedFanViewProps } from './types';

interface ChatConciergeProps extends SharedFanViewProps {
  chatInput: string;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  voiceInputActive: boolean;
  voiceOutputActive: boolean;
  onChatInputChange: (value: string) => void;
  onSendChat: (e: React.FormEvent) => void;
  onToggleVoiceInput: () => void;
  onToggleVoiceOutput: () => void;
}

/**
 * ChatConcierge Component
 *
 * An interactive AI-powered assistant panel providing real-time answers
 * regarding wayfinding, gate access, dining options, restrooms, and schedules.
 * Supports multilingual replies, text-to-speech, and speech-to-text.
 *
 * @param props The props for the component.
 * @returns A polished conversational concierge card.
 */
export default function ChatConcierge({
  accessibilityMode,
  cardClasses,
  headingSize,
  chatInput,
  chatMessages,
  isChatLoading,
  voiceInputActive,
  voiceOutputActive,
  onChatInputChange,
  onSendChat,
  onToggleVoiceInput,
  onToggleVoiceOutput
}: ChatConciergeProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const inputClasses = accessibilityMode 
    ? 'py-3 px-4 bg-white text-black font-bold text-lg border-4 border-black focus:ring-4 focus:ring-yellow-400' 
    : 'py-2 px-3 bg-zinc-950/60 border border-zinc-800/80 text-zinc-200 rounded-lg text-sm placeholder-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const buttonClasses = accessibilityMode 
    ? 'py-3 px-6 bg-white text-black font-black text-lg uppercase border-4 border-black hover:bg-yellow-400 disabled:opacity-50 focus:ring-4 focus:ring-yellow-400' 
    : 'py-2 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-500/20 transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]';

  return (
    <section className={`${cardClasses} flex flex-col h-[520px]`} aria-label="AI Concierge Companion">
      
      {/* Header with speech options */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
        <h2 className={`${headingSize} !mb-0`}>
          <Sparkles className="w-5 h-5 inline-block text-zinc-400" />
          <span>Multilingual AI Concierge</span>
        </h2>

        <div className="flex items-center gap-1.5">
          {/* Text-to-Speech Output Toggle */}
          <button
            onClick={onToggleVoiceOutput}
            className={`p-2 rounded-lg border text-xs flex items-center justify-center focus:ring-4 focus:ring-yellow-400 ${voiceOutputActive ? 'bg-white border-zinc-200 text-black shadow-lg' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'}`}
            aria-label={voiceOutputActive ? "Mute automatic voice response" : "Enable automatic voice reading"}
            title={voiceOutputActive ? "Mute Speech Out" : "Enable Speech Out"}
          >
            {voiceOutputActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </div>

      {/* Message Box - CRITICAL: aria-live="polite" and role="log" preserved for accessibility */}
      <div 
        className={`flex-1 overflow-y-auto p-3 space-y-3 rounded-xl mb-3 ${accessibilityMode ? 'border-2 border-white' : 'bg-zinc-950/40 border border-zinc-900/60'}`}
        role="log"
        aria-live="polite"
        aria-label="Concierge Chat logs"
      >
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`p-3 max-w-[85%] text-sm ${msg.sender === 'user' 
                ? (accessibilityMode ? 'bg-white text-black border border-black font-bold' : 'bg-zinc-100/10 border border-zinc-200/20 rounded-2xl rounded-tr-none text-white') 
                : (accessibilityMode ? 'bg-black text-white border-2 border-white' : 'bg-zinc-900/40 border border-zinc-800/60 rounded-2xl rounded-tl-none text-zinc-300')
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <span className="text-[9px] block text-right mt-1 opacity-60 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-xl text-sm ${accessibilityMode ? 'border border-white' : 'bg-slate-900 text-slate-400'}`}>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full delay-150"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 animate-bounce rounded-full delay-300"></span>
                <span>StadiumPulse AI is replying...</span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form with Speech Recognition */}
      <form onSubmit={onSendChat} className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleVoiceInput}
          className={`p-3 border flex items-center justify-center shrink-0 focus:ring-4 focus:ring-yellow-400 ${voiceInputActive ? 'bg-rose-600 border-rose-500 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 rounded-lg'}`}
          aria-label={voiceInputActive ? "Stop speaking" : "Start speaking concierge request"}
          title={voiceInputActive ? "Listening..." : "Speak Request"}
        >
          {voiceInputActive ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder="Ask about gate, match, seat..."
          className={`flex-1 ${inputClasses}`}
          aria-label="Type your concierge question"
          disabled={isChatLoading}
        />

        <button
          type="submit"
          className={buttonClasses}
          disabled={isChatLoading || !chatInput.trim()}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}
