import type { PreParserConfig, ParserPlugin, Article, Section } from './config';
import { createPreParser } from './pre';
import { pipe } from './utils';

export type Parser = {
  preParse: (str: string) => Array<Section>;
  parse: (rawArticle: { name: string; url: string; str: string }) => Article;
  stringify: (input: Article | Array<Section>, options?: { raw: boolean }) => string;
};

export const createParserFactory = () => {
  let preParserConfig: PreParserConfig | undefined = undefined;

  const plugins: Array<ParserPlugin> = [];

  const parserFactory = {
    setConfig: (config: PreParserConfig): void => {
      preParserConfig = config;
    },

    use: (plugin: ParserPlugin): void => {
      plugins.push(plugin);
    },

    create: (): Parser => {
      const preParser = createPreParser(preParserConfig);
      const pluginParse = pipe(...plugins);
      return {
        preParse: (str: string) => {
          return preParser.parse(str);
        },

        parse: (rawArticle) => {
          const { name, url, str } = rawArticle;
          const initialSectionList = preParser.parse(str);
          const initialArticle: Article = {
            name: name,
            url: url,
            sectionList: initialSectionList,
            raw: str,
          };
          return pluginParse(initialArticle);
        },

        stringify: (input: Article | Array<Section>, options = { raw: false }) => {
          if (Array.isArray(input)) return preParser.stringify(input, options);
          if (options.raw) return input.raw;
          return preParser.stringify(input.sectionList, options);
        },
      };
    },
  };

  return parserFactory;
};
