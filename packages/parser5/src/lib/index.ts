import type { WebgalScript } from './types'

/**
 * 创建一个解析器
 * @pure
 */
export const createParser = (userOptions: WebgalScript.ParserOptions): WebgalScript.Parser => {
  return {
    parse(rawArticle) {
      return rawArticle as unknown as WebgalScript.Article
    },
    stringify(input) {
      return input as unknown as string
    },
  }
}
