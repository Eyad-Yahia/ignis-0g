import React from 'react';
import { Flame, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * React class-based ErrorBoundary — catches any uncaught render errors and
 * shows a clean mission-abort recovery screen instead of a blank page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to console only — no external service, no sensitive data
    console.error('[IGNIS-0G] Uncaught React error:', error.message, info.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const msg = this.state.error?.message ?? 'An unexpected runtime error occurred.';

    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center px-6 font-sans">
        <div className="max-w-lg w-full space-y-6 text-center">
          {/* Icon cluster */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-mono font-bold text-xl text-zinc-100 tracking-wider uppercase">
              IGNIS-0G — Mission Abort
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              An unrecoverable runtime error was detected in the application.
              All live telemetry state has been safely terminated.
            </p>
          </div>

          {/* Error message */}
          <div className="bg-[#111114] border border-red-500/20 rounded-lg p-4 text-left">
            <div className="text-[11px] font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Error Telemetry
            </div>
            <p className="font-mono text-xs text-zinc-300 break-words">{msg}</p>
          </div>

          {/* Recovery action */}
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-mono font-semibold text-sm rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </button>

          <p className="text-[11px] text-zinc-600 font-mono">
            NASA-STD-6001B · IGNIS-0G v2.0 · All credentials are RAM-only and will be cleared on reload.
          </p>
        </div>
      </div>
    );
  }
}
