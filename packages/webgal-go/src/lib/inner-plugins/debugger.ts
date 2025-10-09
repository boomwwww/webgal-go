import type { AppPlugin } from '@webgal-go/core'

declare module '@webgal-go/core' {
  export interface AppCore {
    debugger?: Debugger
    log(...args: any[]): void
  }
}

export interface Debugger {
  debug: boolean

  warn(...args: any[]): void
  error(...args: any[]): void
  info(...args: any[]): void
}

interface DebuggerOptions {
  debug?: boolean
}

const createDebugger = (options: DebuggerOptions): Debugger => {
  return {
    debug: options.debug ?? false,
    info(...args) {
      if (!this.debug) return
      console.info(...args)
    },
    warn(...args) {
      if (!this.debug) return
      console.warn(...args)
    },
    error(...args) {
      if (!this.debug) return
      console.error(...args)
    },
  }
}

export const createDebuggerInnerPlugin = (options: DebuggerOptions): AppPlugin => {
  return (app) => () => {
    app.debugger = createDebugger(options)
    app.log = function (...args) {
      console.log(...args)
    }
    return () => {}
  }
}
