import { type CompleteParserConfig, defaultEscapeConfigs } from '@/lib/config';

/** 场景接口 */
export interface IScene {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  sentenceList: Array<ISentence>; // 语句列表
  assetsList: Array<IAsset>; // 资源列表
  subSceneList: Array<string>; // 子场景的url列表
}

/** 单条语句接口 */
export interface ISentence {
  command: commandType; // 语句类型
  commandRaw: string; // 命令的原始内容，方便调试
  content: string; // 语句内容
  args: Array<arg>; // 参数列表
  sentenceAssets: Array<IAsset>; // 语句携带的资源列表
  subScene: Array<string>; // 语句包含子场景列表
}

/** 单个参数接口 */
export interface arg {
  key: string; // 参数键
  value: string | boolean | number; // 参数值
}

/** 资源接口 */
export interface IAsset {
  name: string; // 资源名称
  type: fileType; // 资源类型
  url: string; // 资源url
  lineNumber: number; // 触发资源语句的行号
}

/** 内置资源类型的枚举 */
export enum fileType {
  background,
  bgm,
  figure,
  scene,
  tex,
  vocal,
  video,
}

export type AssetsPrefetcher = (assetList: IAsset[]) => void;

export type AssetSetter = (fileName: string, assetType: fileType) => string;

/** 语句类型枚举 */
export enum commandType {
  say, // 对话
  changeBg, // 更改背景
  changeFigure, // 更改立绘
  bgm, // 更改背景音乐
  video, // 播放视频
  pixi, // pixi演出
  pixiInit, // pixi初始化
  intro, // 黑屏文字演示
  miniAvatar, // 小头像
  changeScene, // 切换场景
  choose, // 分支选择
  end, // 结束游戏
  setComplexAnimation, // 动画演出
  setFilter, // 设置效果
  label, // 标签
  jumpLabel, // 跳转标签
  chooseLabel, // 选择标签
  setVar, // 设置变量
  if, // 条件跳转
  callScene, // 调用场景
  showVars,
  unlockCg,
  unlockBgm,
  filmMode,
  setTextbox,
  setAnimation,
  playEffect,
  setTempAnimation,
  comment,
  setTransform,
  setTransition,
  getUserInput,
  applyStyle,
  wait,
}

export type ConfigItem = { scriptString: string; scriptType: commandType };

export type ConfigMap = Map<string, ConfigItem>;

/** 脚本配置 */
export const SCRIPT_CONFIG: Array<ConfigItem> = [
  { scriptString: 'intro', scriptType: commandType.intro },
  { scriptString: 'changeBg', scriptType: commandType.changeBg },
  { scriptString: 'changeFigure', scriptType: commandType.changeFigure },
  { scriptString: 'miniAvatar', scriptType: commandType.miniAvatar },
  { scriptString: 'changeScene', scriptType: commandType.changeScene },
  { scriptString: 'choose', scriptType: commandType.choose },
  { scriptString: 'end', scriptType: commandType.end },
  { scriptString: 'bgm', scriptType: commandType.bgm },
  { scriptString: 'playVideo', scriptType: commandType.video },
  {
    scriptString: 'setComplexAnimation',
    scriptType: commandType.setComplexAnimation,
  },
  { scriptString: 'setFilter', scriptType: commandType.setFilter },
  { scriptString: 'pixiInit', scriptType: commandType.pixiInit },
  { scriptString: 'pixiPerform', scriptType: commandType.pixi },
  { scriptString: 'label', scriptType: commandType.label },
  { scriptString: 'jumpLabel', scriptType: commandType.jumpLabel },
  { scriptString: 'setVar', scriptType: commandType.setVar },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'showVars', scriptType: commandType.showVars },
  { scriptString: 'unlockCg', scriptType: commandType.unlockCg },
  { scriptString: 'unlockBgm', scriptType: commandType.unlockBgm },
  { scriptString: 'say', scriptType: commandType.say },
  { scriptString: 'filmMode', scriptType: commandType.filmMode },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'setTextbox', scriptType: commandType.setTextbox },
  { scriptString: 'setAnimation', scriptType: commandType.setAnimation },
  { scriptString: 'playEffect', scriptType: commandType.playEffect },
  { scriptString: 'applyStyle', scriptType: commandType.applyStyle },
  { scriptString: 'wait', scriptType: commandType.wait },
];

export type CommandList = Array<commandType>;

/** 添加下一条语句的参数列表 */
export const ADD_NEXT_ARG_LIST: CommandList = [
  commandType.bgm,
  commandType.pixi,
  commandType.pixiInit,
  commandType.label,
  commandType.if,
  commandType.miniAvatar,
  commandType.setVar,
  commandType.unlockBgm,
  commandType.unlockCg,
  commandType.filmMode,
  commandType.playEffect,
];

interface IOptionItem {
  key: string;
  value: string | number | boolean;
}
interface IConfigItem {
  command: string;
  args: string[];
  options: IOptionItem[];
}

export type WebgalConfig = IConfigItem[];

export interface IWebGALStyleObj {
  classNameStyles: Record<string, string>;
  others: string;
}

export const compatParserConfig: CompleteParserConfig = {
  separators: {
    bodyStart: [':'],
    attributeStart: [' -'],
    attributeKeyValue: ['='],
    commentSeparators: [{ start: ';', end: ['\r\n', '\n', '\r'] }],
    sectionEnd: ['\r\n', '\n', '\r'],
  },
  escapeConfigs: defaultEscapeConfigs,
};
