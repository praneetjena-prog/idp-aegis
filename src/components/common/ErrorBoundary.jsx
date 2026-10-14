import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AEGIS Runtime Exception]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#home';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-12 bg-white dark:bg-[#1A222B] border-2 border-[#C05043] rounded-2xl shadow-xl space-y-4 font-mono text-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C05043]/15 text-[#C05043] flex items-center justify-center font-bold">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">
                Application View Exception
              </h2>
              <p className="text-[10px] text-[#8A8175]">
                AEGIS error boundary intercepted a view runtime error.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] rounded-lg text-[#C05043] break-words text-[11px]">
            {this.state.error?.message || 'An unknown error occurred during component rendering.'}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button variant="default" size="sm" onClick={this.handleReset}>
              <RefreshCw size={12} className="mr-1.5" /> Recover View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.hash = '#home';
                  window.location.reload();
                }
              }}
            >
              <Home size={12} className="mr-1.5" /> Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
