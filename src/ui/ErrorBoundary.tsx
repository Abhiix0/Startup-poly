import { Component, ErrorInfo, ReactNode } from 'react';
import { PixelButton } from './PixelButton';
import { logger } from '../lib/logger';

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
    logger.error('ErrorBoundary', 'Uncaught application error:', error, errorInfo);
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-sky flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-50 border-4 border-brand-navy shadow-pixel-lg overflow-hidden">
            {/* Red Accent Header Bar */}
            <div className="bg-brand-red border-b-4 border-brand-navy px-4 py-2 flex items-center justify-between">
              <span className="font-pixel text-xs text-brand-white uppercase tracking-wider">
                ★ GAME ERROR ★
              </span>
              <span className="font-pixel text-xs text-brand-white">
                !
              </span>
            </div>

            <div className="p-6 text-center">
              {/* Alert icon */}
              <div className="w-14 h-14 bg-brand-red text-brand-white border-3 border-brand-navy shadow-pixel-sm flex items-center justify-center mx-auto mb-4 font-pixel text-2xl">
                !
              </div>

              <h1 className="font-pixel text-sm sm:text-base uppercase text-brand-navy mb-2">
                SOMETHING WENT WRONG
              </h1>

              <p className="font-mono text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed">
                An unexpected condition occurred in the game interface.
              </p>

              <PixelButton
                variant="primary"
                onClick={this.handleTryAgain}
                fullWidth
              >
                TRY AGAIN
              </PixelButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
