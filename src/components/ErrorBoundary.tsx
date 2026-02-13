import React from 'react';

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true, error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log in dev
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (import.meta.env.PROD && (window as any).errorReporter) {
      (window as any).errorReporter.captureException(error, { contexts: { react: errorInfo } });
    }
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, maxWidth: 720 }}>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>Oops! Something went wrong</h1>
            <p style={{ color: '#6b7280' }}>We're sorry for the inconvenience. An unexpected error occurred.</p>
            {import.meta.env.DEV && (
              <pre style={{ marginTop: 12, background: '#f9fafb', padding: 12 }}>{this.state.error?.toString()}{'\n'}{this.state.errorInfo?.componentStack}</pre>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => (window.location.href = '/')} style={{ padding: '8px 12px', background: '#4f46e5', color: '#fff', borderRadius: 8 }}>Go Home</button>
              <button onClick={() => window.location.reload()} style={{ padding: '8px 12px', background: '#e5e7eb', color: '#111', borderRadius: 8 }}>Reload Page</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
