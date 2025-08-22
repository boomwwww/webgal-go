import { useResize } from './ues-resize'
import { useServiceWorker } from './use-service-worker'
import { useTitleEnter } from './use-title-enter'
import { useIifePlugin } from './useIifePlugin'

export const useTitleEnterPage = () => {
  useResize()
  useServiceWorker()
  useTitleEnter()
  useIifePlugin()
}
