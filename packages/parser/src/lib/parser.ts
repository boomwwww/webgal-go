import type { Article, Section, ParserConfig } from './config';
import { createPreParser } from './pre';
import { pipe } from './utils';

export type Parser = {
  preParse: (str: string) => Array<Section>;
  parse: (rawArticle: { name: string; url: string; str: string }) => Article;
  stringify: (input: Article | Array<Section>, options?: { raw: boolean }) => string;
};

export type ParserPlugin = (input: Article) => Article;

export const createParserFactory = (parserConfig?: ParserConfig) => {
  let _parserConfig: ParserConfig | undefined = parserConfig;

  const _plugins: Array<ParserPlugin> = [];

  const parserFactory = {
    setConfig: (config?: ParserConfig): void => {
      _parserConfig = config;
    },

    use: (plugin: ParserPlugin): void => {
      _plugins.push(plugin);
    },

    create: (): Parser => {
      const preParser = createPreParser(_parserConfig);
      const pluginParse = pipe(..._plugins);
      return {
        preParse: (str) => {
          return preParser.parse(str);
        },

        parse: (rawArticle) => {
          const { name, url, str } = rawArticle;
          const initialSections = preParser.parse(str);
          const initialArticle: Article = {
            name: name,
            url: url,
            sections: initialSections,
            raw: str,
          };
          return pluginParse(initialArticle);
        },

        stringify: (input, options = { raw: false }) => {
          if (Array.isArray(input)) {
            return preParser.stringify(input, options);
          } else {
            if (options.raw) return input.raw;
            return preParser.stringify(input.sections, options);
          }
        },
      };
    },
  };

  return parserFactory;
};
