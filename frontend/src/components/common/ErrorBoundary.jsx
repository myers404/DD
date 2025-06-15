// frontend/src/components/common/ErrorBoundary.jsx
// Enhanced production-ready error boundary with recovery and monitoring

import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Report to error monitoring service in production
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      retryCount: this.state.retryCount,
      props: this.sanitizeProps(this.props)
    };

    // Store error report locally for debugging
    this.storeErrorLocally(errorReport);

    // Send to monitoring service (implement based on your service)
    this.sendToMonitoring(errorReport);
  };

  getUserId = () => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData).id : 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  sanitizeProps = (props) => {
    // Remove sensitive data from props before logging
    const sanitized = { ...props };
    delete sanitized.children;
    delete sanitized.onError;
    return sanitized;
  };

  storeErrorLocally = (errorReport) => {
    try {
      const errors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      errors.push(errorReport);

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }

      localStorage.setItem('error_reports', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error report locally:', e);
    }
  };

  sendToMonitoring = (errorReport) => {
    // Replace with your actual error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, Bugsnag, etc.
      try {
        // window.Sentry?.captureException(this.state.error, {
        //   contexts: { errorBoundary: errorReport }
        // });

        // Or send to your own monitoring endpoint
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        }).catch(() => {
          // Ignore monitoring failures
        });
      } catch (e) {
        console.warn('Failed to send error to monitoring service:', e);
      }
    }
  };

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;

    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        showDetails: false
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      errorId: null
    });
  };

  copyErrorToClipboard = () => {
    const errorData = {
      id: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
        .then(() => {
          // Could show a toast notification here
          console.log('Error details copied to clipboard');
        })
        .catch(() => {
          console.warn('Failed to copy error details');
        });
  };

  getErrorSeverity = () => {
    const error = this.state.error;
    if (!error) return 'medium';

    // Determine severity based on error type
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'low'; // Usually a network/deployment issue
    }
    if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
      return 'medium'; // Common React errors
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'low'; // Network issues
    }

    return 'high'; // Unknown or serious errors
  };

  getSuggestions = () => {
    const error = this.state.error;
    if (!error) return [];

    const suggestions = [];

    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      suggestions.push('This appears to be a loading issue. Try refreshing the page.');
      suggestions.push('Clear your browser cache and try again.');
    }

    if (error.message.includes('Network') || error.message.includes('fetch')) {
      suggestions.push('Check your internet connection.');
      suggestions.push('The server might be temporarily unavailable.');
    }

    if (error.name === 'TypeError') {
      suggestions.push('This might be a temporary data issue.');
      suggestions.push('Try navigating back and retrying your action.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try refreshing the page.');
      suggestions.push('If the problem persists, contact support.');
    }

    return suggestions;
  };

  render() {
    if (this.state.hasError) {
      const {
        title = "Something went wrong",
        message = "An unexpected error occurred. We've been notified and are working to fix it.",
        showRetry = true,
        showHome = true,
        showDetails = process.env.NODE_ENV === 'development',
        size = 'medium',
        onError
      } = this.props;

      const maxRetries = this.props.maxRetries || 3;
      const canRetry = showRetry && this.state.retryCount < maxRetries;
      const severity = this.getErrorSeverity();
      const suggestions = this.getSuggestions();

      // Call onError prop if provided
      if (onError && typeof onError === 'function') {
        onError(this.state.error, this.state.errorInfo);
      }

      // Different layouts based on size
      const containerClasses = {
        small: 'p-4',
        medium: 'p-8',
        large: 'p-12'
      };

      const iconClasses = {
        small: 'w-8 h-8',
        medium: 'w-16 h-16',
        large: 'w-24 h-24'
      };

      const severityColors = {
        low: 'text-yellow-500',
        medium: 'text-orange-500',
        high: 'text-red-500'
      };

      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-md w-full bg-white rounded-lg shadow-lg ${containerClasses[size]}`}
            >
              {/* Error Icon */}
              <div className="text-center mb-6">
                <ExclamationTriangleIcon
                    className={`mx-auto ${iconClasses[size]} ${severityColors[severity]}`}
                />
              </div>

              {/* Error Title */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
              </div>

              {/* Error ID */}
              <div className="text-center mb-4">
                <p className="text-xs text-gray-500">
                  Error ID: {this.state.errorId}
                </p>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-md">
                    <div className="flex items-center mb-2">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Suggestions</span>
                    </div>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
              )}

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-600">
                      Retry attempts: {this.state.retryCount} / {maxRetries}
                    </p>
                  </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {canRetry && (
                    <button
                        onClick={this.handleRetry}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Page
                </button>

                {showHome && (
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Go Home
                    </button>
                )}

                <button
                    onClick={this.handleReset}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset Error State
                </button>
              </div>

              {/* Error Details (Development) */}
              {showDetails && (this.state.error || this.state.errorInfo) && (
                  <motion.div className="mt-6 border-t pt-6">
                    <button
                        onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                  <span className="flex items-center">
                    <BugAntIcon className="w-4 h-4 mr-2" />
                    Error Details
                  </span>
                      {this.state.showDetails ? (
                          <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </button>

                    {this.state.showDetails && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-4"
                        >
                          {/* Copy Button */}
                          <button
                              onClick={this.copyErrorToClipboard}
                              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                            Copy Error Details
                          </button>

                          {/* Error Message */}
                          {this.state.error && (
                              <div>
                                <strong className="text-red-600 text-xs">Error:</strong>
                                <pre className="mt-1 whitespace-pre-wrap text-red-600 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                          {this.state.error.toString()}
                        </pre>
                              </div>
                          )}

                          {/* Stack Trace */}
                          {this.state.error?.stack && (
                              <div>
                                <strong className="text-red-600 text-xs">Stack Trace:</strong>
                                <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                              </div>
                          )}

                          {/* Component Stack */}
                          {this.state.errorInfo?.componentStack && (
                              <div>
                                <strong className="text-red-600 text-xs">Component Stack:</strong>
                                <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                              </div>
                          )}
                        </motion.div>
                    )}
                  </motion.div>
              )}
            </motion.div>
          </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
        <ErrorBoundary {...errorBoundaryProps}>
          <Component {...props} />
        </ErrorBoundary>
    );
  };
};

// Hook for throwing errors in functional components
export const useErrorHandler = () => {
  return (error, errorInfo = {}) => {
    // Throw error to be caught by nearest error boundary
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  };
};

// Async error boundary wrapper
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
          <ErrorBoundary
              title="Async Operation Failed"
              message="An error occurred while loading data. Please try again."
              size="small"
          />
      );
    }

    return this.props.children;
  }
}

// Network error boundary for API failures
export class NetworkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isNetworkError: false };
  }

  static getDerivedStateFromError(error) {
    const isNetworkError = error.name === 'NetworkError' ||
        error.message.includes('fetch') ||
        error.message.includes('Network');

    return {
      hasError: true,
      isNetworkError
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NetworkErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
          <ErrorBoundary
              title={this.state.isNetworkError ? "Connection Problem" : "Something went wrong"}
              message={this.state.isNetworkError
                  ? "Please check your internet connection and try again."
                  : "An unexpected error occurred. Please try again."
              }
              size="small"
              showRetry={true}
          />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;