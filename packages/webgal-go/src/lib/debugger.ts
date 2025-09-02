import type { Debugger } from '@/types'

export const createDebugger = ({ debug }: { debug: boolean }): Debugger => {
  return {
    debug: debug,
    log(...args) {
      console.log(...args)
    },
    warn(...args) {
      if (!this.debug) return
      console.warn(...args)
    },
    error(...args) {
      if (!this.debug) return
      console.error(...args)
    },
    info(...args) {
      if (!this.debug) return
      console.info(...args)
    },
  }
}
