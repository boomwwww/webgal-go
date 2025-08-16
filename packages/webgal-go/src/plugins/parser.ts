import { createSceneParser, SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@webgal-go/parser';

const _assetsPrefetcher = () => {};

const _assetSetter = (fileName: string) => fileName;

export const parser = createSceneParser({
  assetsPrefetcher: _assetsPrefetcher,
  assetSetter: _assetSetter,
  addNextArgList: ADD_NEXT_ARG_LIST,
  scriptConfigInput: SCRIPT_CONFIG,
});
