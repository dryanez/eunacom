import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App-ios.jsx'

// Inside the native app (Capacitor, iOS/Android) the page origin is
// capacitor://localhost or https://localhost, so relative /api calls would
// miss Vercel. Send them to the live site (its /api allows any origin).
if (window.Capacitor?.isNativePlatform?.()) {
  const API_ORIGIN = 'https://www.eunacomapp.cl'
  const nativeFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) input = API_ORIGIN + input
    return nativeFetch(input, init)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
