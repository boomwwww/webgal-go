import { type WebgalCore, type Context } from '@webgal-go/core'
import { type CompatSceneParser } from '@webgal-go/parser'
import { type Emitter } from '@/vendors/mitt'

export interface Webgal extends WebgalCore {
  readonly parser: CompatSceneParser
  readonly bus: Emitter<Required<BusEvents>>
  readonly debugger: Debugger
  readonly use: (plugin: WebgalPlugin) => Webgal
}

export { type Context }

export interface BusEvents {
  'text-settle': null
  'user-interact-next': null
  'fullscreen-db-click': null
  'style-update': null
}

export interface CreateWebgalOptions {
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

export interface WebgalPlugin {
  install: (webgal: Webgal) => void
}
