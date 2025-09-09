import { createWebgalCore } from '@webgal-go/core'
import type { CreateWebgalAppOptions, WebgalApp } from '@/types'
import { config } from '@/config'
import { createParser } from './parser'
import { createBus } from './bus'
import { createDebugger } from './debugger'

export const createWebgalApp = (options?: CreateWebgalAppOptions): WebgalApp => {
  const webgalApp = createWebgalCore({
    version: config.version,
    plugins: options?.plugins,
  }) as WebgalApp
  webgalApp.parser = createParser()
  webgalApp.bus = createBus()
  webgalApp.debugger = createDebugger({ debug: options?.debug ?? false })
  return webgalApp
}
