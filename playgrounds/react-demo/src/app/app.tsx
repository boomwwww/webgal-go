import { useAppInit } from './hooks'
import EnterPage from './layouts/enter-page'
import WebgalRoot from './layouts/webgal-root'
import './style/app.css'

export default function App() {
  useAppInit()
  return (
    <>
      <EnterPage />
      <WebgalRoot />
    </>
  )
}
