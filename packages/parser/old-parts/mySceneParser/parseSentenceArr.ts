// import uniqWith from 'lodash/uniqWith';
import type {
  IAsset,
  ISentence,
} from '../sceneParser/interface/sceneInterface';
import { commandType } from '../sceneParser/interface/sceneInterface';
import { fileType } from '../sceneParser/interface/assets';
import type { ConfigMap } from '../sceneParser/config/scriptConfig';
import type { CommonSentence } from './strToCommonSentenceArr';
import { parseSentence } from './parseSentence';

export const parseSentenceArr = (
  sentenceArr: Array<CommonSentence>,
  assetSetter: (fileName: string, assetType: fileType) => string,
  ADD_NEXT_ARG_LIST: Array<commandType>,
  SCRIPT_CONFIG_MAP: ConfigMap,
): {
  sentenceList: Array<ISentence>;
  assetList: Array<IAsset>;
  subSceneList: Array<string>;
} => {
  let sentenceList: Array<ISentence> = [];
  let assetList: Array<IAsset> = [];
  let subSceneList: Array<string> = [];
  sentenceArr.forEach((sentence) => {
    const { parsedSentence, assets, subScenes } = parseSentence(
      sentence,
      assetSetter,
      ADD_NEXT_ARG_LIST,
      SCRIPT_CONFIG_MAP,
    );
    sentenceList.push(parsedSentence);
    assetList = [...assetList, ...assets];
    subSceneList = [...subSceneList, ...subScenes];
  });
  // assetList = uniqWith(assetList);
  assetList = [...new Set(assetList)]; // 注意，元素是对象可能不能发挥作用
  return { sentenceList, assetList, subSceneList };
};
