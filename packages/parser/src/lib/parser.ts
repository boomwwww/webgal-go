import type { Article, Section, ParserConfig, CompleteParserConfig } from './config';
import { createPreParser } from './pre';
import { pipe } from './utils';

export type Parser = {
  preParse: (str: string) => Array<Section>;
  parse: (rawArticle: { name: string; url: string; str: string }) => Article;
  stringify: (input: Article | Array<Section>, options?: { raw: boolean }) => string;
  config: CompleteParserConfig;
};

export type ParserPlugin = (input: Article) => Article;

export const createParserFactory = (parserConfig?: ParserConfig) => {
  const _preParser = createPreParser(parserConfig);

  const _plugins: Array<ParserPlugin> = [];

  return {
    use: (plugin: ParserPlugin): void => {
      _plugins.push(plugin);
    },

    create: (): Parser => {
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

        stringify: (input, options = { raw: false }) => {
          return Array.isArray(input)
            ? _preParser.stringify(input, options)
            : options.raw
            ? input.raw
            : _preParser.stringify(input.sections, { raw: false });
        },

        config: _preParser.config,
      };
    },

    preParser: _preParser,
  };
};
