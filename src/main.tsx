import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA with auto-update support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Check for updates every 30 minutes
      setInterval(() => registration.update(), 30 * 60 * 1000)

      // When a new SW is found and activated, reload to get fresh content
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            // New version activated — reload to show updated content
            window.location.reload()
          }
        })
      })
    } catch (err) {
      console.warn('SW registration failed:', err)
    }
  })
}
