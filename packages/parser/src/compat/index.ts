import { type ParserConfig } from '@/lib/config';
import { type Parser, createParserFactory } from '@/lib/parser';

import type { AssetsPrefetcher, AssetSetter } from './config';
import type { CommandList, ConfigItem, ConfigMap } from './config';
import type { WebgalConfig } from './config';
import type { IWebGALStyleObj } from './config';

import { scss2cssinjsParser } from './utils';

import { compatParserConfig } from './config';
import { getCompatScene, parseTheConfig } from './utils';
import { createCompatPlugin } from './plugins';

import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from './config';
import { sceneTextPreProcess } from './utils';

export class SceneParser {
  private readonly assetsPrefetcher: AssetsPrefetcher;
  private readonly assetSetter: AssetSetter;
  private readonly ADD_NEXT_ARG_LIST: CommandList;
  private readonly SCRIPT_CONFIG_MAP: ConfigMap;
  private readonly parser: Parser;
  constructor(
    assetsPrefetcher: AssetsPrefetcher,
    assetSetter: AssetSetter,
    ADD_NEXT_ARG_LIST: CommandList,
    SCRIPT_CONFIG_INPUT: ConfigItem[] | ConfigMap,
    parserConfig?: ParserConfig
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

    const parserFactory = createParserFactory(parserConfig ?? compatParserConfig);
    parserFactory.use(
      createCompatPlugin({
        assetsPrefetcher: this.assetsPrefetcher,
        assetSetter: this.assetSetter,
        addNextArgList: this.ADD_NEXT_ARG_LIST,
        scriptConfigMap: this.SCRIPT_CONFIG_MAP,
      })
    );
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
    // todo
    return parseTheConfig(configText, this.parser);
  }

  stringifyConfig(config: WebgalConfig) {
    return config.reduce(
      (previousValue, curr) =>
        previousValue +
        (curr.command + ':') +
        curr.args.join('|') +
        curr.options.reduce((p, c) => `${p} -${c.key}=${c.value}`, '') +
        ';\n',
      ''
    );
  }

  parseScssToWebgalStyleObj(scssString: string): IWebGALStyleObj {
    return scss2cssinjsParser(scssString);
  }
}

export { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG };
export { sceneTextPreProcess };
