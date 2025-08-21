import { useAppInit } from './hooks'
import { EnterPage, WebgalRoot } from './layouts'
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
