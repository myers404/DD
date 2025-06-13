import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
      eventId: this.generateErrorId(),
    });

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  generateErrorId = () => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  logErrorToService = (error, errorInfo) => {
    // Example: Send to error tracking service
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
    console.log('Error logged to service:', { error, errorInfo });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, eventId } = this.state;
      const {
        title = 'Something went wrong',
        message = 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
        showDetails = process.env.NODE_ENV === 'development',
        showActions = true,
        size = 'large',
      } = this.props;

      // Different layouts based on size
      if (size === 'small') {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">
                  {error?.message || 'Something went wrong'}
                </p>
              </div>
              <button
                onClick={this.handleRetry}
                className="ml-4 text-red-800 hover:text-red-900 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-64 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </motion.div>

            {/* Error Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              {title}
            </motion.h2>

            {/* Error Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-6"
            >
              {message}
            </motion.p>

            {/* Error ID */}
            {eventId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-3 mb-6"
              >
                <p className="text-xs text-gray-500 mb-1">Error ID for support:</p>
                <code className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                  {eventId}
                </code>
              </motion.div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleGoHome}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                  >
                    <HomeIcon className="w-4 h-4 mr-1" />
                    Home
                  </button>

                  <button
                    onClick={this.handleRefresh}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Refresh
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Details (Development Only) */}
            {showDetails && error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-left"
              >
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  <BugAntIcon className="w-4 h-4 mr-1" />
                  Show Technical Details
                </summary>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs font-mono overflow-auto max-h-64">
                  <div className="mb-3">
                    <strong className="text-red-600">Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-gray-800">
                      {error.toString()}
                    </pre>
                  </div>
                  
                  {error.stack && (
                    <div className="mb-3">
                      <strong className="text-red-600">Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo && errorInfo.componentStack && (
                    <div>
                      <strong className="text-red-600">Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.details>
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

export default ErrorBoundary;
