import React from 'react';
import { Lock, RefreshCw, UserPlus, Shield } from 'lucide-react';

interface AuthPanelProps {
  accessibilityMode: boolean;
  isSignUp: boolean;
  email: string;
  password: string;
  authError: string;
  isAuthLoading: boolean;
  panelClasses: string;
  labelClasses: string;
  inputClasses: string;
  buttonClasses: string;
  onSetIsSignUp: (value: boolean) => void;
  onSetEmail: (value: string) => void;
  onSetPassword: (value: string) => void;
  onSetAuthError: (value: string) => void;
  onLogin: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
}

/**
 * Auth Panel - Login/Signup UI for Ops Dashboard
 * CRITICAL: handleSignUp defaults new users to 'fan' role (privilege-escalation fix)
 */
export default function AuthPanel({
  accessibilityMode: _accessibilityMode,
  isSignUp,
  email,
  password,
  authError,
  isAuthLoading,
  panelClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  onSetIsSignUp,
  onSetEmail,
  onSetPassword,
  onSetAuthError,
  onLogin,
  onSignUp
}: AuthPanelProps) {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className={`${panelClasses} relative overflow-hidden`}>
        
        <div className="text-center mb-6 relative z-10 pt-4">
          <div className="inline-flex p-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/40 rounded-xl mb-3">
            <Lock className="w-5 h-5 text-zinc-300" />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Ops Dashboard Sign In</h2>
          <p className="text-[11px] text-zinc-500 mt-1">Authorized FIFA Stadium Operations Staff Only</p>
        </div>

        <form onSubmit={isSignUp ? onSignUp : onLogin} className="space-y-4 relative z-10">
          <div>
            <label className={labelClasses}>Operations Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onSetEmail(e.target.value)}
              placeholder="steward@fifa2026.com"
              className={`w-full mt-1.5 ${inputClasses}`}
            />
          </div>

          <div>
            <label className={labelClasses}>Operations Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => onSetPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full mt-1.5 ${inputClasses}`}
            />
          </div>

          {authError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 border border-rose-500/20 rounded-lg">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isAuthLoading}
            className={`w-full ${buttonClasses} mt-2 flex items-center justify-center gap-2`}
          >
            {isAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isSignUp ? <UserPlus className="w-4 h-4" /> : <Shield className="w-4 h-4" />)}
            <span>{isSignUp ? 'Register Staff Account' : 'Authenticate Staff'}</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center text-xs">
          <button
            onClick={() => {
              onSetIsSignUp(!isSignUp);
              onSetAuthError('');
            }}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {isSignUp ? 'Already have an operations account? Log in' : 'No account? Create one immediately'}
          </button>
        </div>
      </div>
    </div>
  );
}
