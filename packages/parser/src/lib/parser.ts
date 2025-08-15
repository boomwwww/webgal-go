import { type Parser, type ParserConfig, type ParserPlugin } from './config';
import { createPreParser } from './pre';
import { pipe } from './utils';

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
          const initialSections = _preParser.parse(rawArticle.str);
          const initialArticle = {
            name: rawArticle.name,
            url: rawArticle.url,
            sections: initialSections,
            raw: rawArticle.str,
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
