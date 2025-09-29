import { createAppCore, type AppCore } from '@webgal-go/core'
import { innerPluginVersion } from './version'
import { innerPluginContext } from './ctx'
import { innerPluginParser } from './parser'
import { innerPluginBus } from './bus'
import { createInnerPluginDebugger } from './debugger'

declare module '@webgal-go/core' {
  export interface AppCore {
    use(plugin: WebgalPlugin): this
    unuse(plugin: WebgalPlugin): this
    hasUsedPlugin(plugin: WebgalPlugin): boolean
    version?: string
  }
}

export type Webgal = Required<AppCore>

export type WebgalPlugin = (webgal: Webgal) => () => void

export interface CreateWebgalAppOptions {
  debug?: boolean
}

export const createWebgal = (options?: CreateWebgalAppOptions): Webgal => {
  const webgal = createAppCore() as Webgal

  webgal
    .use(innerPluginVersion)
    .use(innerPluginContext)
    .use(innerPluginParser)
    .use(innerPluginBus)
    .use(createInnerPluginDebugger({ debug: options?.debug ?? false }))

  return webgal
}

export type { Context, Effect } from './ctx'
export type { BusEvents } from './bus'
