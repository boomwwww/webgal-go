import { createSceneParser, SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@webgal-go/parser';

export const createParser = () => {
  return createSceneParser({
    assetsPrefetcher: (_a) => {},
    assetSetter: (n, _t) => n,
    addNextArgList: ADD_NEXT_ARG_LIST,
    scriptConfigInput: SCRIPT_CONFIG,
  });
};
