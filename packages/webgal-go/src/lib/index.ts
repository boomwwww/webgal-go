import * as _core from '@webgal-go/core'
import type { CreateWebgalOptions, Webgal } from '@/types'
import { config } from '@/config'
import { createParser } from './parser'
import { createBus } from './bus'
import { createDebugger } from './debugger'

export const createWebgal = (options?: CreateWebgalOptions): Webgal => {
  const _webgal: Webgal = {
    version: config.version,
    ctx: {},
    parser: createParser(),
    bus: createBus(),
    debugger: createDebugger({ debug: options?.debug ?? false }),
    use(plugin) {
      plugin.install(this)
      return this
    },
  }
  for (const plugin of options?.plugins ?? []) {
    plugin.install(_webgal)
  }
  return _webgal
}
