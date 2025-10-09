import { type Parser, type ParserOptions, type ParserPlugin } from './config'
import { defineParserConfig } from './config'
import { createPreParser } from './pre'
import { pipe } from './utils'

/**
 * 创建解析器
 * @param userOptions 用户选项
 * @returns 解析器
 * @pure
 */
export const createParser = (userOptions?: ParserOptions): Parser => {
  const useConfig = defineParserConfig(userOptions)
  const _preParser = createPreParser(useConfig())

  return {
    preParser: _preParser,

    plugins: [],

    use(plugin: ParserPlugin) {
      this.plugins.push(plugin)
      return this
    },

    preParse(str) {
      return this.preParser.parse(str)
    },

    parse(rawArticle) {
      const initialSections = this.preParser.parse(rawArticle.str)
      const initialArticle = {
        name: rawArticle.name,
        url: rawArticle.url,
        sections: initialSections,
        raw: rawArticle.str,
      }
      return pipe(...this.plugins)(initialArticle)
    },

    stringify(input, options = { raw: false }) {
      return Array.isArray(input)
        ? this.preParser.stringify(input, options)
        : options.raw
          ? input.raw
          : this.preParser.stringify(input.sections, { raw: false })
    },
  }
}
