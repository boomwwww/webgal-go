import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/app.tsx'
import '@/assets/style/index.scss'
import '@/assets/style/animation.scss'
import '@/assets/style/modern-css-reset/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
