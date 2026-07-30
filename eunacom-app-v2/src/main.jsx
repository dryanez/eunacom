import React from 'react'

window.globalDeferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.globalDeferredPrompt = e;
  window.dispatchEvent(new Event('pwa-prompt-ready'));
});
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
