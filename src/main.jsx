import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Proto from './proto/Proto.jsx'

// Prototype branch: the redesign renders by default; ?classic shows the current site.
const Root = new URLSearchParams(window.location.search).has('classic') ? App : Proto

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
