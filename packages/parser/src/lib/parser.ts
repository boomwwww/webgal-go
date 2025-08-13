import {
  type PreParserConfig,
  type ParserConfig,
  type CompleteParserConfig,
  type PluginParse,
  type PluginParserLike,
  defaultPreParserConfig,
  defaultParserConfig,
  type Scene,
  type Sentence,
} from './config';
import { createPreParser } from './pre';
import { pipe } from './utils';

export type Parser = {
  parse: (rawScene: { name: string; url: string; str: string }) => Scene;
  stringify: (input: Scene | Array<Sentence>, options?: unknown) => string;
  preParse: (str: string) => Array<Sentence>;
  plugins: Record<string, PluginParse>;
};

const getMergedConfig = (userConfig?: ParserConfig): CompleteParserConfig => {
  const merged = { ...defaultParserConfig };
  if (!userConfig) return merged;
  if (userConfig.preParserConfig) {
    merged.preParserConfig = {
      ...merged.preParserConfig,
      ...userConfig.preParserConfig,
    };
  }
  if (userConfig.plugins) {
    merged.plugins = [...merged.plugins, ...userConfig.plugins];
  }
  if (userConfig.pluginParsers) {
    merged.pluginParsers = [...merged.pluginParsers, ...userConfig.pluginParsers];
  }
  return merged;
};

export const createParser = (parserConfig?: ParserConfig): Parser => {
  const config = getMergedConfig(parserConfig);
  const { preParserConfig } = config;
  const preParser = createPreParser(preParserConfig);
  const pluginParseList = config.pluginParsers
    .map((plugin) => getPluginParse(config, plugin))
    .filter((p) => p !== null);
  const pluginParse = pipe(...pluginParseList);
  return {
    parse: (rawScene) => {
      const { name, url, str } = rawScene;
      const initialStenceList = preParser.parse(str);
      const initialScene: Scene = {
        name: name,
        url: url,
        sentenceList: initialStenceList,
        raw: str,
      };
      return pluginParse(initialScene);
    },

    stringify: (input: Scene | Array<Sentence>, options?: unknown) => {
      if (options) return '';
      let arr = input;
      let result = '';
      if (!(input instanceof Array)) {
        arr = input.sentenceList;
      }
      (arr as Array<Sentence>).forEach((sentence) => {
        result += sentence.str;
      });
      return result;
    },

    preParse: (str: string) => {
      return preParser.parse(str);
    },

    plugins: (() => {
      const result: { [key: string]: PluginParse } = {};
      config.plugins.forEach((plugin) => {
        result[plugin.name] = plugin.parse;
      });
      return result;
    })(),
  };
};

const getPluginParse = (config: CompleteParserConfig, inputPlugin: PluginParserLike): PluginParse | null => {
  if (typeof inputPlugin === 'string') {
    return config.plugins.find((plugin) => plugin.name === inputPlugin)?.parse ?? null;
  } else if (typeof inputPlugin === 'object' && inputPlugin !== null && 'parse' in inputPlugin) {
    return inputPlugin.parse;
  } else if (typeof inputPlugin === 'function') {
    return inputPlugin;
  }
  return null;
};

const getPluginParse0 = (inputPlugin: PluginParserLike): PluginParse | null => {
  if (typeof inputPlugin === 'object' && inputPlugin !== null && 'parse' in inputPlugin) {
    return inputPlugin.parse;
  } else if (typeof inputPlugin === 'function') {
    return inputPlugin;
  }
  return null;
};

export const createParserFactory = () => {
  let config: PreParserConfig = { ...defaultPreParserConfig };
  const plugins: Array<PluginParserLike> = [];
  const parserFactory = {
    setConfig: (userConfig: PreParserConfig): void => {
      config = userConfig; // todo
    },
    use: (inputPlugin: PluginParserLike): void => {
      plugins.push(inputPlugin);
    },
    create: (): Parser => {
      const preParser = createPreParser(config);
      const pluginParseList = plugins.map((plugin) => getPluginParse0(plugin)).filter((p) => p !== null);
      const pluginParse = pipe(...pluginParseList);
      return {
        parse: (rawScene) => {
          const { name, url, str } = rawScene;
          const initialStenceList = preParser.parse(str);
          const initialScene: Scene = {
            name: name,
            url: url,
            sentenceList: initialStenceList,
            raw: str,
          };
          return pluginParse(initialScene);
        },

        stringify: (input: Scene | Array<Sentence>, options?: unknown) => {
          if (options) return '';
          let arr = input;
          let result = '';
          if (!(input instanceof Array)) {
            arr = input.sentenceList;
          }
          (arr as Array<Sentence>).forEach((sentence) => {
            result += sentence.str;
          });
          return result;
        },

        preParse: (str: string) => {
          return preParser.parse(str);
        },

        plugins: {},
      };
    },
  };
  return parserFactory;
};

const pf = createParserFactory();
pf.setConfig({});
pf.use('test-plugin');
const SceneParser = pf.create();
