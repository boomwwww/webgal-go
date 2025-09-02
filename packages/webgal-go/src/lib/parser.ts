import { createCompatSceneParser, SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@webgal-go/parser'

export const createParser = () => {
  return createCompatSceneParser({
    assetsPrefetcher: (_a) => {},
    assetSetter: (n, _t) => n,
    addNextArgList: ADD_NEXT_ARG_LIST,
    scriptConfigInput: SCRIPT_CONFIG,
  })
}
