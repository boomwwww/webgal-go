import SceneParser, { SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@webgal-go/parser';

const assetsPrefetcher = () => {};

const assetSetter = (fileName: string) => fileName;

const parser = new SceneParser(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

export default parser;
