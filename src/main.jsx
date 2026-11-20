import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Proto from './proto/Proto.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Proto />
  </StrictMode>,
)
