import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PixelButton } from './PixelButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#5C94FC] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FAF8F5] border-4 border-[#102040] shadow-[6px_6px_0px_#102040] p-6 text-center">
            <div className="w-16 h-16 bg-[#D32F2F] text-white font-pixel text-2xl flex items-center justify-center mx-auto mb-4 border-3 border-[#102040] shadow-[3px_3px_0px_#102040]">
              !
            </div>

            <h1 className="font-pixel text-base sm:text-lg uppercase text-[#102040] mb-2">
              SYSTEM GLITCH
            </h1>

            <p className="font-mono text-xs sm:text-sm text-[#64748B] mb-4">
              An unexpected glitch occurred in the scoreboard matrix.
            </p>

            {this.state.error && (
              <div className="bg-[#FEF2F2] border-2 border-[#102040] p-3 text-left mb-6 overflow-x-auto">
                <p className="font-mono text-xs text-[#991B1B] break-all font-semibold">
                  {this.state.error.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <PixelButton variant="primary" onClick={this.handleReload} fullWidth>
                RELOAD SCOREBOARD
              </PixelButton>
              <PixelButton variant="ghost" onClick={this.handleReset} fullWidth>
                BACK TO HOME
              </PixelButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
