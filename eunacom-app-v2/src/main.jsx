import React from 'react'

window.globalDeferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.globalDeferredPrompt = e;
  window.dispatchEvent(new Event('pwa-prompt-ready'));
});

// Auto-reload when a new Service Worker takes control.
// This ensures users never run stale cached JS after a deploy or domain change.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
