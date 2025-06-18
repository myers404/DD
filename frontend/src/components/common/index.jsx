// frontend/src/components/common/index.jsx
// Export all common components for easier importing

export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Modal } from './Modal';

// ErrorBoundary component
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
                    <div className="text-center p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Component Error
                        </h3>

                        <p className="text-sm text-gray-500 mb-4">
                            This component encountered an error and couldn't render properly.
                        </p>

                        <button
                            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Try Again
                        </button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Show Error Details
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error?.toString()}
                                    </div>
                                    {this.state.errorInfo?.componentStack && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap text-xs">{this.state.errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export { ErrorBoundary };