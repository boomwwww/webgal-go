export namespace WebgalScript {
  export namespace Token {
    export type Type = 'blank' | 'unquoted' | 'quote' | 'comment'
    export interface Base {
      type: Type
      raw: string
    }
    export interface Blank extends Base {
      type: 'blank'
    }
    export interface Unquoted extends Base {
      type: 'unquoted'
    }
    export interface Quote extends Base {
      type: 'quote'
      start: string
      end: string
    }
    export interface Comment extends Base {
      type: 'comment'
      start: string
      end: string
    }
  }
  export type Token = Token.Blank | Token.Unquoted | Token.Quote | Token.Comment

  export namespace Node {
    export type Type = 'auxiliary' | 'sentence'
    export interface Base {
      type: Type
    }
    export interface Auxiliary extends Base {
      type: 'auxiliary'
      token: Token
    }
    export interface Sentence extends Base {
      type: 'sentence'
      head: Token[]
      body: Token[]
      attributes: Token[][]
    }
  }
  export type Node = Node.Auxiliary | Node.Sentence

  export namespace Sentence {
    export type Head =
      | {
          hasHead: false
        }
      | {
          hasHead: true
          quoted: boolean
          content: string
        }
    export interface Body {
      quoted: boolean
      content: string
    }
    export interface Attribute {
      key: {
        quoted: boolean
        content: string
      }
      value: {
        quoted: boolean
        content: string
      }
    }
  }
  export interface Sentence {
    head: Sentence.Head
    body: Sentence.Body
    attributes: Sentence.Attribute[]
  }

  export namespace Parser {
    export namespace Options {
      export interface QuotationMark {
        start: string
        end: string
        isMultiLine: boolean
      }
      export interface SingleLineCommentSymbol {
        isMultiLine: false
        start: string
      }
      export interface MultiLineCommentSymbol {
        isMultiLine: true
        start: string
        end: string
      }
      export type CommentSymbol = SingleLineCommentSymbol | MultiLineCommentSymbol
      export type EndOfSentence = string
    }
    export interface Options {
      customQuotationMarks?: Options.QuotationMark[]
      customCommentSymbols?: Options.CommentSymbol[]
      customEndOfSentence?: Options.EndOfSentence[]
    }
  }
  export interface Parser {
    options: Parser.Options
    tokenParse(raw: string): Token[]
    nodeParse(tokens: Token[]): Node[]
    sentenceParse(nodes: Node[]): Sentence[]
    parse(raw: string): Sentence[]
  }
}
