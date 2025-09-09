import { type Context, type WebgalPlugin } from '@webgal-go/core'
import { type CompatSceneParser } from '@webgal-go/parser'
import { type Emitter } from '@/vendors/mitt'

declare module '@webgal-go/core' {
  export interface WebgalApp {
    parser: CompatSceneParser
    bus: Emitter<Required<BusEvents>>
    debugger: Debugger
  }
}

export { type Context }

export { type WebgalPlugin }

export interface CreateWebgalAppOptions {
  debug?: boolean
  plugins?: Array<WebgalPlugin>
}

export interface BusEvents {
  'text-settle': null
  'user-interact-next': null
  'fullscreen-db-click': null
  'style-update': null
}

export interface Debugger {
  debug: boolean
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
}
