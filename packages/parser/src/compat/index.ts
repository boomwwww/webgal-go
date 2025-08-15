import { type Parser } from '@/lib/config';
import { createParserFactory } from '@/lib/parser';

import { type AssetsPrefetcher, type AssetSetter } from './config';
import { type CommandCodeList, type CommandCodeItem, type CommandCodeMap } from './config';
import { type SceneParserOptions } from './config';

import { type WebgalConfig, configParser } from './utils';
import { type WebGALStyle, styleParser } from './utils';

import { compatParserConfig } from './config';
import { createCompatPlugin } from './plugins';
import { getCompatScene } from './utils';

export class SceneParser {
  private readonly assetsPrefetcher: AssetsPrefetcher;
  private readonly assetSetter: AssetSetter;
  private readonly ADD_NEXT_ARG_LIST: CommandCodeList;
  private readonly SCRIPT_CONFIG_MAP: CommandCodeMap;
  private readonly parser: Parser;

  constructor(
    assetsPrefetcher: AssetsPrefetcher,
    assetSetter: AssetSetter,
    ADD_NEXT_ARG_LIST: CommandCodeList,
    SCRIPT_CONFIG_INPUT: Array<CommandCodeItem> | CommandCodeMap,
    options?: SceneParserOptions
  ) {
    this.assetsPrefetcher = assetsPrefetcher;

    this.assetSetter = assetSetter;

    this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;

    if (Array.isArray(SCRIPT_CONFIG_INPUT)) {
      this.SCRIPT_CONFIG_MAP = new Map();
      SCRIPT_CONFIG_INPUT.forEach((config) => {
        this.SCRIPT_CONFIG_MAP.set(config.scriptString, config);
      });
    } else {
      this.SCRIPT_CONFIG_MAP = SCRIPT_CONFIG_INPUT;
    }

    const parserFactory = createParserFactory(options?.config ?? compatParserConfig);
    if (Array.isArray(options?.plugins)) {
      for (const plugin of options.plugins) {
        parserFactory.use(plugin);
      }
    } else {
      parserFactory.use(
        createCompatPlugin({
          assetsPrefetcher: this.assetsPrefetcher,
          assetSetter: this.assetSetter,
          addNextArgList: this.ADD_NEXT_ARG_LIST,
          scriptConfigMap: this.SCRIPT_CONFIG_MAP,
          prePlugins: options?.plugins?.pre,
          middlePlugins: options?.plugins?.middle,
          postPlugins: options?.plugins?.post,
        })
      );
    }
    this.parser = parserFactory.create();
  }

  /**
   * 解析场景
   * @param rawScene 原始场景
   * @param sceneName 场景名称
   * @param sceneUrl 场景url
   * @return 解析后的场景
   */
  parse(rawScene: string, sceneName: string, sceneUrl: string) {
    const parsed = this.parser.parse({
      str: rawScene,
      name: sceneName,
      url: sceneUrl,
    });
    return getCompatScene(parsed);
  }

  parseConfig(configText: string): WebgalConfig {
    return configParser.parse(configText);
  }

  stringifyConfig(config: WebgalConfig): string {
    return configParser.stringify(config);
  }

  parseScssToWebgalStyleObj(scssString: string): WebGALStyle {
    return styleParser.parse(scssString);
  }
}

export { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from './config';
export { sceneTextPreProcess } from './utils';

export { type CompatArticle, type CompatSection } from './config';
export { type Scene, type Sentence, type Arg } from './config';
export { type IScene, type ISentence, type arg } from './config';
export { type IAsset, fileType } from './config';
export { type Asset, FileCode } from './config';
export { type AssetsPrefetcher, type AssetSetter } from './config';
export { CommandCode, type CommandCodeList } from './config';
export { commandType } from './config';
export { type CommandCodeItem, type CommandCodeMap } from './config';
export { type ConfigItem, type ConfigMap } from './config';
export { compatParserConfig } from './config';
export { type WebgalConfigItemOption, type WebgalConfigItem, type WebgalConfig, configParser } from './utils';
export { type IOptionItem, type IConfigItem } from './utils';
export { type WebGALStyle, styleParser } from './utils';
export { type IWebGALStyleObj } from './utils';
export * as compatPlugins from './plugins';
