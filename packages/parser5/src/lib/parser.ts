import { WebgalScript } from './types'
import * as Token from './token'
import * as Node from './node'
import * as Sentence from './sentence'

/**
 * 创建一个解析器
 * @pure
 */
export const createParser = (userOptions?: WebgalScript.Parser.Options): WebgalScript.Parser => {
  checkOptions(userOptions ?? {})
  return {
    options: userOptions ?? {},
    tokenParse(raw) {
      return Token.parse(raw, this.options)
    },
    nodeParse(tokens) {
      return Node.parse(tokens, this.options)
    },
    sentenceParse(nodes) {
      return Sentence.parse(nodes, this.options)
    },
    parse(raw) {
      return this.sentenceParse(this.nodeParse(this.tokenParse(raw)))
    },
  }
}

const checkOptions = (options: WebgalScript.Parser.Options) => {
  const { customQuotationMarks, customCommentSymbols } = options
  if (customQuotationMarks !== undefined) {
    customQuotationMarks.forEach((q) => {
      if (q.start === '') throw new Error('Invalid quotation mark: start cannot be empty')
      if (q.end === '') throw new Error('Invalid quotation mark: end cannot be empty')
      if (q.start.includes('\\')) throw new Error('Invalid quotation mark: start cannot contain escape character')
      if (q.end.includes('\\')) throw new Error('Invalid quotation mark: end cannot contain escape character')
      if (q.start.includes(' ')) throw new Error('Invalid quotation mark: start cannot contain space')
      if (q.end.includes(' ')) throw new Error('Invalid quotation mark: end cannot contain space')
      if (q.start.includes('\t')) throw new Error('Invalid quotation mark: start cannot contain tab')
      if (q.end.includes('\t')) throw new Error('Invalid quotation mark: end cannot contain tab')
      if (q.start.includes('\n')) throw new Error('Invalid quotation mark: start cannot contain new line')
      if (q.end.includes('\n')) throw new Error('Invalid quotation mark: end cannot contain new line')
      if (q.start.includes('\r')) throw new Error('Invalid quotation mark: start cannot contain new line')
      if (q.end.includes('\r')) throw new Error('Invalid quotation mark: end cannot contain new line')
    })
  }
  if (customCommentSymbols !== undefined) {
    customCommentSymbols.forEach((c) => {
      if (c.isMultiLine) {
        if (c.start === '') throw new Error('Invalid comment symbol: start cannot be empty')
        if (c.end === '') throw new Error('Invalid comment symbol: end cannot be empty')
        if (c.start.includes('\\')) throw new Error('Invalid comment symbol: start cannot contain escape character')
        if (c.end.includes('\\')) throw new Error('Invalid comment symbol: end cannot contain escape character')
        if (c.start.includes(' ')) throw new Error('Invalid comment symbol: start cannot contain space')
        if (c.end.includes(' ')) throw new Error('Invalid comment symbol: end cannot contain space')
        if (c.start.includes('\t')) throw new Error('Invalid comment symbol: start can not contain tab')
        if (c.end.includes('\t')) throw new Error('Invalid comment symbol: end can not contain tab')
        if (c.start.includes('\n')) throw new Error('Invalid comment symbol: start cannot contain new line')
        if (c.end.includes('\n')) throw new Error('Invalid comment symbol: end cannot contain new line')
        if (c.start.includes('\r')) throw new Error('Invalid comment symbol: start cannot contain carriage return')
        if (c.end.includes('\r')) throw new Error('Invalid comment symbol: end cannot contain carriage return')
      } else {
        if (c.start === '') throw new Error('Invalid comment symbol: start cannot be empty')
        if (c.start.includes('\\')) throw new Error('Invalid comment symbol: start cannot contain escape character')
        if (c.start.includes(' ')) throw new Error('Invalid comment symbol: start cannot contain space')
        if (c.start.includes('\t')) throw new Error('Invalid comment symbol: start can not contain tab')
        if (c.start.includes('\n')) throw new Error('Invalid comment symbol: start can not contain new line')
        if (c.start.includes('\r')) throw new Error('Invalid comment symbol: start can not contain carriage return')
      }
    })
  }
}
