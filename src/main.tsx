import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { showUpdatePrompt } from './updatePrompt'

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

      // A new version shows a small prompt instead of reloading by itself.
      // A forced reload blanks the screen mid-use; without it the new version
      // loads on the next launch anyway, because the SW already claimed the page.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            showUpdatePrompt()
          }
        })
      })
    } catch (err) {
      console.warn('SW registration failed:', err)
    }
  })
}
