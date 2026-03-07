import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './services/telemetry'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
