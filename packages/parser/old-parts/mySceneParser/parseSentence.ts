import type {
  IAsset,
  ISentence,
} from '../sceneParser/interface/sceneInterface';
import { commandType } from '../sceneParser/interface/sceneInterface';
import { fileType } from '../sceneParser/interface/assets';
import type { ConfigMap } from '../sceneParser/config/scriptConfig';
import type { CommonSentence } from './strToCommonSentenceArr';
export const parseSentence = (
  sentence: CommonSentence,
  assetSetter: (fileName: string, assetType: fileType) => string,
  ADD_NEXT_ARG_LIST: Array<commandType>,
  SCRIPT_CONFIG_MAP: ConfigMap,
): {
  parsedSentence: ISentence;
  assets: Array<IAsset>;
  subScenes: Array<string>;
} => {
  let parsedSentence: ISentence = {
    command: 0, // 语句类型
    commandRaw: '', // 命令的原始内容，方便调试
    content: '', // 语句内容
    args: [], // 参数列表
    sentenceAssets: [], // 语句携带的资源列表
    subScene: [], // 语句包含子场景列表
  };
  let assets: Array<IAsset> = [];
  let subScenes: Array<string> = [];
  if (sentence.header === '' && sentence.body === '') {
    // 注释
    parsedSentence.command = commandType.comment;
    parsedSentence.commandRaw = 'comment';
    parsedSentence.content = sentence.comment;
    parsedSentence.args.push({ key: 'next', value: true });
  } else if (sentence.header !== '' && sentence.body === '') {
    // 连续对话
  }

  return { parsedSentence, assets, subScenes };
};
