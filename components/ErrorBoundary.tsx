import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

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
    error: null
  };


  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-grit-bg p-4">
          <div className="bg-white border-4 border-grit-dark shadow-grit p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error. We've logged this issue.
            </p>
            
            {this.state.error && (
              <div className="bg-gray-100 p-4 rounded text-left mb-6 overflow-auto max-h-32 text-xs font-mono border border-gray-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                icon={<RefreshCw size={18} />}
                className="w-full justify-center"
              >
                Reload Application
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'} 
                icon={<Home size={18} />}
                className="w-full justify-center"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
