import { useResize } from './ues-resize'
import { useServiceWorker } from './use-service-worker'
import { useTitleEnter } from './use-title-enter'
import { useIifePlugin } from './use-iife-plugin'

export const useTitleEnterPage = () => {
  useResize()
  useServiceWorker()
  useTitleEnter()
  useIifePlugin()
}
