import { WebgalScript } from './types'

/**
 * 解析sentences
 * @pure
 */
export const parse = (nodes: WebgalScript.Node[], options: WebgalScript.Parser.Options): WebgalScript.Sentence[] => {
  return nodes.filter((node) => node.type === 'sentence') as unknown as WebgalScript.Sentence[]
}
