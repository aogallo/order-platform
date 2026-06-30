import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyInitialTheme } from './lib/theme'
import AppProviders from './providers/AppProviders'
import App from './App'

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
