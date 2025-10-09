import type { AppPlugin } from '@webgal-go/core'
import { createCompatSceneParser, SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@webgal-go/parser'
import type { CompatSceneParser } from '@webgal-go/parser'

declare module '@webgal-go/core' {
  export interface AppCore {
    parser?: CompatSceneParser
  }
}

const createParser = (): CompatSceneParser => {
  return createCompatSceneParser({
    assetsPrefetcher: (_a) => {},
    assetSetter: (n, _t) => n,
    addNextArgList: ADD_NEXT_ARG_LIST,
    scriptConfigInput: SCRIPT_CONFIG,
  })
}

export const parserInnerPlugin: AppPlugin = (app) => {
  app.parser = createParser()
  return () => {}
}
