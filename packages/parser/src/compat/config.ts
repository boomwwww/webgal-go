import { type Article, type Section } from '@/lib/config';
import { type ParserConfig, type ParserPlugin } from '@/lib/config';
import { type CompleteParserConfig, defaultEscapeConfigs } from '@/lib/config';

/** 兼容的文章 */
export interface CompatArticle extends Article {
  sections: Array<CompatSection>;
  assets?: Array<Asset>;
  sub?: Array<string>;
}

/** 兼容的段落 */
export interface CompatSection extends Section {
  commandCode?: number;
  assets?: Array<Asset>;
  sub?: Array<string>;
}

/** 场景解析器选项 */
export type SceneParserOptions = {
  config?: ParserConfig;
  plugins?:
    | Array<ParserPlugin>
    | { pre?: Array<ParserPlugin>; middle?: Array<ParserPlugin>; post?: Array<ParserPlugin> };
};

/** 兼容的解析器配置 */
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

/** 场景 */
export interface Scene {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  sentenceList: Array<Sentence>; // 语句列表
  assetsList: Array<Asset>; // 资源列表
  subSceneList: Array<string>; // 子场景的url列表
}

export type { Scene as IScene };

/** 语句 */
export interface Sentence {
  command: CommandCode | number; // 语句类型
  commandRaw: string; // 命令的原始内容，方便调试
  content: string; // 语句内容
  args: Array<Arg>; // 参数列表
  sentenceAssets: Array<Asset>; // 语句携带的资源列表
  subScene: Array<string>; // 语句包含子场景列表
}

export type { Sentence as ISentence };

/** 参数 */
export interface Arg {
  key: string; // 参数键
  value: string | boolean | number; // 参数值
}

export type { Arg as arg };

/** 资源 */
export interface Asset {
  name: string; // 资源名称
  type: FileCode | number; // 资源类型
  url: string; // 资源url
  lineNumber: number; // 触发资源语句的行号
}

export type { Asset as IAsset };

/** 内置资源类型的枚举 */
export enum FileCode {
  background,
  bgm,
  figure,
  scene,
  tex,
  vocal,
  video,
}

export { FileCode as fileType };

/** 资源预加载器 */
export type AssetsPrefetcher = (assetList: Array<Asset>) => void;

/** 资源路径设置器 */
export type AssetSetter = (fileName: string, assetType: FileCode | number) => string;

/** 命令类型枚举 */
export enum CommandCode {
  say, // 对话
  changeBg, // 更改背景
  changeFigure, // 更改立绘
  bgm, // 更改背景音乐
  video, // 播放视频
  pixi, // pixi演出
  pixiInit, // pixi初始化
  intro, // 全屏文字演示
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
  showVars, // 显示变量
  unlockCg, // 解锁CG
  unlockBgm, // 解锁BGM
  filmMode, // 电影模式
  setTextbox, // 设置文本框
  setAnimation, // 设置动画
  playEffect, // 播放特效
  setTempAnimation, // 临时动画
  comment, // 注释
  setTransform, // 设置变换
  setTransition, // 设置过渡
  getUserInput, // 获取用户输入
  applyStyle, // 应用样式
  wait, // 等待
}

export { CommandCode as commandType };

/** 命令代码列表 */
export type CommandCodeList = Array<CommandCode | number>;

/** 添加 next 参数的命令代码列表 */
export const ADD_NEXT_ARG_LIST: CommandCodeList = [
  CommandCode.bgm,
  CommandCode.pixi,
  CommandCode.pixiInit,
  CommandCode.label,
  CommandCode.if,
  CommandCode.miniAvatar,
  CommandCode.setVar,
  CommandCode.unlockBgm,
  CommandCode.unlockCg,
  CommandCode.filmMode,
  CommandCode.playEffect,
];

/** 配置项 */
export type CommandCodeItem = { scriptString: string; scriptType: CommandCode | number };

export type { CommandCodeItem as ConfigItem };

/** 配置项Map */
export type CommandCodeMap = Map<string, CommandCodeItem>;

export type { CommandCodeMap as ConfigMap };

/** 脚本配置 */
export const SCRIPT_CONFIG: Array<CommandCodeItem> = [
  { scriptString: 'intro', scriptType: CommandCode.intro },
  { scriptString: 'changeBg', scriptType: CommandCode.changeBg },
  { scriptString: 'changeFigure', scriptType: CommandCode.changeFigure },
  { scriptString: 'miniAvatar', scriptType: CommandCode.miniAvatar },
  { scriptString: 'changeScene', scriptType: CommandCode.changeScene },
  { scriptString: 'choose', scriptType: CommandCode.choose },
  { scriptString: 'end', scriptType: CommandCode.end },
  { scriptString: 'bgm', scriptType: CommandCode.bgm },
  { scriptString: 'playVideo', scriptType: CommandCode.video },
  { scriptString: 'setComplexAnimation', scriptType: CommandCode.setComplexAnimation },
  { scriptString: 'setFilter', scriptType: CommandCode.setFilter },
  { scriptString: 'pixiInit', scriptType: CommandCode.pixiInit },
  { scriptString: 'pixiPerform', scriptType: CommandCode.pixi },
  { scriptString: 'label', scriptType: CommandCode.label },
  { scriptString: 'jumpLabel', scriptType: CommandCode.jumpLabel },
  { scriptString: 'setVar', scriptType: CommandCode.setVar },
  { scriptString: 'callScene', scriptType: CommandCode.callScene },
  { scriptString: 'showVars', scriptType: CommandCode.showVars },
  { scriptString: 'unlockCg', scriptType: CommandCode.unlockCg },
  { scriptString: 'unlockBgm', scriptType: CommandCode.unlockBgm },
  { scriptString: 'say', scriptType: CommandCode.say },
  { scriptString: 'filmMode', scriptType: CommandCode.filmMode },
  { scriptString: 'callScene', scriptType: CommandCode.callScene },
  { scriptString: 'setTextbox', scriptType: CommandCode.setTextbox },
  { scriptString: 'setAnimation', scriptType: CommandCode.setAnimation },
  { scriptString: 'playEffect', scriptType: CommandCode.playEffect },
  { scriptString: 'applyStyle', scriptType: CommandCode.applyStyle },
  { scriptString: 'wait', scriptType: CommandCode.wait },
];
