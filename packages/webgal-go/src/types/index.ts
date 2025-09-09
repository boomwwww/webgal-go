import { type WebgalCore, type Context, type WebgalPlugin } from '@webgal-go/core'
import { type CompatSceneParser } from '@webgal-go/parser'
import { type Emitter } from '@/vendors/mitt'

export interface WebgalApp extends WebgalCore {
  parser: CompatSceneParser
  bus: Emitter<Required<BusEvents>>
  debugger: Debugger
}

export { type Context }

export interface BusEvents {
  'text-settle': null
  'user-interact-next': null
  'fullscreen-db-click': null
  'style-update': null
}

export interface CreateWebgalAppOptions {
  debug?: boolean
  plugins?: Array<WebgalPlugin>
}

export interface Debugger {
  debug: boolean
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
}
