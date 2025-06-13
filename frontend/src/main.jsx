import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Performance monitoring
const startTime = window.appStartTime || Date.now();

// Error boundary for the entire app
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Show Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
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

// App initialization
function initializeApp() {
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    document.body.classList.add('app-loaded');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
  
  // Log performance metrics
  const loadTime = Date.now() - startTime;
  console.log(`App loaded in ${loadTime}ms`);
  
  // Performance tracking (you can send this to analytics)
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: 'app_load',
      value: loadTime
    });
  }
}

// Check for browser compatibility
function checkBrowserCompatibility() {
  const requiredFeatures = [
    'Promise',
    'fetch',
    'Map',
    'Set',
    'Symbol',
    'WeakMap',
    'WeakSet'
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
  
  if (missingFeatures.length > 0) {
    console.warn('Missing browser features:', missingFeatures);
    
    // Show compatibility warning
    const compatibilityWarning = document.createElement('div');
    compatibilityWarning.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #fbbf24;
        color: #92400e;
        padding: 12px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        z-index: 10000;
      ">
        <strong>Browser Compatibility Warning:</strong> 
        Your browser may not support all features. For the best experience, please update to a modern browser.
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: 12px;
          background: none;
          border: 1px solid currentColor;
          color: inherit;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        ">Dismiss</button>
      </div>
    `;
    document.body.appendChild(compatibilityWarning);
  }
}

// Main render function
function renderApp() {
  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    root.render(
      <React.StrictMode>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </React.StrictMode>
    );

    // Initialize app after render
    initializeApp();
    
  } catch (error) {
    console.error('Failed to render app:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
          ">
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">
              Failed to load the CPQ application. Please refresh the page or contact support.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #2563eb;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                cursor: pointer;
                font-weight: 500;
              "
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Check browser compatibility
checkBrowserCompatibility();

// Render the app
renderApp();

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Hot module replacement
  if (import.meta.hot) {
    import.meta.hot.accept();
  }
  
  // Development console message 
  console.log(
    '%cCPQ Enterprise Configuration System',
    'color: #2563eb; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cDevelopment Mode Active',
    'color: #059669; font-size: 14px;'
  );
  console.log('Performance monitoring enabled');
  console.log('Error boundaries active');
  
  // Expose React DevTools
  if (typeof window !== 'undefined') {
    window.React = React;
  }
}

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Disable React DevTools
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
  }
  
  // Console warning for production
  console.log(
    '%cCPQ Enterprise Configuration System',
    'color: #2563eb; font-size: 18px; font-weight: bold;'
  );
  console.log(
    '%cProduction Build - Version ' + (__APP_VERSION__ || '1.0.0'),
    'color: #059669; font-size: 12px;'
  );
}

// Service Worker Registration (Future Enhancement)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for testing
export { GlobalErrorBoundary };
