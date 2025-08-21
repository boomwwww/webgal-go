import type { Debugger } from '@/types'

export const createDebugger = ({ shouldDebug }: { shouldDebug: boolean }): Debugger => {
  const _debugger: Debugger = {
    shouldDebug: shouldDebug,
    log: (...args) => {
      if (!_debugger.shouldDebug) return
      console.log(...args)
    },
    warn: (...args) => {
      if (!_debugger.shouldDebug) return
      console.warn(...args)
    },
    error: (...args) => {
      if (!_debugger.shouldDebug) return
      console.error(...args)
    },
  }
  return _debugger
}
