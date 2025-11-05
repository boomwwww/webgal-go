import { WebgalScript } from './types'

/**
 * 解析tokens
 * @pure
 */
export const parse = (raw: string, options: WebgalScript.Parser.Options): WebgalScript.Token[] => {
  const ctx = createContext(raw, options)

  while (!ctx.done) {
    next(ctx)
  }

  return ctx.tokens
}

type Context = {
  state: 'new' | 'blank' | 'unquoted' | 'quote' | 'comment'
  raw: string
  quotationMarks: WebgalScript.Parser.Options.QuotationMark[]
  commentSymbols: WebgalScript.Parser.Options.CommentSymbol[]
  p0: number
  p1: number
  current: { isMultiLine: boolean; start: string; end: string }
  tokens: WebgalScript.Token[]
  done: boolean
}

const createContext = (raw: string, options: WebgalScript.Parser.Options): Context => {
  const defaultQuotationMarks: WebgalScript.Parser.Options.QuotationMark[] = [
    {
      isMultiLine: true,
      start: '"""',
      end: '"""',
    },
    {
      isMultiLine: true,
      start: "'''",
      end: "'''",
    },
    {
      isMultiLine: true,
      start: '```',
      end: '```',
    },
    {
      isMultiLine: false,
      start: '"',
      end: '"',
    },
    {
      isMultiLine: false,
      start: "'",
      end: "'",
    },
    {
      isMultiLine: false,
      start: '`',
      end: '`',
    },
  ]
  const defaultCommentSymbols: WebgalScript.Parser.Options.CommentSymbol[] = [
    {
      isMultiLine: false,
      start: ';',
    },
    {
      isMultiLine: false,
      start: '//',
    },
    {
      isMultiLine: true,
      start: '/*',
      end: '*/',
    },
  ]
  return {
    state: 'new',
    raw,
    quotationMarks: [...(options.customQuotationMarks ?? []), ...defaultQuotationMarks],
    commentSymbols: [...(options.customCommentSymbols ?? []), ...defaultCommentSymbols],
    p0: 0,
    p1: 0,
    current: {
      isMultiLine: false,
      start: '',
      end: '',
    },
    tokens: [],
    done: false,
  }
}

/**
 * 执行下一步
 * @param ctx 上下文对象
 * @mutates ctx
 */
const next = (ctx: Context) => {
  if (ctx.raw.length === 0) {
    ctx.done = true
    return
  }

  switch (ctx.state) {
    case 'new': {
      if (ctx.p0 >= ctx.raw.length) {
        ctx.done = true
        return
      }

      if ([' ', '\t', '\n', '\r'].includes(ctx.raw[ctx.p0])) {
        ctx.state = 'blank'
        return
      }

      const matchedQuotationMark = ctx.quotationMarks.find((q) => ctx.raw.slice(ctx.p0).startsWith(q.start))
      if (matchedQuotationMark !== undefined) {
        ctx.state = 'quote'
        ctx.current.start = matchedQuotationMark.start
        ctx.p1 += matchedQuotationMark.start.length
        return
      }

      const matchedCommentSymbol = ctx.commentSymbols.find((c) => ctx.raw.slice(ctx.p0).startsWith(c.start))
      if (matchedCommentSymbol !== undefined) {
        ctx.state = 'comment'
        ctx.current.start = matchedCommentSymbol.start
        ctx.p1 += matchedCommentSymbol.start.length
        return
      }

      ctx.state = 'unquoted'
      return
    }

    case 'blank': {
      if (ctx.p1 >= ctx.raw.length) {
        ctx.p1--
        push(ctx)
        ctx.done = true
        return
      }

      if (![' ', '\t', '\n', '\r'].includes(ctx.raw[ctx.p1])) {
        ctx.p1--
        push(ctx)
        return
      }

      if (ctx.raw[ctx.p1] === '\\') {
        throw new Error('Escape character `\\` is not supported here')
      }

      ctx.p1++
      return
    }

    case 'unquoted': {
      if (ctx.raw[ctx.p1] === '\\') {
        throw new Error('Escape character `\\` is not supported here')
      }

      push(ctx)
      return
    }

    case 'quote': {
      if (ctx.p1 >= ctx.raw.length) {
        throw new Error('Unclosed quote')
      }

      let quotationMarks = ctx.quotationMarks.filter((q) => q.start === ctx.current.start)

      if (['\n', '\r'].includes(ctx.raw[ctx.p1])) {
        quotationMarks = quotationMarks.filter((q) => q.isMultiLine)
        if (quotationMarks.length === 0) {
          throw new Error('Unclosed quote')
        }
        ctx.current.isMultiLine = true
      }

      if (ctx.raw[ctx.p1] === '\\') {
        ctx.p1++
        return
      }

      const matchedQuotationMark = quotationMarks.find((q) => ctx.raw.slice(ctx.p1).startsWith(q.end))

      if (matchedQuotationMark !== undefined) {
        ctx.current.end = matchedQuotationMark.end
      }
    }
    case 'comment': {
      break
    }

    default: {
      throw new Error(`Invalid state: ${ctx.state}`)
    }
  }
}

/**
 * 添加当前内容到结果数组
 * @param ctx 上下文对象
 * @mutates ctx
 */
const push = (ctx: Context): void => {
  switch (ctx.state) {
    case 'blank': {
      ctx.tokens.push({
        type: 'blank',
        raw: ctx.raw.slice(ctx.p0, ctx.p1 + 1),
      })
      ctx.p0 = ctx.p1 + 1
      ctx.p1 = ctx.p0
      ctx.state = 'new'
      break
    }
    case 'unquoted': {
      ctx.tokens.push({
        type: 'unquoted',
        raw: ctx.raw.slice(ctx.p0, ctx.p1 + 1),
      })
      ctx.p0 = ctx.p1 + 1
      ctx.p1 = ctx.p0
      ctx.state = 'new'
      break
    }
    case 'quote': {
      if (ctx.current.end === '') {
        throw new Error(`Invalid quote: ${ctx.raw.slice(ctx.p0, ctx.p1 + 1)}`)
      }
      ctx.tokens.push({
        type: 'quote',
        raw: ctx.raw.slice(ctx.p0, ctx.p1 + 1),
        start: ctx.current.start,
        end: ctx.current.end,
      })
      ctx.current.isMultiLine = false
      ctx.current.start = ''
      ctx.current.end = ''
      ctx.p0 = ctx.p1 + 1
      ctx.p1 = ctx.p0
      ctx.state = 'new'
      break
    }
    case 'comment': {
      ctx.tokens.push({
        type: 'comment',
        raw: ctx.raw.slice(ctx.p0, ctx.p1 + 1),
        start: ctx.current.start,
        end: ctx.current.end,
      })
      ctx.current.isMultiLine = false
      ctx.current.start = ''
      ctx.current.end = ''
      ctx.p0 = ctx.p1 + 1
      ctx.p1 = ctx.p0
      ctx.state = 'new'
      break
    }
    default:
      throw new Error(`Invalid state: ${ctx.state}`)
  }
}
