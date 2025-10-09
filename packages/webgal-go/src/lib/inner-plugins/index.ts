import { AppPlugin } from '@webgal-go/core'
import { versionInnerPlugin } from './version'
import { contextInnerPlugin } from './ctx'
import { parserInnerPlugin } from './parser'
import { busInnerPlugin } from './bus'
import { createDebuggerInnerPlugin } from './debugger'

export const createInnerPlugin = (options: { debug: boolean }): AppPlugin => {
  return (app) => {
    app
      .use(versionInnerPlugin)
      .use(contextInnerPlugin)
      .use(parserInnerPlugin)
      .use(busInnerPlugin)
      .use(createDebuggerInnerPlugin({ debug: options?.debug ?? false }))
    return () => {}
  }
}
