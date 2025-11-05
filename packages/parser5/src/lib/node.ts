import { WebgalScript } from './types'

/**
 * 解析nodes
 * @pure
 */
export const parse = (tokens: WebgalScript.Token[], options: WebgalScript.Parser.Options): WebgalScript.Node[] => {
  const ctx = createContext(tokens, options)

  while (!ctx.done) {
    next(ctx)
  }

  return ctx.nodes
}

/**
 * 解析上下文
 */
type Context = {
  state: 'new' | 'blank' | 'unquoted' | 'quote' | 'comment'
  tokens: WebgalScript.Token[]
  p0: number
  p1: number
  nodes: WebgalScript.Node[]
  done: boolean
}

/**
 * 创建一个解析上下文
 * @param raw 待解析的字符串
 * @param options 解析选项
 * @returns 解析上下文
 * @pure
 */
const createContext = (tokens: WebgalScript.Token[], options: WebgalScript.Parser.Options): Context => {
  return {
    state: 'new',
    tokens: [],
    p0: 0,
    p1: 0,
    nodes: [],
    done: false,
  }
}

const next = (context: Context): void => {}
