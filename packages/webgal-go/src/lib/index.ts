import type { Webgal } from '@/types'
import { config } from '@/config'
import { createParser } from './parser'
import { createBus } from './bus'
import { createDebugger } from './debugger'

export const createWebgal = (): Webgal => {
  return {
    version: config.version,
    ctx: {},
    parser: createParser(),
    bus: createBus(),
    debugger: createDebugger({ shouldDebug: false }),
    use(plugin) {
      plugin.install(this)
      return this
    },
  }
}
