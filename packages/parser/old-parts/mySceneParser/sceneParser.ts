import type { IAsset, IScene } from '../sceneParser/interface/sceneInterface';
import { commandType } from '../sceneParser/interface/sceneInterface';
import { fileType } from '../sceneParser/interface/assets';
import type { ConfigMap } from '../sceneParser/config/scriptConfig';
import { strToCommonSentenceArr } from './strToCommonSentenceArr';
import { trimCommonSentence } from './trimCommonSentence';
import { parseSentenceArr } from './parseSentenceArr';

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher 资源预加载器
 * @param assetSetter 资源设置器
 * @param ADD_NEXT_ARG_LIST 添加下一句的命令
 * @param SCRIPT_CONFIG_MAP 脚本配置
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (
  rawScene: string,
  sceneName: string,
  sceneUrl: string,
  assetsPrefetcher: (assetList: Array<IAsset>) => void,
  assetSetter: (fileName: string, assetType: fileType) => string,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): IScene => {
  const commonSentenceArr = strToCommonSentenceArr(rawScene);
  const trimedCommonSentenceArr = commonSentenceArr.map(trimCommonSentence);
  const { sentenceList, assetList, subSceneList } = parseSentenceArr(
    trimedCommonSentenceArr,
    assetSetter,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG_MAP,
  );
  assetsPrefetcher(assetList);
  return {
    sceneName,
    sceneUrl,
    sentenceList,
    assetsList: assetList,
    subSceneList,
  };
};
