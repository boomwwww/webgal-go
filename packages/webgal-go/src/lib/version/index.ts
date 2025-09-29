import type { AppPlugin } from '@webgal-go/core'
import { config } from '@/config'

declare module '@webgal-go/core' {
  export interface AppCore {
    version?: string
  }
}

export const innerPluginVersion: AppPlugin = (app) => {
  app.version = config.version
  return () => delete app.version
}
