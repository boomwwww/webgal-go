import { type Parser, type ParserOptions, type ParserPlugin } from './config'
import { defineParserConfig } from './config'
import { createPreParser } from './pre'
import { pipe } from './utils'

/**
 * 创建解析器
 * @param parserOptions 解析器配置
 * @returns 解析器
 * @pure
 */
export const createParser = (parserOptions?: ParserOptions): Parser => {
  const _config = defineParserConfig(parserOptions)

  const _preParser = createPreParser(_config)

  return {
    _config,

    _preParser,

    use(plugin: ParserPlugin) {
      this._config.plugins.push(plugin)
      return this
    },

    preParse(str) {
      return this._preParser.parse(str)
    },

    parse(rawArticle) {
      const initialSections = this._preParser.parse(rawArticle.str)
      const initialArticle = {
        name: rawArticle.name,
        url: rawArticle.url,
        sections: initialSections,
        raw: rawArticle.str,
      }
      return pipe(...this._config.plugins)(initialArticle)
    },

    stringify(input, options = { raw: false }) {
      return Array.isArray(input)
        ? this._preParser.stringify(input, options)
        : options.raw
          ? input.raw
          : this._preParser.stringify(input.sections, { raw: false })
    },
  }
}
