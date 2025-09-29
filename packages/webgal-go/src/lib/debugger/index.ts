import type { AppPlugin } from '@webgal-go/core'

declare module '@webgal-go/core' {
  export interface AppCore {
    debugger?: Debugger
  }
}

export interface Debugger {
  debug: boolean
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
}

const createDebugger = ({ debug }: { debug: boolean }): Debugger => {
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

export const createInnerPluginDebugger = ({ debug }: { debug: boolean }): AppPlugin => {
  return (app) => () => {
    app.debugger = createDebugger({ debug })
    return () => delete app.debugger
  }
}
