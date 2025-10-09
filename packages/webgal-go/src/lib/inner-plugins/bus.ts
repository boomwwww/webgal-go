import type { AppPlugin } from '@webgal-go/core'
import mitt from '@/vendors/mitt'

declare module '@webgal-go/core' {
  export interface AppCore {
    bus?: Bus
  }
}

type Bus = ReturnType<typeof mitt<Required<BusEvents>>>

export interface BusEvents {}

const createBus = (): Bus => {
  return mitt()
}

export const busInnerPlugin: AppPlugin = (app) => {
  app.bus = createBus()
  return () => {}
}
