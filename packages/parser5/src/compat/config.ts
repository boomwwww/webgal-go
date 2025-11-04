import { type Article, type Section } from '@/lib/config'
import { type Parser, type ParserOptions, type ParserPlugin } from '@/lib/config'
import { type ParserConfig, getDefaultEscapeConfigs } from '@/lib/config'

/** 兼容的文章 */
export interface CompatArticle extends Article {
  sections: Array<CompatSection>
  assets?: Array<Asset>
  sub?: Array<string>
}

/** 兼容的段落 */
export interface CompatSection extends Section {
  commandCode?: number
  assets?: Array<Asset>
  sub?: Array<string>
}

/** 场景解析器选项 */
export interface SceneParserOptions {
  parserOptions?: ParserOptions
  plugins?:
    | Array<ParserPlugin>
    | { pre?: Array<ParserPlugin>; middle?: Array<ParserPlugin>; post?: Array<ParserPlugin> }
}

/** 创建场景解析器选项 */
export interface CompatSceneParserOptions extends SceneParserOptions {
  assetsPrefetcher?: AssetsPrefetcher
  assetSetter?: AssetSetter
  addNextArgList?: CommandCodeList
  scriptConfigInput?: Array<CommandCodeItem> | CommandCodeMap
}

export interface CompatSceneParser {
  _assetsPrefetcher: AssetsPrefetcher
  _assetSetter: AssetSetter
  _addNextArgList: CommandCodeList
  _scriptConfigMap: CommandCodeMap
  _parser: Parser
  parse: (rawScene: string, sceneName: string, sceneUrl: string) => Scene
  parseConfig: (configText: string) => WebgalConfig
  stringifyConfig: (config: WebgalConfig) => string
  parseScssToWebgalStyleObj: (scssString: string) => WebGALStyle
}

/** 兼容的解析器配置
 * @return CompatParserConfig
 * @pure
 */
export const getCompatParserConfig = (): ParserConfig => ({
  separators: {
    bodyStart: [':'],
    attributeStart: [' -'],
    attributeKeyValue: ['='],
    commentSeparators: [{ start: ';', end: ['\r\n', '\n', '\r'] }],
    sectionEnd: ['\r\n', '\n', '\r'],
  },
  escapeConfigs: getDefaultEscapeConfigs(),
})

/** 场景 */
export interface Scene {
  sceneName: string // 场景名称
  sceneUrl: string // 场景url
  sentenceList: Array<Sentence> // 语句列表
  assetsList: Array<Asset> // 资源列表
  subSceneList: Array<string> // 子场景的url列表
}

export type { Scene as IScene }

/** 语句 */
export interface Sentence {
  command: CommandCode | number // 语句类型
  commandRaw: string // 命令的原始内容，方便调试
  content: string // 语句内容
  args: Array<Arg> // 参数列表
  sentenceAssets: Array<Asset> // 语句携带的资源列表
  subScene: Array<string> // 语句包含子场景列表
}

export type { Sentence as ISentence }

/** 参数 */
export interface Arg {
  key: string // 参数键
  value: string | boolean | number // 参数值
}

export type { Arg as arg }

/** 资源 */
export interface Asset {
  name: string // 资源名称
  type: FileCode | number // 资源类型
  url: string // 资源url
  lineNumber: number // 触发资源语句的行号
}

export type { Asset as IAsset }

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

export { FileCode as fileType }

/** 资源预加载器 */
export type AssetsPrefetcher = (assetList: Array<Asset>) => void

/** 资源路径设置器 */
export type AssetSetter = (fileName: string, assetType: FileCode | number) => string

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

export { CommandCode as commandType }

/** 命令代码列表 */
export type CommandCodeList = Array<CommandCode | number>

