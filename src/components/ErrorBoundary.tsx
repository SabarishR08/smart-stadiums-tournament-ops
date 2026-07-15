import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Boundary Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl text-center max-w-lg mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {this.props.fallbackMessage || 
              "A sub-system of StadiumPulse AI has crashed due to an unexpected state. Rest assured, live logs have been recorded and operations teams are on it."}
          </p>
          {this.state.error && (
            <pre className="mt-4 p-3 bg-black/80 border border-slate-900 rounded-xl text-[10px] text-rose-400 font-mono text-left max-w-full overflow-x-auto select-all max-h-[120px]">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all focus:ring-4 focus:ring-blue-500/40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Interface</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
