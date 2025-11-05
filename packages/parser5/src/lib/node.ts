import { WebgalScript } from './types'

/**
 * 解析tokens
 * @pure
 */
export const parse = (tokens: WebgalScript.Token[], options: WebgalScript.Parser.Options) => {
  return tokens as unknown as WebgalScript.Node[]
}