/** 添加 next 参数的命令代码列表 */
export const ADD_NEXT_ARG_LIST: CommandCodeList = [
  CommandCode.bgm,
  CommandCode.pixi,
  CommandCode.pixiInit,
  CommandCode.miniAvatar,
  CommandCode.label,
  CommandCode.if,
  CommandCode.setVar,
  CommandCode.unlockCg,
  CommandCode.unlockBgm,
  CommandCode.filmMode,
  CommandCode.playEffect,
  CommandCode.setTransition,
  CommandCode.applyStyle,
]

/** 配置项 */
export type CommandCodeItem = { scriptString: string; scriptType: CommandCode | number }

export type { CommandCodeItem as ConfigItem }

/** 配置项Map */
export type CommandCodeMap = Map<string, CommandCodeItem>

export type { CommandCodeMap as ConfigMap }

/** 脚本配置 */
export const SCRIPT_CONFIG: Array<CommandCodeItem> = [
  { scriptString: 'say', scriptType: CommandCode.say },
  { scriptString: 'changeBg', scriptType: CommandCode.changeBg },
  { scriptString: 'changeFigure', scriptType: CommandCode.changeFigure },
  { scriptString: 'bgm', scriptType: CommandCode.bgm },
  { scriptString: 'playVideo', scriptType: CommandCode.video },
  { scriptString: 'pixiPerform', scriptType: CommandCode.pixi },
  { scriptString: 'pixiInit', scriptType: CommandCode.pixiInit },
  { scriptString: 'intro', scriptType: CommandCode.intro },
  { scriptString: 'miniAvatar', scriptType: CommandCode.miniAvatar },
  { scriptString: 'changeScene', scriptType: CommandCode.changeScene },
  { scriptString: 'choose', scriptType: CommandCode.choose },
  { scriptString: 'end', scriptType: CommandCode.end },
  { scriptString: 'setComplexAnimation', scriptType: CommandCode.setComplexAnimation },
  { scriptString: 'setFilter', scriptType: CommandCode.setFilter },
  { scriptString: 'label', scriptType: CommandCode.label },
  { scriptString: 'jumpLabel', scriptType: CommandCode.jumpLabel },
  { scriptString: 'chooseLabel', scriptType: CommandCode.chooseLabel },
  { scriptString: 'setVar', scriptType: CommandCode.setVar },
  { scriptString: 'if', scriptType: CommandCode.if },
  { scriptString: 'callScene', scriptType: CommandCode.callScene },
  { scriptString: 'showVars', scriptType: CommandCode.showVars },
  { scriptString: 'unlockCg', scriptType: CommandCode.unlockCg },
  { scriptString: 'unlockBgm', scriptType: CommandCode.unlockBgm },
  { scriptString: 'filmMode', scriptType: CommandCode.filmMode },
  { scriptString: 'setTextbox', scriptType: CommandCode.setTextbox },
  { scriptString: 'setAnimation', scriptType: CommandCode.setAnimation },
  { scriptString: 'playEffect', scriptType: CommandCode.playEffect },
  { scriptString: 'setTempAnimation', scriptType: CommandCode.setTempAnimation },
  // comment
  { scriptString: 'setTransform', scriptType: CommandCode.setTransform },
  { scriptString: 'setTransition', scriptType: CommandCode.setTransition },
  { scriptString: 'getUserInput', scriptType: CommandCode.getUserInput },
  { scriptString: 'applyStyle', scriptType: CommandCode.applyStyle },
  { scriptString: 'wait', scriptType: CommandCode.wait },
]

/** WebGAL 配置选项接口 */
export interface WebgalConfigItemOption {
  key: string
  value: string | number | boolean
}

export type { WebgalConfigItemOption as IOptionItem }

/** WebGAL 配置项接口 */
export interface WebgalConfigItem {
  command: string
  args: Array<string>
  options: Array<WebgalConfigItemOption>
}

export type { WebgalConfigItem as IConfigItem }

/** WebGAL 配置 */
export type WebgalConfig = Array<WebgalConfigItem>

export interface WebGALStyle {
  classNameStyles: Record<string, string>
  others: string
}

export type { WebGALStyle as IWebGALStyleObj }
