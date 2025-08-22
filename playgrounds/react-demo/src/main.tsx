import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app'
import '@/assets/style/index.scss'
import '@/assets/style/animation.scss'
import '@/assets/style/modern-css-reset/index.css'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
