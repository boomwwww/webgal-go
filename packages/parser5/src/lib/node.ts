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
  state: 'new' | 'auxiliary' | 'sentence'
  subState: '' | 'quote-start' | 'unquoted-start'
  tokens: WebgalScript.Token[]
  endOfSentence: WebgalScript.Parser.Options.EndOfSentence[]
  p0: number
  p1: number
  current: { head: WebgalScript.Token[]; body: WebgalScript.Token[]; attributes: WebgalScript.Token[][] }
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
  const defaultEndOfSentence = [';']
  return {
    state: 'new',
    subState: '',
    tokens: [],
    endOfSentence: [...(options.customEndOfSentence ?? []), ...defaultEndOfSentence],
    p0: 0,
    p1: 0,
    current: { head: [], body: [], attributes: [] },
    nodes: [],
    done: false,
  }
}

const next = (context: Context): void => {}

const pushAuxiliary = (context: Context, node: WebgalScript.Node): void => {
  context.nodes.push(node)
}

const pushSentence = (context: Context, node: WebgalScript.Node): void => {
  context.nodes.push(node)
}
