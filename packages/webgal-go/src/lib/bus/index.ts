import type { AppPlugin } from '@webgal-go/core'
import mitt from '@/vendors/mitt'

declare module '@webgal-go/core' {
  export interface AppCore {
    bus?: Bus
  }
}

type Bus = ReturnType<typeof mitt<Required<BusEvents>>>

export interface BusEvents {
  'text-settle': null
  'user-interact-next': null
  'fullscreen-db-click': null
  'style-update': null
}

const createBus = (): Bus => {
  return mitt()
}

export const innerPluginBus: AppPlugin = (app) => {
  app.bus = createBus()
  return () => delete app.bus
}
