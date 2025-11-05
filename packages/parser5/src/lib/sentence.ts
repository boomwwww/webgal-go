import { WebgalScript } from './types'

/**
 * 解析tokens
 * @pure
 */
export const parse = (nodes: WebgalScript.Node[], options: WebgalScript.Parser.Options): WebgalScript.Sentence[] => {
  return nodes as unknown as Array<WebgalScript.Sentence>
}
