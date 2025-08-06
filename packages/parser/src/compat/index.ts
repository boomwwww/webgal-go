import { fileType } from './config';
import type { ConfigMap, ConfigItem, IAsset, WebgalConfig, IWebGALStyleObj } from './config';
import { scss2cssinjsParser } from './utils';
import { createParser, defineParserConfig, plugins } from '../lib';

import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from './config';
import { sceneTextPreProcess, getCompatScene } from './utils';

export class SceneParser {
  private readonly assetsPrefetcher: (assetList: IAsset[]) => void;
  private readonly assetSetter: (fileName: string, assetType: fileType) => string;
  private readonly ADD_NEXT_ARG_LIST: number[];
  private readonly SCRIPT_CONFIG_MAP: ConfigMap;
  private readonly parser: ReturnType<typeof createParser>;
  constructor(
    assetsPrefetcher: (assetList: IAsset[]) => void,
    assetSetter: (fileName: string, assetType: fileType) => string,
    ADD_NEXT_ARG_LIST: number[],
    SCRIPT_CONFIG_INPUT: ConfigItem[] | ConfigMap,
    parserConfig?: Parameters<typeof createParser>[0]
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
    this.parser = createParser(
      defineParserConfig({
        assetsPrefetcher: this.assetsPrefetcher,
        assetSetter: this.assetSetter,
        addNextArgList: this.ADD_NEXT_ARG_LIST,
        scriptConfigMap: this.SCRIPT_CONFIG_MAP,
        parserConfig,
      })
    );
  }
  /**
   * 解析场景
   * @param rawScene 原始场景
   * @param sceneName 场景名称
   * @param sceneUrl 场景url
   * @return 解析后的场景
   */
  parse(rawScene: string, sceneName: string, sceneUrl: string) {
    const parsedScene = this.parser.parse({
      str: rawScene,
      name: sceneName,
      url: sceneUrl,
    });
    return getCompatScene(parsedScene);
  }

  parseConfig(configText: string): WebgalConfig {
    let config = this.parser.parse({
      str: configText,
      name: '@config',
      url: '@config',
    });
    config = plugins.trimPlugin.parse(config);
    // config = this.parser.plugins.trimPlugin(config);
    config = plugins
      .createDequotationPlugin([
        ["'", "'"],
        ['"', '"'],
        ['`', '`'],
      ])
      .parse(config);
    // config = this.parser.plugins.dequotation(config);
    config = plugins.attributePlugin.parse(config);
    return config.sentenceList.map((e) => ({
      command: e.header,
      args: e.body
        .split('|')
        .map((e) => e.trim())
        .filter((e) => e !== ''),
      options: e.attributes,
    }));
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
