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

  return {
    setConfig: (config?: ParserConfig): void => {
      _parserConfig = config;
    },

    use: (plugin: ParserPlugin): void => {
      _plugins.push(plugin);
    },

    create: (): Parser => {
      const _preParser = createPreParser(_parserConfig);

      const _pluginParse = pipe(..._plugins);

      return {
        preParse: (str) => {
          return _preParser.parse(str);
        },

        parse: (rawArticle) => {
          const { name, url, str } = rawArticle;
          const initialSections = _preParser.parse(str);
          const initialArticle: Article = {
            name: name,
            url: url,
            sections: initialSections,
            raw: str,
          };
          return _pluginParse(initialArticle);
        },

        stringify: (input, options = { raw: false }) =>
          Array.isArray(input)
            ? _preParser.stringify(input, options)
            : options.raw
            ? input.raw
            : _preParser.stringify(input.sections, { raw: false }),
      };
    },
  };
};
