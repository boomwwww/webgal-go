import { createAppCore, type AppCore } from '@webgal-go/core'
import { createInnerPlugin } from './inner-plugins'

declare module '@webgal-go/core' {
  export interface AppCore {
    use(plugin: WebgalPlugin): Webgal
    unUse(plugin: WebgalPlugin): Webgal
    hasUsedPlugin(plugin: WebgalPlugin): boolean
    version?: string
  }
}

export interface Webgal extends Required<AppCore> {}

export type WebgalPlugin = (webgal: Webgal) => () => void

export interface WebgalOptions {
  debug?: boolean
}

export const createWebgal = (userOptions?: WebgalOptions): Webgal => {
  const webgal = createAppCore() as Webgal

  webgal.use(createInnerPlugin({ debug: userOptions?.debug ?? false }))

  webgal.log(`WebGAL_GO v${webgal.version}`)
  webgal.log('Github: https://github.com/OpenWebGAL/WebGAL ')
  webgal.log('Made with ❤ by OpenWebGAL')

  return webgal
}

export type { Context, Effect } from './inner-plugins/ctx'
export type { BusEvents } from './inner-plugins/bus'
export type { Debugger } from './inner-plugins/debugger'
