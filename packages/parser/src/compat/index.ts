import type { Parser, ParserConfig, ParserPlugin } from '@/lib/config';
import { createParserFactory } from '@/lib/parser';

import type { IScene } from './config';
import type { AssetsPrefetcher, AssetSetter } from './config';
import type { CommandCodeList, ConfigItem, ConfigMap } from './config';

import { type WebgalConfig, configParser } from './utils';
import { type IWebGALStyleObj, scssParser } from './utils';

import { compatParserConfig } from './config';
import { createCompatPlugin } from './plugins';
import { getCompatScene } from './utils';

export class SceneParser {
  private readonly assetsPrefetcher: AssetsPrefetcher;
  private readonly assetSetter: AssetSetter;
  private readonly ADD_NEXT_ARG_LIST: CommandCodeList;
  private readonly SCRIPT_CONFIG_MAP: ConfigMap;
  private readonly parser: Parser;

  constructor(
    assetsPrefetcher: AssetsPrefetcher,
    assetSetter: AssetSetter,
    ADD_NEXT_ARG_LIST: CommandCodeList,
    SCRIPT_CONFIG_INPUT: Array<ConfigItem> | ConfigMap,
    options?: { config?: ParserConfig; plugins?: Array<ParserPlugin> }
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
    if (options?.plugins !== undefined) {
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
  parse(rawScene: string, sceneName: string, sceneUrl: string): IScene {
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

  parseScssToWebgalStyleObj(scssString: string): IWebGALStyleObj {
    return scssParser.parse(scssString);
  }
}

export { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from './config';
export { sceneTextPreProcess } from './utils';

export type { IScene, ISentence, arg } from './config';
export type { CompatArticle, CompatSection } from './config';
export { type IAsset, fileType } from './config';
export type { AssetsPrefetcher, AssetSetter } from './config';
export { commandType, type CommandCodeList } from './config';
export type { ConfigItem, ConfigMap } from './config';
export { compatParserConfig } from './config';
export type { IOptionItem, IConfigItem, WebgalConfig } from './utils';
export type { IWebGALStyleObj } from './utils';
export * as compatPlugins from './plugins';
